import { randomUUID } from 'node:crypto';

import { migrar, pool } from '../src/db/conexion.js';
import { hashear } from '../src/modulos/auth/sesiones.js';
import { crearApp } from '../src/servidor.js';

export const CONTRASENA = 'clave-de-prueba-segura';
let hashCompartido: string | null = null;
let siguienteDni = 10000000;

export type App = Awaited<ReturnType<typeof crearApp>>;

export async function prepararApp() {
  const { rows } = await pool.query('SELECT current_database() AS nombre');
  if (rows[0]?.nombre !== 'asistencia_tmt_test') throw new Error('La base de pruebas debe ser asistencia_tmt_test');
  await migrar();
  return crearApp();
}

export async function limpiarBase() {
  await pool.query(
    `TRUNCATE correcciones, anulaciones_falta, faltas, validaciones, observaciones, marcaciones,
              proyectos, pausas, eventos_cuenta, sesiones, cuentas, cierres_dia CASCADE`,
  );
}

type OpcionesCuenta = {
  rol?: 'operario' | 'administrativo' | 'admin';
  dni?: string;
  estado?: 'pendiente' | 'activa' | 'desactivada';
  aprobada_en?: string;
};

export async function crearCuenta(app: App, o: OpcionesCuenta = {}) {
  hashCompartido ??= await hashear(CONTRASENA);
  const dni = o.dni ?? String(siguienteDni++);
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO cuentas
     (dni, nombre_1, apellido_paterno, apellido_materno, numero_referencia, rol, estado, contrasena_hash, aprobada_en)
     VALUES ($1, 'Ana', 'Prueba', 'Local', '999', $2, $3, $4, $5) RETURNING id`,
    [
      dni,
      o.rol ?? 'operario',
      o.estado ?? 'activa',
      hashCompartido,
      o.aprobada_en ?? '2026-01-01T12:00:00Z',
    ],
  );
  const r = await app.inject({
    method: 'POST',
    url: '/v1/auth/iniciar-sesion',
    payload: o.rol === 'admin'
      ? { identificador: `admin.${dni}`, contrasena: CONTRASENA }
      : { dni, contrasena: CONTRASENA },
  });
  if (r.statusCode !== 200) throw new Error(`No se pudo iniciar la sesión de prueba: ${r.statusCode}`);
  return { id: rows[0].id, dni, token: r.json().token as string };
}

export function llamar(app: App, token: string, method: 'GET' | 'POST' | 'PATCH', url: string, payload?: object) {
  return app.inject({ method, url: `/v1${url}`, headers: { authorization: `Bearer ${token}` }, payload });
}

type OpcionesMarca = {
  id?: string;
  clase?: 'entrada' | 'salida';
  hora?: string;
  envio?: string;
  sinUbicacion?: boolean;
  sinConexion?: boolean;
};

export async function marcar(app: App, token: string, o: OpcionesMarca = {}) {
  const hora = o.hora ?? new Date().toISOString();
  const id = o.id ?? randomUUID();
  const r = await llamar(app, token, 'POST', '/marcaciones/sincronizar', {
    // Por defecto el reloj del teléfono está bien y la marcación se envía ahora.
    hora_envio_telefono: o.envio ?? new Date().toISOString(),
    marcaciones: [
      {
        id,
        clase: o.clase ?? 'entrada',
        hora_telefono: hora,
        sin_conexion: o.sinConexion ?? false,
        latitud: o.sinUbicacion ? null : -12.05,
        longitud: o.sinUbicacion ? null : -77.04,
        precision_m: o.sinUbicacion ? null : 10,
        motivo_sin_ubicacion: o.sinUbicacion ? 'sin_gps' : null,
      },
    ],
  });
  return { id, r, resultado: r.json().resultados?.[0]?.resultado as string };
}

export const vigente = async (id: string) =>
  (await pool.query('SELECT * FROM marcaciones_vigentes WHERE id = $1', [id])).rows[0];

export const faltasDe = async (cuentaId: string) =>
  (
    await pool.query(
      `SELECT f.fecha, f.origen, a.id IS NOT NULL AS anulada, a.origen AS origen_anulacion
       FROM faltas f LEFT JOIN anulaciones_falta a ON a.falta_id = f.id
       WHERE f.cuenta_id = $1 ORDER BY f.fecha`,
      [cuentaId],
    )
  ).rows;
