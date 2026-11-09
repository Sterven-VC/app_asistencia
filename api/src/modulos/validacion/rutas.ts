import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { enTransaccion, type Ejecutor, pool } from '../../db/conexion.js';
import { ErrorHttp, noEncontrado } from '../../errores.js';

const fecha = z.iso.date();
const idParam = z.object({ id: z.uuid() });
const bandera = z.enum(['true', 'false']).optional();

const filtros = z.object({
  estado: z.enum(['pendiente', 'aprobada', 'rechazada']).optional(),
  fecha: fecha.optional(),
  cuenta_id: z.uuid().optional(),
  observada: bandera,
  sin_tipo: bandera,
});

function conTiempoExtraVigente<T extends { estado: string; minutos_extra: number }>(marcacion: T) {
  return { ...marcacion, minutos_extra: marcacion.estado === 'rechazada' ? 0 : marcacion.minutos_extra };
}

async function vigente(id: string, db: Ejecutor = pool) {
  const { rows } = await db.query('SELECT * FROM marcaciones_vigentes WHERE id = $1', [id]);
  if (!rows[0]) throw noEncontrado();
  return conTiempoExtraVigente(rows[0]);
}

async function vigenteParaValidar(id: string, db: Ejecutor) {
  const { rowCount } = await db.query(
    `SELECT c.id FROM cuentas c JOIN marcaciones m ON m.cuenta_id = c.id
     WHERE m.id = $1 FOR NO KEY UPDATE OF c`,
    [id],
  );
  if (!rowCount) throw noEncontrado();
  return vigente(id, db);
}

export async function rutasValidacion(app: FastifyInstance) {
  app.get('/marcaciones', async (pedido) => {
    const f = filtros.parse(pedido.query);
    const { rows } = await pool.query(
      `SELECT * FROM marcaciones_vigentes
       WHERE ($1::text IS NULL OR estado = $1)
         AND ($2::date IS NULL OR fecha_laboral = $2)
         AND ($3::uuid IS NULL OR cuenta_id = $3)
         AND (NOT $4 OR cardinality(observaciones) > 0)
         AND (NOT $5 OR (clase = 'entrada' AND estado = 'aprobada' AND tipo IS NULL))
       ORDER BY fecha_laboral DESC, hora_oficial DESC LIMIT 200`,
      [f.estado ?? null, f.fecha ?? null, f.cuenta_id ?? null, f.observada === 'true', f.sin_tipo === 'true'],
    );
    return { items: rows.map(conTiempoExtraVigente) };
  });

  app.get('/marcaciones/:id', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const { rows: [marcacion] } = await pool.query(
      `SELECT m.*, COALESCE(h.validaciones, '[]'::json) AS validaciones
       FROM marcaciones_vigentes m
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id', v.id, 'decision', v.decision, 'tipo', v.tipo, 'proyecto_id', v.proyecto_id,
           'motivo', v.motivo, 'automatica', v.automatica, 'autor_id', v.autor_id, 'creado_en', v.creado_en,
           'autor', concat_ws(' ', c.nombre_1, c.apellido_paterno, c.apellido_materno)
         ) ORDER BY v.secuencia DESC) AS validaciones
         FROM validaciones v JOIN cuentas c ON c.id = v.autor_id
         WHERE v.marcacion_id = m.id
       ) h ON true
       WHERE m.id = $1`,
      [id],
    );
    if (!marcacion) throw noEncontrado();
    return conTiempoExtraVigente(marcacion);
  });

  app.post('/marcaciones/:id/aprobar', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const d = z
      .object({
        tipo: z.enum(['proyecto', 'oficina', 'cita_medica']).nullable().optional(),
        proyecto_id: z.uuid().nullable().optional(),
      })
      .parse(pedido.body ?? {});

    return enTransaccion(async (c) => {
      const m = await vigenteParaValidar(id, c);
      const asignandoTipo = m.automatica && m.tipo === null && m.clase === 'entrada';
      if (m.estado !== 'pendiente' && !asignandoTipo) {
        throw new ErrorHttp(409, 'ya_validada', 'Esta marcación ya fue validada');
      }
      // Las autoaprobaciones anteriores a la separación conservan su autoría.
      if (asignandoTipo && m.dni !== pedido.cuenta.dni) {
        throw new ErrorHttp(403, 'solo_admin', 'Solo la cuenta de administración de quien marcó puede asignar el tipo');
      }

      const tipo = m.clase === 'entrada' ? (d.tipo ?? null) : null;
      const proyecto = tipo === 'proyecto' ? (d.proyecto_id ?? null) : null;
      if (m.clase === 'entrada' && !tipo) {
        throw new ErrorHttp(400, 'tipo_requerido', 'Elige Proyecto, Oficina o Cita médica');
      }
      if (tipo === 'proyecto') {
        if (!proyecto) throw new ErrorHttp(400, 'proyecto_requerido', 'Elige el proyecto');
        const activo = await c.query('SELECT id FROM proyectos WHERE id = $1 AND activo FOR SHARE', [proyecto]);
        if (!activo.rowCount) throw new ErrorHttp(400, 'proyecto_requerido', 'Elige un proyecto activo');
      }

      await c.query(
        `INSERT INTO validaciones (marcacion_id, decision, tipo, proyecto_id, autor_id)
         VALUES ($1, 'aprobada', $2, $3, $4)`,
        [id, tipo, proyecto, pedido.cuenta.id],
      );
      return vigente(id, c);
    });
  });

  app.post('/marcaciones/:id/rechazar', async (pedido) => {
    const { id } = idParam.parse(pedido.params);
    const { motivo } = z.object({ motivo: z.string().trim() }).parse(pedido.body);
    if (!motivo) throw new ErrorHttp(400, 'motivo_requerido', 'Escribe el motivo');

    return enTransaccion(async (c) => {
      const m = await vigenteParaValidar(id, c);
      if (m.estado !== 'pendiente') throw new ErrorHttp(409, 'ya_validada', 'Esta marcación ya fue validada');
      await c.query(
        `INSERT INTO validaciones (marcacion_id, decision, motivo, autor_id) VALUES ($1, 'rechazada', $2, $3)`,
        [id, motivo, pedido.cuenta.id],
      );
      // Rechazar una salida solo quita el tiempo extra. No genera falta.
      if (m.clase === 'entrada') {
        await c.query(
          `INSERT INTO faltas (cuenta_id, fecha, origen, marcacion_id) VALUES ($1, $2, 'rechazo', $3)
           ON CONFLICT DO NOTHING`,
          [m.cuenta_id, m.fecha_laboral, id],
        );
      }
      return vigente(id, c);
    });
  });
}
