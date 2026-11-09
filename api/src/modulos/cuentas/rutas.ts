import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { enTransaccion, pool } from '../../db/conexion.js';
import { ErrorHttp, noEncontrado } from '../../errores.js';
import { revocarSesiones } from '../auth/sesiones.js';
import { cuentaConPausas, listarCuentas } from './consulta.js';

const fecha = z.iso.date();
const idParam = z.object({ id: z.uuid() });

export async function rutasCuentas(app: FastifyInstance) {
  app.get('/cuentas', async (pedido) => {
    const { estado } = z
      .object({ estado: z.enum(['pendiente', 'activa', 'desactivada']).optional() })
      .parse(pedido.query);
    return { items: await listarCuentas(estado) };
  });

  app.get('/cuentas/:id', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    return cuentaConPausas(id, pool, 'personal');
  });

  app.post('/cuentas/:id/aprobar', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const { rol } = z.object({ rol: z.enum(['operario', 'administrativo']) }).parse(pedido.body);
    await enTransaccion(async (c) => {
      const { rowCount } = await c.query(
        `UPDATE cuentas SET estado = 'activa', rol = $2, aprobada_en = now()
         WHERE id = $1 AND rol <> 'admin' AND estado = 'pendiente'`,
        [id, rol],
      );
      if (!rowCount) throw new ErrorHttp(409, 'ya_validada', 'Esta cuenta ya fue revisada');
      await c.query(
        `INSERT INTO eventos_cuenta (cuenta_id, evento, detalle, autor_id) VALUES ($1, 'aprobacion', $2, $3)`,
        [id, JSON.stringify({ rol }), pedido.cuenta.id],
      );
    });
    return cuentaConPausas(id);
  });

  app.post('/cuentas/:id/desactivar', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const { motivo } = z.object({ motivo: z.string().trim().min(1) }).parse(pedido.body);
    await enTransaccion(async (c) => {
      const { rowCount } = await c.query(
        `UPDATE cuentas SET estado = 'desactivada' WHERE id = $1 AND rol <> 'admin'`,
        [id],
      );
      if (!rowCount) throw noEncontrado();
      await c.query(
        `INSERT INTO eventos_cuenta (cuenta_id, evento, detalle, autor_id) VALUES ($1, 'desactivacion', $2, $3)`,
        [id, JSON.stringify({ motivo }), pedido.cuenta.id],
      );
      await revocarSesiones(id, c);
    });
    return cuentaConPausas(id);
  });

  app.post('/cuentas/:id/pausas', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const { desde, hasta } = z.object({ desde: fecha, hasta: fecha }).parse(pedido.body);
    if (hasta < desde) throw new ErrorHttp(400, 'datos_invalidos', 'La fecha final va después de la inicial');
    await enTransaccion(async (c) => {
      const cuenta = await c.query(`SELECT id FROM cuentas WHERE id = $1 AND rol <> 'admin' FOR NO KEY UPDATE`, [id]);
      if (!cuenta.rowCount) throw noEncontrado();
      await c.query('INSERT INTO pausas (cuenta_id, desde, hasta, autor_id) VALUES ($1, $2, $3, $4)', [
        id,
        desde,
        hasta,
        pedido.cuenta.id,
      ]);
      await c.query(
        `INSERT INTO eventos_cuenta (cuenta_id, evento, detalle, autor_id) VALUES ($1, 'pausa', $2, $3)`,
        [id, JSON.stringify({ desde, hasta }), pedido.cuenta.id],
      );
    });
    return cuentaConPausas(id);
  });

  app.patch('/cuentas/:id/pausas/:pausaId', async (pedido) => {
    const { id, pausaId } = z.object({ id: z.uuid(), pausaId: z.uuid() }).parse(pedido.params);
    const { hasta } = z.object({ hasta: fecha }).parse(pedido.body);
    await enTransaccion(async (c) => {
      const cuenta = await c.query(`SELECT id FROM cuentas WHERE id = $1 AND rol <> 'admin' FOR NO KEY UPDATE`, [id]);
      if (!cuenta.rowCount) throw noEncontrado();
      const { rows: [pausa] } = await c.query<{ desde: string; hasta: string; anulada_en: Date | null }>(
        'SELECT desde, hasta, anulada_en FROM pausas WHERE id = $1 AND cuenta_id = $2',
        [pausaId, id],
      );
      if (!pausa) throw noEncontrado();
      const anulada = hasta < pausa.desde;
      if (pausa.anulada_en) {
        if (anulada) return;
        throw new ErrorHttp(409, 'sin_cambios', 'Esta pausa ya se anuló');
      }
      if (anulada) {
        // Un intervalo que termina antes de empezar queda anulado y conserva sus fechas originales.
        await c.query('UPDATE pausas SET anulada_en = clock_timestamp() WHERE id = $1', [pausaId]);
      } else {
        await c.query('UPDATE pausas SET hasta = $2 WHERE id = $1', [pausaId, hasta]);
      }
      await c.query(
        `INSERT INTO eventos_cuenta (cuenta_id, evento, detalle, autor_id) VALUES ($1, 'cambio_pausa', $2, $3)`,
        [id, JSON.stringify({ pausaId, desde: pausa.desde, hasta_anterior: pausa.hasta, hasta, anulada }), pedido.cuenta.id],
      );
    });
    return cuentaConPausas(id);
  });
}
