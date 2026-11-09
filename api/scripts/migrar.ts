import { migrar, pool } from '../src/db/conexion.js';

await migrar();
await pool.end();
console.log('Base al día');
