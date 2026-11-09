import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { enTransaccion, pool } from '../../db/conexion.js';
import { ErrorHttp } from '../../errores.js';
import { type CuentaSesion, soloPersonal } from '../auth/sesiones.js';
import { registrarMarcacion } from './servicio.js';

const fecha = z.iso.date();

const lote = z.object({
  hora_envio_telefono: z.iso.datetime({ offset: true }),
  marcaciones: z
    .array(
      z.object({
        id: z.uuid(),
        clase: z.enum(['entrada', 'salida']),
        hora_telefono: z.iso.datetime({ offset: true }),
        sin_conexion: z.boolean(),
        latitud: z.number().min(-90).max(90).nullable(),
        longitud: z.number().min(-180).max(180).nullable(),
        precision_m: z.number().min(0).nullable(),
        motivo_sin_ubicacion: z.enum(['sin_permiso', 'sin_gps', 'tiempo_agotado']).nullable(),
      }).refine((marca) => (marca.latitud === null) === (marca.longitud === null)),
    )
    .max(200),
});

export async function rutasMarcaciones(app: FastifyInstance) {
  app.addHook('preHandler', soloPersonal);

  app.post('/marcaciones/sincronizar', async (pedido) => {
    if (pedido.cuenta.estado === 'pendiente') {
      throw new ErrorHttp(403, 'cuenta_pendiente', 'Tu cuenta aún no fue aprobada');
    }
    const d = lote.parse(pedido.body);
    const ahora = new Date();
    const desfase = Math.round((ahora.getTime() - new Date(d.hora_envio_telefono).getTime()) / 1000);

    return enTransaccion(async (c) => {
      // El mismo bloqueo ordena envíos, cierres y correcciones de una cuenta.
      const { rows: [cuenta] } = await c.query<CuentaSesion>(
        'SELECT id, dni, rol, estado FROM cuentas WHERE id = $1 FOR NO KEY UPDATE',
        [pedido.cuenta.id],
      );
      const resultados = [];
      for (const marcacion of d.marcaciones) {
        const resultado = await registrarMarcacion(c, cuenta, marcacion, ahora, desfase);
        resultados.push({ id: marcacion.id, resultado });
      }
      return { resultados };
    });
  });

  app.get('/yo/historial', async (pedido) => {
    const { desde, hasta } = z
      .object({ desde: fecha.optional(), hasta: fecha.optional() })
      .parse(pedido.query);

    const marcas = await pool.query(
      `SELECT id, fecha_laboral AS fecha, clase, hora_oficial AS hora, estado, tipo, proyecto, motivo,
              CASE WHEN estado = 'rechazada' THEN 0 ELSE minutos_extra END AS minutos_extra, observaciones
       FROM marcaciones_vigentes
       WHERE cuenta_id = $1 AND ($2::date IS NULL OR fecha_laboral >= $2) AND ($3::date IS NULL OR fecha_laboral <= $3)
       ORDER BY hora_oficial DESC LIMIT 200`,
      [pedido.cuenta.id, desde ?? null, hasta ?? null],
    );
    const faltas = await pool.query(
      `SELECT f.id, f.fecha, a.id IS NOT NULL AS anulada, a.motivo
       FROM faltas f LEFT JOIN anulaciones_falta a ON a.falta_id = f.id
       WHERE f.cuenta_id = $1 AND ($2::date IS NULL OR f.fecha >= $2) AND ($3::date IS NULL OR f.fecha <= $3)
       ORDER BY f.fecha DESC LIMIT 200`,
      [pedido.cuenta.id, desde ?? null, hasta ?? null],
    );

    const items = [
      ...marcas.rows.map((m) => ({ item: 'marcacion', envio: 'enviada', ...m })),
      ...faltas.rows.map((f) => ({ item: 'falta', ...f })),
    ].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return { items };
  });
}
