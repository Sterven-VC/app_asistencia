import { Cron } from 'croner';

import { enTransaccion, pool } from '../db/conexion.js';
import { diaDeSemana, fechaLima, sumarDias } from '../tiempo.js';

/** Cierra un día. Es idempotente gracias a cierres_dia. */
export async function cerrarDia(fecha: string) {
  await enTransaccion(async (c) => {
    const yaCerrado = await c.query(
      'INSERT INTO cierres_dia (fecha) VALUES ($1) ON CONFLICT DO NOTHING RETURNING fecha',
      [fecha],
    );
    if (!yaCerrado.rowCount) return;

    // La consulta de faltas debe ver las marcaciones que acaban de confirmarse.
    await c.query(`SELECT id FROM cuentas WHERE estado = 'activa' AND rol <> 'admin' ORDER BY id FOR NO KEY UPDATE`);

    const dia = diaDeSemana(fecha);
    const finDeSemana = dia === 0 || dia === 6;

    await c.query(
      `INSERT INTO faltas (cuenta_id, fecha, origen)
       SELECT c.id, $1, 'sin_marcacion'
       FROM cuentas c
       WHERE c.estado = 'activa'
         AND c.rol <> 'admin'
         AND (c.aprobada_en AT TIME ZONE 'America/Lima')::date < $1::date
         AND ($2 = false OR c.rol = 'operario')
         AND NOT EXISTS (
           SELECT 1 FROM pausas p
           WHERE p.cuenta_id = c.id AND p.anulada_en IS NULL AND $1::date BETWEEN p.desde AND p.hasta
         )
         AND NOT EXISTS (SELECT 1 FROM marcaciones m WHERE m.cuenta_id = c.id AND m.fecha_laboral = $1)
       ON CONFLICT DO NOTHING`,
      [fecha, finDeSemana],
    );

    await c.query(
      `INSERT INTO observaciones (marcacion_id, codigo)
       SELECT e.id, 'salida_faltante'
       FROM marcaciones e
       JOIN cuentas c ON c.id = e.cuenta_id AND c.rol = 'administrativo'
       WHERE e.fecha_laboral = $1 AND e.clase = 'entrada' AND NOT e.es_repetida
         AND NOT EXISTS (
           SELECT 1 FROM marcaciones s
           WHERE s.cuenta_id = e.cuenta_id AND s.fecha_laboral = $1 AND s.clase = 'salida'
         )
       ON CONFLICT DO NOTHING`,
      [fecha],
    );
  });
}

/** Procesa los días sin cerrar, por ejemplo si la PC estuvo apagada. */
export async function cerrarDiasPendientes(ahora: Date = new Date()) {
  const ayer = sumarDias(fechaLima(ahora), -1);
  const { rows } = await pool.query<{ inicio: string | null }>(
    `SELECT COALESCE(
       (SELECT max(fecha) + 1 FROM cierres_dia),
       (SELECT min((aprobada_en AT TIME ZONE 'America/Lima')::date)
        FROM cuentas WHERE aprobada_en IS NOT NULL AND rol <> 'admin')
     )::text AS inicio`,
  );
  let fecha = rows[0].inicio;
  while (fecha && fecha <= ayer) {
    await cerrarDia(fecha);
    fecha = sumarDias(fecha, 1);
  }
}

export function programarCierre() {
  return new Cron('5 0 * * *', { timezone: 'America/Lima' }, () => {
    cerrarDiasPendientes().catch((error) => console.error('Falló el cierre diario', error));
  });
}
