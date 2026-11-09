import { ZodError } from 'zod';

import { pool } from '../src/db/conexion.js';
import { ErrorHttp } from '../src/errores.js';
import { crearCuentaAdmin } from '../src/modulos/cuentas/administracion.js';

try {
  const dni = process.argv[2] ?? process.env.ADMIN_DNI ?? '';
  const contrasena = process.env.ADMIN_CONTRASENA_EXCLUSIVA ?? '';
  const cuenta = await crearCuentaAdmin(dni, contrasena, {
    nombre_1: process.env.ADMIN_NOMBRE_1,
    nombre_2: process.env.ADMIN_NOMBRE_2?.trim() || null,
    apellido_paterno: process.env.ADMIN_APELLIDO_PATERNO,
    apellido_materno: process.env.ADMIN_APELLIDO_MATERNO,
    numero_referencia: process.env.ADMIN_NUMERO_REFERENCIA,
  });
  console.log(`Cuenta de administración creada: ${cuenta.identificador}`);
} catch (error) {
  const mensaje = error instanceof ErrorHttp ? error.message : error instanceof ZodError
    ? 'Completa la identidad en las variables ADMIN_* para un DNI sin cuenta de personal.'
    : 'No se pudo crear la cuenta de administración. Comprueba la conexión y las migraciones.';
  console.error(mensaje);
  process.exitCode = 1;
} finally {
  await pool.end();
}
