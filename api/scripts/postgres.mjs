// Clúster propio del proyecto, con el PostgreSQL ya instalado en la PC.
// Escucha solo en 127.0.0.1 y no toca los servidores de los puertos 5432 y 5433.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const datos = path.join(raiz, '.local/postgres');

/**
 * Usa PG_BIN si está definida. Si no, busca en la carpeta de instalación de Windows
 * la versión que creó el clúster o, en una PC nueva, la más reciente.
 */
function buscarBin() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  const base = 'C:/Program Files/PostgreSQL';
  const instaladas = existsSync(base)
    ? readdirSync(base)
        .filter((v) => /^\d+$/.test(v) && existsSync(path.join(base, v, 'bin', 'initdb.exe')))
        .sort((a, b) => Number(b) - Number(a))
    : [];
  const archivoVersion = path.join(datos, 'PG_VERSION');
  const versionDatos = existsSync(archivoVersion) ? readFileSync(archivoVersion, 'utf8').trim() : null;
  const elegida = versionDatos ? instaladas.find((v) => v === versionDatos) : instaladas[0];
  if (!elegida) {
    console.error(
      versionDatos
        ? `La base local se creó con PostgreSQL ${versionDatos} y esa versión no está instalada.`
        : 'No se encontró PostgreSQL en C:/Program Files/PostgreSQL. Instálalo o define PG_BIN.',
    );
    process.exit(1);
  }
  return path.join(base, elegida, 'bin');
}

const bin = buscarBin();
const registro = path.join(raiz, '.local/postgres.log');
const PUERTO = '5434';

const correr = (programa, argumentos) =>
  execFileSync(path.join(bin, programa), argumentos, { stdio: 'inherit' });

function estaCorriendo() {
  try {
    execFileSync(path.join(bin, 'pg_ctl.exe'), ['status', '-D', datos], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function crearBase(nombre) {
  try {
    execFileSync(path.join(bin, 'createdb.exe'), ['-h', '127.0.0.1', '-p', PUERTO, '-U', 'asistencia', nombre], {
      stdio: 'ignore',
    });
    console.log(`Base creada: ${nombre}`);
  } catch {
    // Ya existe.
  }
}

function iniciar() {
  if (!existsSync(path.join(datos, 'PG_VERSION'))) {
    mkdirSync(path.dirname(datos), { recursive: true });
    correr('initdb.exe', ['-D', datos, '-U', 'asistencia', '--auth=trust', '--encoding=UTF8', '--locale=C']);
  }
  if (!estaCorriendo()) {
    // Proceso separado: PostgreSQL sigue corriendo al terminar este script.
    const hijo = spawn(
      path.join(bin, 'pg_ctl.exe'),
      ['start', '-D', datos, '-l', registro, '-w', '-o', `-p ${PUERTO} -h 127.0.0.1`],
      { detached: true, stdio: 'ignore' },
    );
    hijo.unref();
    for (let i = 0; i < 40 && !estaCorriendo(); i++) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
  crearBase('asistencia_tmt');
  crearBase('asistencia_tmt_test');
  console.log(`PostgreSQL listo en 127.0.0.1:${PUERTO}`);
}

function detener() {
  if (estaCorriendo()) correr('pg_ctl.exe', ['stop', '-D', datos, '-m', 'fast']);
}

const orden = process.argv[2];
if (orden === 'iniciar') iniciar();
else if (orden === 'detener') detener();
else console.log('Uso: node scripts/postgres.mjs iniciar|detener');
