import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

import { config } from '../config.js';

// Las fechas se manejan como texto AAAA-MM-DD, sin conversión de zona.
pg.types.setTypeParser(1082, (valor) => valor);

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX,
  connectionTimeoutMillis: 5000,
});

export type Ejecutor = Pick<pg.Pool, 'query'>;

export async function enTransaccion<T>(trabajo: (cliente: pg.PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await trabajo(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

export async function migrar() {
  const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migraciones');
  const aplicadas = await enTransaccion(async (cliente) => {
    // Dos instancias que arrancan juntas comparten un único ejecutor de migraciones.
    await cliente.query('SELECT pg_advisory_xact_lock($1, $2)', [719310, 1]);
    await cliente.query(
      'CREATE TABLE IF NOT EXISTS migraciones (nombre text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())',
    );
    const { rows } = await cliente.query<{ nombre: string }>('SELECT nombre FROM migraciones');
    const existentes = new Set(rows.map((fila) => fila.nombre));
    const pendientes = readdirSync(carpeta).filter((archivo) => archivo.endsWith('.sql') && !existentes.has(archivo)).sort();
    for (const archivo of pendientes) {
      await cliente.query(readFileSync(path.join(carpeta, archivo), 'utf8'));
      await cliente.query('INSERT INTO migraciones (nombre) VALUES ($1)', [archivo]);
    }
    return pendientes;
  });
  for (const archivo of aplicadas) console.log(`Migración aplicada: ${archivo}`);
}
