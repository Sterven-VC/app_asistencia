import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { enTransaccion, pool } from '../../db/conexion.js';
import { ErrorHttp, noEncontrado } from '../../errores.js';

const fecha = z.iso.date();

export async function rutasFaltas(app: FastifyInstance) {
  app.get('/faltas', async (pedido) => {
    const f = z.object({ fecha: fecha.optional(), cuenta_id: z.uuid().optional() }).parse(pedido.query);
    const { rows } = await pool.query(
      `SELECT f.id, f.cuenta_id, f.fecha, f.origen, a.id IS NOT NULL AS anulada, a.motivo AS motivo_anulacion,
              concat_ws(' ', c.nombre_1, c.apellido_paterno, c.apellido_materno) AS persona,
              EXISTS (
                SELECT 1 FROM faltas vf LEFT JOIN anulaciones_falta va ON va.falta_id = vf.id
                WHERE vf.cuenta_id = f.cuenta_id AND vf.fecha = f.fecha AND va.id IS NULL
              ) AS es_falta,
              COALESCE(h.correcciones, '[]'::json) AS correcciones
       FROM faltas f
       JOIN cuentas c ON c.id = f.cuenta_id
       LEFT JOIN anulaciones_falta a ON a.falta_id = f.id
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id', r.id, 'es_falta_anterior', r.es_falta_anterior, 'es_falta_nuevo', r.es_falta_nuevo,
           'motivo', r.motivo, 'autor_id', r.autor_id, 'creado_en', r.creado_en,
           'autor', concat_ws(' ', autor.nombre_1, autor.apellido_paterno, autor.apellido_materno)
         ) ORDER BY r.creado_en DESC, r.id) AS correcciones
         FROM correcciones r JOIN cuentas autor ON autor.id = r.autor_id
         WHERE r.cuenta_id = f.cuenta_id AND r.fecha = f.fecha
       ) h ON true
       WHERE ($1::date IS NULL OR f.fecha = $1) AND ($2::uuid IS NULL OR f.cuenta_id = $2)
       ORDER BY f.fecha DESC, persona LIMIT 200`,
      [f.fecha ?? null, f.cuenta_id ?? null],
    );
    return { items: rows };
  });

  // Lo único corregible es si un día es falta o no. La hora nunca se corrige.
  app.post('/correcciones', async (pedido, respuesta) => {
    const d = z
      .strictObject({
        cuenta_id: z.uuid(),
        fecha,
        es_falta: z.boolean(),
        motivo: z.string().trim(),
      })
      .parse(pedido.body);
    if (!d.motivo) throw new ErrorHttp(400, 'motivo_requerido', 'Escribe el motivo');

    await enTransaccion(async (c) => {
      const cuenta = await c.query(`SELECT id FROM cuentas WHERE id = $1 AND rol <> 'admin' FOR NO KEY UPDATE`, [d.cuenta_id]);
      if (!cuenta.rowCount) throw noEncontrado();
      const activas = await c.query<{ id: string }>(
        `SELECT f.id FROM faltas f LEFT JOIN anulaciones_falta a ON a.falta_id = f.id
         WHERE f.cuenta_id = $1 AND f.fecha = $2 AND a.id IS NULL`,
        [d.cuenta_id, d.fecha],
      );
      const esFalta = activas.rows.length > 0;
      if (esFalta === d.es_falta) {
        throw new ErrorHttp(409, 'sin_cambios', d.es_falta ? 'Ese día ya es falta' : 'Ese día no es falta');
      }

      if (d.es_falta) {
        await c.query(`INSERT INTO faltas (cuenta_id, fecha, origen) VALUES ($1, $2, 'correccion')`, [
          d.cuenta_id,
          d.fecha,
        ]);
      } else {
        for (const falta of activas.rows) {
          await c.query(
            `INSERT INTO anulaciones_falta (falta_id, motivo, origen, autor_id) VALUES ($1, $2, 'correccion', $3)`,
            [falta.id, d.motivo, pedido.cuenta.id],
          );
        }
      }
      await c.query(
        `INSERT INTO correcciones (cuenta_id, fecha, es_falta_anterior, es_falta_nuevo, motivo, autor_id, creado_en)
         VALUES ($1, $2, $3, $4, $5, $6, clock_timestamp())`,
        [d.cuenta_id, d.fecha, esFalta, d.es_falta, d.motivo, pedido.cuenta.id],
      );
    });
    return respuesta.code(201).send({ cuenta_id: d.cuenta_id, fecha: d.fecha, es_falta: d.es_falta });
  });
}
