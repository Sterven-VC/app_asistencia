// Reemplaza un DNI, por ejemplo el temporal de la primera admin.
// Uso: npm run db:cambiar-dni -- 00000000 12345678
import { pool } from '../src/db/conexion.js';

const [actual, nuevo] = process.argv.slice(2);
if (!actual || !/^\d{8}$/.test(nuevo ?? '')) {
  throw new Error('Uso: npm run db:cambiar-dni -- <dni_actual> <dni_nuevo>');
}

const { rowCount } = await pool.query('UPDATE cuentas SET dni = $2 WHERE dni = $1', [actual, nuevo]);
console.log(rowCount ? 'DNI actualizado' : 'No existe una cuenta con ese DNI');
await pool.end();
