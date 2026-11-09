import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { pool } from '../../db/conexion.js';
import { ErrorHttp, noEncontrado } from '../../errores.js';

const duplicado = () => new ErrorHttp(409, 'proyecto_duplicado', 'Ya existe un proyecto con ese nombre');

export async function rutasProyectos(app: FastifyInstance) {
  app.get('/proyectos', async () => {
    const { rows } = await pool.query('SELECT id, nombre, activo FROM proyectos ORDER BY activo DESC, nombre');
    return { items: rows };
  });

  app.post('/proyectos', async (pedido, respuesta) => {
    const { nombre } = z.object({ nombre: z.string().trim().min(1) }).parse(pedido.body);
    try {
      const { rows } = await pool.query(
        'INSERT INTO proyectos (nombre, creado_por) VALUES ($1, $2) RETURNING id, nombre, activo',
        [nombre, pedido.cuenta.id],
      );
      return respuesta.code(201).send(rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw duplicado();
      throw error;
    }
  });

  app.patch('/proyectos/:id', async (pedido) => {
    const { id } = z.object({ id: z.uuid() }).parse(pedido.params);
    const d = z
      .object({ nombre: z.string().trim().min(1).optional(), activo: z.boolean().optional() })
      .parse(pedido.body);
    try {
      const { rows } = await pool.query(
        `UPDATE proyectos SET nombre = COALESCE($2, nombre), activo = COALESCE($3, activo)
         WHERE id = $1 RETURNING id, nombre, activo`,
        [id, d.nombre ?? null, d.activo ?? null],
      );
      if (!rows[0]) throw noEncontrado();
      return rows[0];
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw duplicado();
      throw error;
    }
  });
}
