import { z } from 'zod';

import { enTransaccion } from '../../db/conexion.js';
import { ErrorHttp } from '../../errores.js';
import { hashear, verificar } from '../auth/sesiones.js';

const texto = z.string().trim().min(1).max(120);
const identidad = z.object({
  nombre_1: texto,
  nombre_2: texto.nullable(),
  apellido_paterno: texto,
  apellido_materno: texto,
  numero_referencia: texto,
});

export async function crearCuentaAdmin(dni: string, contrasena: string, datosIniciales?: unknown) {
  if (!/^\d{8}$/.test(dni) || contrasena.length < 16 || contrasena.length > 256) {
    throw new ErrorHttp(400, 'datos_invalidos', 'Usa un DNI de 8 dígitos y una contraseña de 16 a 256 caracteres.');
  }
  const hash = await hashear(contrasena);

  return enTransaccion(async (db) => {
    const { rows: [personal] } = await db.query<z.infer<typeof identidad> & { id: string; contrasena_hash: string }>(
      `SELECT id, nombre_1, nombre_2, apellido_paterno, apellido_materno, numero_referencia, contrasena_hash
       FROM cuentas WHERE dni = $1 AND rol <> 'admin' FOR SHARE`,
      [dni],
    );
    if (personal && await verificar(personal.contrasena_hash, contrasena)) {
      throw new ErrorHttp(400, 'clave_reutilizada', 'Usa una contraseña distinta de la cuenta de personal.');
    }
    const datos = personal ?? identidad.parse(datosIniciales);
    const { rows: [nueva] } = await db.query<{ id: string }>(
      `INSERT INTO cuentas
       (dni, nombre_1, nombre_2, apellido_paterno, apellido_materno, numero_referencia, rol, estado, contrasena_hash)
       VALUES ($1, $2, $3, $4, $5, $6, 'admin', 'activa', $7)
       ON CONFLICT DO NOTHING RETURNING id`,
      [dni, datos.nombre_1, datos.nombre_2, datos.apellido_paterno, datos.apellido_materno, datos.numero_referencia, hash],
    );
    if (!nueva) throw new ErrorHttp(409, 'admin_duplicada', 'El DNI ya tiene una cuenta de administración.');

    await db.query(
      `INSERT INTO eventos_cuenta (cuenta_id, evento, detalle)
       VALUES ($1, 'alta_admin', jsonb_build_object('cuenta_personal_id', $2::uuid))`,
      [nueva.id, personal?.id ?? null],
    );
    return { id: nueva.id, identificador: `admin.${dni}` };
  });
}
