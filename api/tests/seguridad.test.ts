import { readFileSync } from 'node:fs';

import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';

import { pool } from '../src/db/conexion.js';
import { crearCuentaAdmin } from '../src/modulos/cuentas/administracion.js';
import { cerrarDia } from '../src/tareas/cierre-dia.js';
import { type App, CONTRASENA, crearCuenta, faltasDe, limpiarBase, llamar, marcar, prepararApp } from './ayuda.js';

const CLAVE_ADMIN = 'secreto-de-administracion-de-prueba';
let app: App;

beforeAll(async () => { app = await prepararApp(); });
beforeEach(limpiarBase);
afterAll(async () => {
  await app?.close();
  await pool.end();
});

it('separa la identidad, la clave y los permisos al compartir el mismo DNI', async () => {
  const personal = await crearCuenta(app, { rol: 'administrativo' });
  await expect(crearCuentaAdmin(personal.dni, CONTRASENA)).rejects.toMatchObject({ codigo: 'clave_reutilizada' });
  const admin = await crearCuentaAdmin(personal.dni, CLAVE_ADMIN);
  const entrar = (identificador: string, contrasena: string) =>
    app.inject({ method: 'POST', url: '/v1/auth/iniciar-sesion', payload: { identificador, contrasena } });

  expect(admin.id).not.toBe(personal.id);
  expect((await entrar(personal.dni, CLAVE_ADMIN)).statusCode).toBe(401);
  expect((await entrar(admin.identificador, CONTRASENA)).statusCode).toBe(401);
  const sesion = await entrar(admin.identificador, CLAVE_ADMIN);
  expect(sesion.statusCode).toBe(200);
  expect(sesion.json().cuenta).toMatchObject({ id: admin.id, rol: 'admin' });
  const token = sesion.json().token as string;

  expect((await llamar(app, personal.token, 'GET', '/admin/cuentas')).statusCode).toBe(403);
  expect((await marcar(app, token, { sinConexion: true })).r.json().error.codigo).toBe('solo_personal');
  expect((await llamar(app, token, 'GET', '/yo/historial')).statusCode).toBe(403);
  const cuentas = await llamar(app, token, 'GET', '/admin/cuentas');
  expect(cuentas.json().items.map((cuenta: { id: string }) => cuenta.id)).toEqual([personal.id]);
  expect((await llamar(app, token, 'GET', `/admin/cuentas/${admin.id}`)).statusCode).toBe(404);
  const faltaAdmin = await llamar(app, token, 'POST', '/admin/correcciones', {
    cuenta_id: admin.id, fecha: '2026-02-02', es_falta: true, motivo: 'Prueba',
  });
  expect(faltaAdmin.statusCode).toBe(404);
  const marca = await marcar(app, personal.token);
  expect(marca.resultado).toBe('guardada');
  const pendiente = await llamar(app, token, 'GET', `/admin/marcaciones/${marca.id}`);
  expect(pendiente.json().estado).toBe('pendiente');
});

it('excluye a la cuenta exclusiva del cierre y rechaza cambios de ámbito en PostgreSQL', async () => {
  const admin = await crearCuenta(app, { rol: 'admin' });
  const personal = await crearCuenta(app);
  await cerrarDia('2026-02-02');
  expect(await faltasDe(admin.id)).toEqual([]);
  expect(await faltasDe(personal.id)).toHaveLength(1);
  await expect(pool.query('UPDATE cuentas SET rol = $2 WHERE id = $1', [personal.id, 'admin']))
    .rejects.toMatchObject({ code: '23514' });
  await expect(pool.query(`INSERT INTO faltas (cuenta_id, fecha, origen) VALUES ($1, '2026-02-02', 'correccion')`, [admin.id]))
    .rejects.toMatchObject({ code: '23514' });
});

it('la sesión de administración vence en ocho horas y no se renueva al usarla', async () => {
  const admin = await crearCuenta(app, { rol: 'admin' });
  const { rows: [anterior] } = await pool.query(
    'SELECT expira_en, extract(epoch FROM (expira_en - creada_en)) AS segundos FROM sesiones WHERE cuenta_id = $1',
    [admin.id],
  );
  expect(Number(anterior.segundos)).toBe(8 * 3600);
  expect((await llamar(app, admin.token, 'GET', '/admin/proyectos')).statusCode).toBe(200);
  const { rows: [despues] } = await pool.query('SELECT expira_en FROM sesiones WHERE cuenta_id = $1', [admin.id]);
  expect(despues.expira_en).toEqual(anterior.expira_en);
  await pool.query("UPDATE sesiones SET expira_en = now() - interval '1 second' WHERE cuenta_id = $1", [admin.id]);
  expect((await llamar(app, admin.token, 'GET', '/admin/proyectos')).statusCode).toBe(401);
});

it('restringe CORS a los orígenes permitidos y evita almacenar respuestas de la API', async () => {
  const url = '/v1/salud';
  const permitida = await app.inject({ url, headers: { origin: 'http://localhost:8081' } });
  expect(permitida.headers['access-control-allow-origin']).toBe('http://localhost:8081');
  expect(permitida.headers['cache-control']).toBe('no-store');
  const ajena = await app.inject({ url, headers: { origin: 'https://ajeno.example' } });
  expect(ajena.headers['access-control-allow-origin']).toBeUndefined();
});

it('migra una cuenta mixta con su ID, rol y autoría, y revoca su sesión', async () => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query('CREATE SCHEMA prueba_migracion_003');
    await cliente.query('SET LOCAL search_path TO prueba_migracion_003');
    const sql = (archivo: string) =>
      readFileSync(new URL(`../src/db/migraciones/${archivo}`, import.meta.url), 'utf8');
    await cliente.query(sql('001_inicial.sql'));
    await cliente.query(sql('002_anulacion_pausas.sql'));
    const { rows: [antigua] } = await cliente.query(
      `INSERT INTO cuentas (dni, nombre_1, apellido_paterno, apellido_materno, numero_referencia,
         rol, es_admin, estado, contrasena_hash)
       VALUES ('10000001', 'Ana', 'Prueba', 'Local', '000', 'administrativo', true, 'activa', 'hash-prueba')
       RETURNING id`,
    );
    await cliente.query(
      "INSERT INTO sesiones (cuenta_id, token_hash, expira_en) VALUES ($1, 'hash-sesion-prueba', now() + interval '1 day')",
      [antigua.id],
    );
    await cliente.query(
      `INSERT INTO proyectos (nombre, creado_por) VALUES ('Proyecto histórico', $1)`,
      [antigua.id],
    );

    await cliente.query(sql('003_cuentas_exclusivas.sql'));

    const { rows: [cuenta] } = await cliente.query('SELECT id, rol, estado, contrasena_hash FROM cuentas WHERE dni = $1', ['10000001']);
    expect(cuenta).toEqual({ id: antigua.id, rol: 'administrativo', estado: 'activa', contrasena_hash: 'hash-prueba' });
    expect((await cliente.query('SELECT revocada_en FROM sesiones')).rows[0].revocada_en).toBeInstanceOf(Date);
    expect((await cliente.query('SELECT creado_por FROM proyectos')).rows[0].creado_por).toBe(antigua.id);
    expect((await cliente.query('SELECT evento FROM eventos_cuenta')).rows[0].evento).toBe('separacion_admin');
  } finally {
    await cliente.query('ROLLBACK');
    cliente.release();
  }
});
