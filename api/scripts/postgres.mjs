// Clúster propio del proyecto, con el PostgreSQL 17 ya instalado.
// Escucha solo en 127.0.0.1 y no toca los servidores de los puertos 5432 y 5433.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bin = 'C:/Program Files/PostgreSQL/17/bin';
const datos = path.join(raiz, '.local/postgres');
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
