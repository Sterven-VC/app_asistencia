import * as SQLite from 'expo-sqlite';

import type { MarcacionLocal, TiendaLocal } from './tipos';

let base: SQLite.SQLiteDatabase | null = null;

function abrir() {
  if (base) return base;
  base = SQLite.openDatabaseSync('asistencia.db');
  base.execSync(`
    CREATE TABLE IF NOT EXISTS marcaciones_locales (
      id TEXT PRIMARY KEY NOT NULL,
      cuenta_id TEXT NOT NULL,
      clase TEXT NOT NULL,
      hora_telefono TEXT NOT NULL,
      latitud REAL,
      longitud REAL,
      precision_m REAL,
      motivo_sin_ubicacion TEXT,
      sin_conexion INTEGER NOT NULL,
      estado_envio TEXT NOT NULL,
      intentos INTEGER NOT NULL DEFAULT 0,
      ultimo_error TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_locales_cuenta ON marcaciones_locales (cuenta_id, estado_envio);
  `);
  return base;
}

type Fila = Omit<MarcacionLocal, 'sin_conexion'> & { sin_conexion: number };

const aMarcacion = (f: Fila): MarcacionLocal => ({ ...f, sin_conexion: f.sin_conexion === 1 });

export const tienda: TiendaLocal = {
  async guardar(m) {
    abrir().runSync(
      `INSERT INTO marcaciones_locales
       (id, cuenta_id, clase, hora_telefono, latitud, longitud, precision_m, motivo_sin_ubicacion, sin_conexion, estado_envio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [
        m.id,
        m.cuenta_id,
        m.clase,
        m.hora_telefono,
        m.latitud,
        m.longitud,
        m.precision_m,
        m.motivo_sin_ubicacion,
        m.sin_conexion ? 1 : 0,
      ],
    );
  },
  async porEnviar(cuentaId) {
    return abrir()
      .getAllSync<Fila>(
        `SELECT * FROM marcaciones_locales
         WHERE cuenta_id = ? AND estado_envio <> 'enviada' ORDER BY hora_telefono`,
        [cuentaId],
      )
      .map(aMarcacion);
  },
  async recientes(cuentaId) {
    return abrir()
      .getAllSync<Fila>(
        `SELECT * FROM marcaciones_locales WHERE cuenta_id = ? ORDER BY hora_telefono DESC LIMIT 20`,
        [cuentaId],
      )
      .map(aMarcacion);
  },
  async cambiarEstado(ids, estado, error = null) {
    const db = abrir();
    for (const id of ids) {
      db.runSync(
        `UPDATE marcaciones_locales
         SET estado_envio = ?, ultimo_error = ?, intentos = intentos + 1 WHERE id = ?`,
        [estado, error, id],
      );
    }
  },
  async limpiarEnviadas(antesDe) {
    abrir().runSync(
      `DELETE FROM marcaciones_locales WHERE estado_envio = 'enviada' AND hora_telefono < ?`,
      [antesDe],
    );
  },
};
