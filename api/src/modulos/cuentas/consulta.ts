import { type Ejecutor, pool } from '../../db/conexion.js';
import { noEncontrado } from '../../errores.js';

const CAMPOS = `c.id, c.dni, c.nombre_1, c.nombre_2, c.apellido_paterno, c.apellido_materno,
  c.numero_referencia, c.rol, (c.rol = 'admin') AS es_admin, c.estado,
  COALESCE((
    SELECT json_agg(json_build_object('id', p.id, 'desde', p.desde, 'hasta', p.hasta) ORDER BY p.desde DESC)
    FROM pausas p WHERE p.cuenta_id = c.id AND p.anulada_en IS NULL
  ), '[]'::json) AS pausas`;

export async function listarCuentas(estado?: string) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS} FROM cuentas c
     WHERE c.rol <> 'admin' AND ($1::text IS NULL OR c.estado = $1)
     ORDER BY (c.estado = 'pendiente') DESC, c.apellido_paterno, c.nombre_1`,
    [estado ?? null],
  );
  return rows;
}

export async function cuentaConPausas(id: string, db: Ejecutor = pool, ambito?: 'personal') {
  const { rows } = await db.query(
    `SELECT ${CAMPOS} FROM cuentas c WHERE c.id = $1 AND (NOT $2::boolean OR c.rol <> 'admin')`,
    [id, ambito === 'personal'],
  );
  if (!rows[0]) throw noEncontrado();
  return rows[0];
}
