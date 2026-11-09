import type { PoolClient } from 'pg';

import { config } from '../../config.js';
import { ErrorHttp } from '../../errores.js';
import { fechaLima, minutosExtra } from '../../tiempo.js';
import type { CuentaSesion } from '../auth/sesiones.js';

export type NuevaMarcacion = {
  id: string;
  clase: 'entrada' | 'salida';
  hora_telefono: string;
  sin_conexion: boolean;
  latitud: number | null;
  longitud: number | null;
  precision_m: number | null;
  motivo_sin_ubicacion: 'sin_permiso' | 'sin_gps' | 'tiempo_agotado' | null;
};

const HORAS_SALIDA_ABIERTA = 16;

async function fechaLaboral(c: PoolClient, cuentaId: string, clase: string, horaOficial: Date) {
  if (clase === 'salida') {
    // Una salida después de medianoche pertenece al día de su entrada abierta.
    const { rows } = await c.query<{ fecha_laboral: string }>(
      `SELECT e.fecha_laboral FROM marcaciones e
       WHERE e.cuenta_id = $1 AND e.clase = 'entrada' AND NOT e.es_repetida
         AND e.hora_oficial <= $2 AND e.hora_oficial >= $2::timestamptz - interval '${HORAS_SALIDA_ABIERTA} hours'
       ORDER BY e.hora_oficial DESC LIMIT 1`,
      [cuentaId, horaOficial],
    );
    if (rows[0]) return rows[0].fecha_laboral;
  }
  return fechaLima(horaOficial);
}

async function yaRegistrada(c: PoolClient, id: string, cuentaId: string) {
  const { rows } = await c.query<{ cuenta_id: string }>('SELECT cuenta_id FROM marcaciones WHERE id = $1', [id]);
  if (!rows[0]) return false;
  if (rows[0].cuenta_id !== cuentaId) {
    throw new ErrorHttp(400, 'datos_invalidos', 'Esa marcación pertenece a otra cuenta');
  }
  return true;
}

export async function registrarMarcacion(
  c: PoolClient,
  cuenta: CuentaSesion,
  m: NuevaMarcacion,
  ahora: Date,
  desfase: number,
): Promise<'guardada' | 'ya_existia' | 'repetida'> {
  if (await yaRegistrada(c, m.id, cuenta.id)) return 'ya_existia';
  if (cuenta.estado === 'pendiente') {
    throw new ErrorHttp(403, 'cuenta_pendiente', 'Tu cuenta aún no fue aprobada');
  }
  if (m.clase === 'salida' && cuenta.rol === 'operario') {
    throw new ErrorHttp(400, 'datos_invalidos', 'El personal operario solo registra entrada');
  }

  const horaOficial = new Date(new Date(m.hora_telefono).getTime() + desfase * 1000);
  const fecha = await fechaLaboral(c, cuenta.id, m.clase, horaOficial);
  const pausa = await c.query(
    'SELECT 1 FROM pausas WHERE cuenta_id = $1 AND anulada_en IS NULL AND $2::date BETWEEN desde AND hasta',
    [cuenta.id, fechaLima(horaOficial)],
  );
  const noActiva = cuenta.estado !== 'activa' || Boolean(pausa.rowCount);
  if (noActiva && !m.sin_conexion) {
    throw new ErrorHttp(403, 'cuenta_no_activa', 'Tu cuenta no está activa para marcar');
  }

  const repetida = await c.query(
    `SELECT 1 FROM marcaciones WHERE cuenta_id = $1 AND fecha_laboral = $2 AND clase = $3 AND NOT es_repetida`,
    [cuenta.id, fecha, m.clase],
  );
  const esRepetida = Boolean(repetida.rowCount);
  const extra = m.clase === 'salida' && !esRepetida ? minutosExtra(fecha, horaOficial, config.FIN_DE_JORNADA) : 0;

  const insercion = await c.query(
    `INSERT INTO marcaciones
     (id, cuenta_id, clase, fecha_laboral, hora_telefono, hora_recepcion, desfase_segundos, hora_oficial,
      sin_conexion, latitud, longitud, precision_m, motivo_sin_ubicacion, es_repetida, minutos_extra)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     ON CONFLICT (id) DO NOTHING`,
    [
      m.id,
      cuenta.id,
      m.clase,
      fecha,
      m.hora_telefono,
      ahora,
      desfase,
      horaOficial,
      m.sin_conexion,
      m.latitud,
      m.longitud,
      m.precision_m,
      m.motivo_sin_ubicacion,
      esRepetida,
      extra,
    ],
  );
  if (!insercion.rowCount && await yaRegistrada(c, m.id, cuenta.id)) return 'ya_existia';

  const observar = (codigo: string) =>
    c.query('INSERT INTO observaciones (marcacion_id, codigo) VALUES ($1, $2)', [m.id, codigo]);

  if (m.latitud === null) await observar('sin_ubicacion');
  if (esRepetida) await observar('marcacion_repetida');

  if (noActiva) await observar('cuenta_no_activa');

  // Una marcación que llega tarde deja sin efecto la falta de ese día, con rastro.
  await c.query(
    `INSERT INTO anulaciones_falta (falta_id, motivo, origen)
     SELECT f.id, 'Llegó una marcación hecha sin señal', 'marcacion_tardia'
     FROM faltas f LEFT JOIN anulaciones_falta a ON a.falta_id = f.id
     WHERE f.cuenta_id = $1 AND f.fecha = $2 AND f.origen = 'sin_marcacion' AND a.id IS NULL`,
    [cuenta.id, fecha],
  );

  return esRepetida ? 'repetida' : 'guardada';
}
