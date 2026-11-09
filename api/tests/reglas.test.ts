import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { pool } from '../src/db/conexion.js';
import { cerrarDia, cerrarDiasPendientes } from '../src/tareas/cierre-dia.js';
import { type App, CONTRASENA, crearCuenta, faltasDe, limpiarBase, llamar, marcar, prepararApp, vigente } from './ayuda.js';

let app: App;

beforeAll(async () => {
  app = await prepararApp();
});
beforeEach(limpiarBase);
afterAll(async () => {
  await app?.close();
  await pool.end();
});

describe('registro inalterable', () => {
  it('PostgreSQL rechaza UPDATE y DELETE en las tablas de registro', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const marca = await marcar(app, c.token, { sinUbicacion: true });
    expect((await llamar(app, admin.token, 'POST', `/admin/marcaciones/${marca.id}/aprobar`, { tipo: 'oficina' })).statusCode).toBe(200);
    await llamar(app, admin.token, 'POST', `/admin/cuentas/${c.id}/pausas`, { desde: '2026-02-03', hasta: '2026-02-04' });
    await cerrarDia('2026-02-02');
    await llamar(app, admin.token, 'POST', '/admin/correcciones', {
      cuenta_id: c.id,
      fecha: '2026-02-02',
      es_falta: false,
      motivo: 'Estaba de comisión',
    });

    for (const tabla of ['marcaciones', 'validaciones', 'correcciones', 'faltas', 'anulaciones_falta', 'observaciones', 'eventos_cuenta']) {
      await expect(pool.query(`UPDATE ${tabla} SET id = id`)).rejects.toThrow(/inalterable/);
      await expect(pool.query(`DELETE FROM ${tabla}`)).rejects.toThrow(/inalterable/);
    }
  });
});

describe('cuentas y sesión', () => {
  const datos = {
    dni: '40000001',
    nombre_1: 'Rosa',
    apellido_paterno: 'Quispe',
    apellido_materno: 'Mamani',
    numero_referencia: '+51 900 000 000',
    rol: 'operario',
    contrasena: 'clave-segura',
  };

  it('registra con segundo nombre opcional y deja la cuenta pendiente', async () => {
    const r = await app.inject({ method: 'POST', url: '/v1/auth/registro', payload: datos });
    expect(r.statusCode).toBe(201);
    expect(r.json().estado).toBe('pendiente');
    expect(r.json().nombre_2).toBeNull();
  });

  it('rechaza DNI vacío, DNI repetido, rol admin y contraseña corta', async () => {
    const post = (payload: object) => app.inject({ method: 'POST', url: '/v1/auth/registro', payload });
    expect((await post({ ...datos, dni: '' })).statusCode).toBe(400);
    expect((await post({ ...datos, rol: 'admin' })).statusCode).toBe(400);
    expect((await post({ ...datos, contrasena: 'corta' })).statusCode).toBe(400);
    await post(datos);
    const repetido = await post(datos);
    expect(repetido.statusCode).toBe(409);
    expect(repetido.json().error.codigo).toBe('dni_duplicado');
  });

  it('una cuenta pendiente no puede marcar hasta que una admin la apruebe', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const nueva = await crearCuenta(app, { estado: 'pendiente' });
    expect((await marcar(app, nueva.token)).r.statusCode).toBe(403);

    const aprobada = await llamar(app, admin.token, 'POST', `/admin/cuentas/${nueva.id}/aprobar`, {
      rol: 'administrativo',
    });
    expect(aprobada.json().estado).toBe('activa');
    expect(aprobada.json().rol).toBe('administrativo');
    expect((await marcar(app, nueva.token)).resultado).toBe('guardada');
  });

  it('solo una admin entra a las rutas de admin', async () => {
    const c = await crearCuenta(app);
    expect((await llamar(app, c.token, 'GET', '/admin/cuentas')).statusCode).toBe(403);
    expect((await app.inject({ url: '/v1/admin/cuentas' })).statusCode).toBe(401);
  });

  it('bloquea la cuenta 15 minutos tras 5 intentos fallidos', async () => {
    const c = await crearCuenta(app);
    const entrar = (contrasena: string) =>
      app.inject({ method: 'POST', url: '/v1/auth/iniciar-sesion', payload: { dni: c.dni, contrasena } });
    for (let i = 0; i < 5; i++) expect((await entrar('mala')).statusCode).toBe(401);
    const bloqueada = await entrar(CONTRASENA);
    expect(bloqueada.statusCode).toBe(429);
    expect(bloqueada.json().error.codigo).toBe('cuenta_bloqueada');
  });

  it('cuenta también los intentos fallidos simultáneos', async () => {
    const c = await crearCuenta(app);
    const entrar = (contrasena: string) =>
      app.inject({ method: 'POST', url: '/v1/auth/iniciar-sesion', payload: { dni: c.dni, contrasena } });
    const resultados = await Promise.all(Array.from({ length: 5 }, () => entrar('mala')));
    expect(resultados.map((r) => r.statusCode)).toEqual([401, 401, 401, 401, 401]);
    expect((await entrar(CONTRASENA)).statusCode).toBe(429);
  });

  it('renueva la sesión con el uso y rechaza la sesión vencida', async () => {
    const c = await crearCuenta(app);
    await pool.query(`UPDATE sesiones SET expira_en = now() + interval '1 day' WHERE cuenta_id = $1`, [c.id]);
    expect((await llamar(app, c.token, 'GET', '/yo')).statusCode).toBe(200);
    const { rows } = await pool.query(
      `SELECT expira_en > now() + interval '89 days' AS renovada FROM sesiones WHERE cuenta_id = $1`,
      [c.id],
    );
    expect(rows[0].renovada).toBe(true);
    await pool.query(`UPDATE sesiones SET expira_en = now() - interval '1 day' WHERE cuenta_id = $1`, [c.id]);
    expect((await llamar(app, c.token, 'GET', '/yo')).statusCode).toBe(401);
  });

  it('desactivar revoca la sesión', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    await llamar(app, admin.token, 'POST', `/admin/cuentas/${c.id}/desactivar`, { motivo: 'Dejó la empresa' });
    expect((await llamar(app, c.token, 'GET', '/yo')).statusCode).toBe(401);
  });

  it('termina una pausa el día que comenzó y conserva el intervalo original y el evento', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const base = `/admin/cuentas/${c.id}/pausas`;
    const intervalo = { desde: '2026-03-09', hasta: '2026-03-10' };
    const creada = await llamar(app, admin.token, 'POST', base, intervalo);
    const pausaId = creada.json().pausas[0].id;
    const opciones = { hora: '2026-03-09T13:00:00Z' };
    expect((await marcar(app, c.token, opciones)).r.statusCode).toBe(403);

    const terminar = () => llamar(app, admin.token, 'PATCH', `${base}/${pausaId}`, { hasta: '2026-03-08' });
    const terminada = await terminar();
    expect(terminada.statusCode).toBe(200);
    expect(terminada.json().pausas).toEqual([]);
    expect((await terminar()).statusCode).toBe(200);
    expect((await marcar(app, c.token, opciones)).resultado).toBe('guardada');

    const pausa = await pool.query('SELECT desde, hasta, anulada_en FROM pausas WHERE id = $1', [pausaId]);
    expect(pausa.rows[0]).toMatchObject({ ...intervalo, anulada_en: expect.any(Date) });
    const eventos = await pool.query(
      `SELECT autor_id, detalle FROM eventos_cuenta WHERE cuenta_id = $1 AND evento = 'cambio_pausa'`,
      [c.id],
    );
    expect(eventos.rows).toEqual([{
      autor_id: admin.id,
      detalle: { pausaId, desde: intervalo.desde, hasta_anterior: intervalo.hasta, hasta: '2026-03-08', anulada: true },
    }]);
  });

  it('acorta una pausa anterior conservando los días ya cubiertos y permitiendo faltas desde su fin', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const base = `/admin/cuentas/${c.id}/pausas`;
    const creada = await llamar(app, admin.token, 'POST', base, { desde: '2026-03-07', hasta: '2026-03-10' });
    const pausaId = creada.json().pausas[0].id;
    const terminada = await llamar(app, admin.token, 'PATCH', `${base}/${pausaId}`, { hasta: '2026-03-08' });
    expect(terminada.json().pausas).toEqual([{ id: pausaId, desde: '2026-03-07', hasta: '2026-03-08' }]);

    await cerrarDia('2026-03-08');
    await cerrarDia('2026-03-09');
    expect((await faltasDe(c.id)).map((falta) => falta.fecha)).toEqual(['2026-03-09']);
  });
});

describe('marcación', () => {
  it('es idempotente: el mismo id no se duplica', async () => {
    const c = await crearCuenta(app);
    const id = randomUUID();
    expect((await marcar(app, c.token, { id })).resultado).toBe('guardada');
    expect((await marcar(app, c.token, { id })).resultado).toBe('ya_existia');
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM marcaciones');
    expect(rows[0].n).toBe(1);
  });

  it('un id de otra cuenta no se atribuye a quien tiene la sesión', async () => {
    const a = await crearCuenta(app);
    const b = await crearCuenta(app);
    const id = randomUUID();
    await marcar(app, a.token, { id });
    expect((await marcar(app, b.token, { id })).r.statusCode).toBe(400);
    expect((await vigente(id)).cuenta_id).toBe(a.id);
  });

  it('guarda una segunda entrada como repetida y observada, sin perderla', async () => {
    const c = await crearCuenta(app);
    await marcar(app, c.token, { hora: '2026-03-02T13:00:00Z' });
    const segunda = await marcar(app, c.token, { hora: '2026-03-02T14:00:00Z' });
    expect(segunda.resultado).toBe('repetida');
    const m = await vigente(segunda.id);
    expect(m.es_repetida).toBe(true);
    expect(m.observaciones).toContain('marcacion_repetida');
  });

  it('serializa envíos simultáneos de una cuenta y confirma cada identificador', async () => {
    const c = await crearCuenta(app);
    const opciones = { hora: '2026-03-02T13:00:00Z' };
    const resultados = await Promise.all([marcar(app, c.token, opciones), marcar(app, c.token, opciones)]);
    expect(resultados.map(({ resultado }) => resultado).sort()).toEqual(['guardada', 'repetida']);
    expect(resultados.every(({ r, id }) => r.json().resultados[0].id === id)).toBe(true);
  });

  it('revierte un lote con un rechazo sin confirmar ni persistir resultados parciales', async () => {
    const c = await crearCuenta(app);
    const hora = new Date().toISOString();
    const entrada = {
      id: randomUUID(), clase: 'entrada', hora_telefono: hora, sin_conexion: false,
      latitud: null, longitud: null, precision_m: null, motivo_sin_ubicacion: 'sin_gps',
    };
    const r = await llamar(app, c.token, 'POST', '/marcaciones/sincronizar', {
      hora_envio_telefono: hora,
      marcaciones: [entrada, { ...entrada, id: randomUUID(), clase: 'salida' }],
    });
    expect(r.statusCode).toBe(400);
    expect(await vigente(entrada.id)).toBeUndefined();
  });

  it('rechaza la marca en línea durante una pausa y conserva la marca sin señal observada', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    await llamar(app, admin.token, 'POST', `/admin/cuentas/${c.id}/pausas`, {
      desde: '2026-03-01', hasta: '2026-03-03',
    });
    const hora = '2026-03-02T13:00:00Z';
    const enLinea = await marcar(app, c.token, { hora });
    expect(enLinea.r.statusCode).toBe(403);
    expect(await vigente(enLinea.id)).toBeUndefined();
    const sinSenal = await marcar(app, c.token, { hora, sinConexion: true });
    expect(sinSenal.resultado).toBe('guardada');
    expect((await vigente(sinSenal.id)).observaciones).toContain('cuenta_no_activa');
  });

  it('corrige un reloj desfasado y conserva ambas horas', async () => {
    const c = await crearCuenta(app);
    const telefono = new Date(Date.now() - 3600_000);
    const { id } = await marcar(app, c.token, { hora: telefono.toISOString(), envio: telefono.toISOString() });
    const m = await vigente(id);
    expect(Math.abs(m.desfase_segundos - 3600)).toBeLessThan(5);
    expect(new Date(m.hora_telefono).getTime()).toBe(telefono.getTime());
    expect(Math.abs(new Date(m.hora_oficial).getTime() - Date.now())).toBeLessThan(5000);
  });

  it('sin ubicación se guarda y queda observada', async () => {
    const c = await crearCuenta(app);
    const { id } = await marcar(app, c.token, { sinUbicacion: true });
    expect((await vigente(id)).observaciones).toContain('sin_ubicacion');
  });

  it('el personal operario no registra salida', async () => {
    const c = await crearCuenta(app);
    expect((await marcar(app, c.token, { clase: 'salida' })).r.statusCode).toBe(400);
  });

  it('calcula el tiempo extra de una salida a las 20:00', async () => {
    const c = await crearCuenta(app, { rol: 'administrativo' });
    await marcar(app, c.token, { hora: '2026-03-02T13:00:00Z' });
    const { id } = await marcar(app, c.token, { clase: 'salida', hora: '2026-03-03T01:00:00Z' });
    const m = await vigente(id);
    expect(m.minutos_extra).toBe(90);
    expect(m.fecha_laboral).toBe('2026-03-02');
  });

  it('una salida después de medianoche pertenece al día de su entrada', async () => {
    const c = await crearCuenta(app, { rol: 'administrativo' });
    await marcar(app, c.token, { hora: '2026-03-02T23:00:00Z' });
    const { id } = await marcar(app, c.token, { clase: 'salida', hora: '2026-03-03T06:00:00Z' });
    expect((await vigente(id)).fecha_laboral).toBe('2026-03-02');
  });

  it('permite completar el tipo de una autoaprobación anterior desde la cuenta exclusiva', async () => {
    const personal = await crearCuenta(app, { rol: 'administrativo' });
    const admin = await crearCuenta(app, { rol: 'admin', dni: personal.dni });
    const { id } = await marcar(app, personal.token);
    await pool.query(
      `INSERT INTO validaciones (marcacion_id, decision, automatica, autor_id) VALUES ($1, 'aprobada', true, $2)`,
      [id, personal.id],
    );
    let m = await vigente(id);
    expect(m.estado).toBe('aprobada');
    expect(m.automatica).toBe(true);
    expect(m.tipo).toBeNull();

    const sinTipo = await llamar(app, admin.token, 'GET', '/admin/marcaciones?sin_tipo=true');
    expect(sinTipo.json().items).toHaveLength(1);

    const otra = await crearCuenta(app, { rol: 'admin' });
    const ajena = await llamar(app, otra.token, 'POST', `/admin/marcaciones/${id}/aprobar`, { tipo: 'oficina' });
    expect(ajena.statusCode).toBe(403);

    await llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/aprobar`, { tipo: 'oficina' });
    m = await vigente(id);
    expect(m.tipo).toBe('oficina');
    expect(m.automatica).toBe(true);

    const detalle = await llamar(app, admin.token, 'GET', `/admin/marcaciones/${id}`);
    expect(detalle.json().validaciones).toMatchObject([
      { automatica: false, autor_id: admin.id, tipo: 'oficina' },
      { automatica: true, autor_id: personal.id, tipo: null },
    ]);
  });
});

describe('validación', () => {
  it('una entrada exige tipo y, si es Proyecto, el proyecto', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const { id } = await marcar(app, c.token);
    const aprobar = (cuerpo: object) => llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/aprobar`, cuerpo);

    expect((await aprobar({})).json().error.codigo).toBe('tipo_requerido');
    expect((await aprobar({ tipo: 'proyecto' })).json().error.codigo).toBe('proyecto_requerido');
    expect((await aprobar({ tipo: 'proyecto', proyecto_id: randomUUID() })).json().error.codigo).toBe('proyecto_requerido');

    const p = await llamar(app, admin.token, 'POST', '/admin/proyectos', { nombre: 'Presa Norte' });
    const ok = await aprobar({ tipo: 'proyecto', proyecto_id: p.json().id });
    expect(ok.json().estado).toBe('aprobada');
    expect(ok.json().proyecto).toBe('Presa Norte');
    await llamar(app, admin.token, 'PATCH', `/admin/proyectos/${p.json().id}`, { activo: false });
    const guardada = await llamar(app, admin.token, 'GET', `/admin/marcaciones/${id}`);
    expect(guardada.json().proyecto).toBe('Presa Norte');
    expect((await aprobar({ tipo: 'oficina' })).statusCode).toBe(409);
  });

  it('registra una sola decisión cuando se intenta aprobar y rechazar al mismo tiempo', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const { id } = await marcar(app, c.token);
    const base = `/admin/marcaciones/${id}`;
    const respuestas = await Promise.all([
      llamar(app, admin.token, 'POST', `${base}/aprobar`, { tipo: 'oficina' }),
      llamar(app, admin.token, 'POST', `${base}/rechazar`, { motivo: 'Fuera de la oficina' }),
    ]);
    expect(respuestas.map((r) => r.statusCode).sort()).toEqual([200, 409]);
    const detalle = (await llamar(app, admin.token, 'GET', base)).json();
    expect(detalle.validaciones).toHaveLength(1);
    expect(await faltasDe(c.id)).toHaveLength(detalle.estado === 'rechazada' ? 1 : 0);
  });

  it('rechazar una entrada exige motivo y genera falta, aunque sea domingo', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app, { rol: 'administrativo' });
    const { id } = await marcar(app, c.token, { hora: '2026-03-01T14:00:00Z' });
    const rechazar = (motivo: string) =>
      llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/rechazar`, { motivo });

    expect((await rechazar('  ')).json().error.codigo).toBe('motivo_requerido');
    expect((await rechazar('Fuera de la obra')).json().estado).toBe('rechazada');
    expect(await faltasDe(c.id)).toEqual([
      { fecha: '2026-03-01', origen: 'rechazo', anulada: false, origen_anulacion: null },
    ]);
  });

  it('rechazar una salida quita el tiempo extra y no genera falta', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app, { rol: 'administrativo' });
    await marcar(app, c.token, { hora: '2026-03-02T13:00:00Z' });
    const { id } = await marcar(app, c.token, { clase: 'salida', hora: '2026-03-03T01:00:00Z' });

    const rechazada = await llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/rechazar`, { motivo: 'Se fue a su hora' });
    expect(rechazada.json().minutos_extra).toBe(0);
    expect((await vigente(id)).minutos_extra).toBe(90);
    expect(await faltasDe(c.id)).toEqual([]);

    const h = await llamar(app, c.token, 'GET', '/yo/historial');
    const salida = h.json().items.find((i: { id: string }) => i.id === id);
    expect(salida.minutos_extra).toBe(0);
    expect(salida.estado).toBe('rechazada');
  });

  it('aprobar una salida no pide tipo y conserva el tiempo extra', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app, { rol: 'administrativo' });
    await marcar(app, c.token, { hora: '2026-03-02T13:00:00Z' });
    const { id } = await marcar(app, c.token, { clase: 'salida', hora: '2026-03-03T01:00:00Z' });
    const r = await llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/aprobar`, {});
    expect(r.json().estado).toBe('aprobada');
    expect(r.json().minutos_extra).toBe(90);
  });

  it('filtra por estado, persona, fecha y observadas', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const a = await crearCuenta(app);
    const b = await crearCuenta(app);
    await marcar(app, a.token, { hora: '2026-03-02T13:00:00Z', sinUbicacion: true });
    await marcar(app, b.token, { hora: '2026-03-03T13:00:00Z' });
    const contar = async (q: string) =>
      (await llamar(app, admin.token, 'GET', `/admin/marcaciones?${q}`)).json().items.length;

    expect(await contar('estado=pendiente')).toBe(2);
    expect(await contar(`cuenta_id=${a.id}`)).toBe(1);
    expect(await contar('fecha=2026-03-03')).toBe(1);
    expect(await contar('observada=true')).toBe(1);
  });
});

describe('faltas', () => {
  // 2026-03-07 es sábado y 2026-03-09 es lunes.
  it('el personal operario tiene falta todos los días; el administrativo de lunes a viernes', async () => {
    const operario = await crearCuenta(app);
    const administrativo = await crearCuenta(app, { rol: 'administrativo' });
    await cerrarDia('2026-03-07');
    await cerrarDia('2026-03-09');
    expect((await faltasDe(operario.id)).map((f) => f.fecha)).toEqual(['2026-03-07', '2026-03-09']);
    expect((await faltasDe(administrativo.id)).map((f) => f.fecha)).toEqual(['2026-03-09']);
  });

  it('no genera falta a cuentas pausadas, nuevas, pendientes ni con marcación', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const pausada = await crearCuenta(app);
    await llamar(app, admin.token, 'POST', `/admin/cuentas/${pausada.id}/pausas`, {
      desde: '2026-03-08',
      hasta: '2026-03-10',
    });
    const nueva = await crearCuenta(app, { aprobada_en: '2026-03-09T15:00:00Z' });
    const pendiente = await crearCuenta(app, { estado: 'pendiente' });
    const conMarca = await crearCuenta(app);
    await marcar(app, conMarca.token, { hora: '2026-03-09T13:00:00Z' });

    await cerrarDia('2026-03-09');
    for (const c of [pausada, nueva, pendiente, conMarca]) expect(await faltasDe(c.id)).toEqual([]);
  });

  it('el cierre es idempotente y recupera días si la PC estuvo apagada', async () => {
    const c = await crearCuenta(app, { aprobada_en: '2026-03-01T12:00:00Z' });
    await cerrarDiasPendientes(new Date('2026-03-05T12:00:00Z'));
    await cerrarDiasPendientes(new Date('2026-03-05T12:00:00Z'));
    expect((await faltasDe(c.id)).map((f) => f.fecha)).toEqual([
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
    ]);
  });

  it('una marcación que llega tarde anula la falta y deja rastro', async () => {
    const c = await crearCuenta(app);
    await cerrarDia('2026-03-09');
    await marcar(app, c.token, { hora: '2026-03-09T13:00:00Z', sinConexion: true });
    expect(await faltasDe(c.id)).toEqual([
      { fecha: '2026-03-09', origen: 'sin_marcacion', anulada: true, origen_anulacion: 'marcacion_tardia' },
    ]);
  });

  it('observa la salida faltante del personal administrativo', async () => {
    const c = await crearCuenta(app, { rol: 'administrativo' });
    const { id } = await marcar(app, c.token, { hora: '2026-03-09T13:00:00Z' });
    await cerrarDia('2026-03-09');
    expect((await vigente(id)).observaciones).toContain('salida_faltante');
  });
});

describe('correcciones', () => {
  it('solo decide si un día es falta o no, con motivo y rastro', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    await cerrarDia('2026-03-09');

    const corregir = (es_falta: boolean, motivo: string) =>
      llamar(app, admin.token, 'POST', '/admin/correcciones', {
        cuenta_id: c.id,
        fecha: '2026-03-09',
        es_falta,
        motivo,
      });

    expect((await corregir(false, '')).json().error.codigo).toBe('motivo_requerido');
    expect((await corregir(true, 'Sin cambio')).json().error.codigo).toBe('sin_cambios');
    expect((await corregir(false, 'Estaba de comisión')).statusCode).toBe(201);
    expect((await faltasDe(c.id))[0].anulada).toBe(true);

    expect((await corregir(true, 'Se confirmó la ausencia')).statusCode).toBe(201);
    const { rows } = await pool.query('SELECT motivo, autor_id FROM correcciones ORDER BY creado_en');
    expect(rows).toHaveLength(2);
    expect(rows[0].autor_id).toBe(admin.id);

    const { items } = (await llamar(app, admin.token, 'GET', `/admin/faltas?cuenta_id=${c.id}&fecha=2026-03-09`)).json();
    expect(items).toHaveLength(2);
    const original = items.find((f: { origen: string }) => f.origen === 'sin_marcacion');
    expect(original).toMatchObject({ anulada: true, es_falta: true });
    expect(original.correcciones).toMatchObject([
      { motivo: 'Se confirmó la ausencia', autor_id: admin.id, es_falta_anterior: false, es_falta_nuevo: true },
      { motivo: 'Estaba de comisión', autor_id: admin.id, es_falta_anterior: true, es_falta_nuevo: false },
    ]);
  });

  it('acepta una sola corrección simultánea y rechaza fechas inválidas o campos ajenos', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const datos = { cuenta_id: c.id, fecha: '2026-03-09', es_falta: true, motivo: 'Ausencia confirmada' };
    const corregir = (cuerpo: object) => llamar(app, admin.token, 'POST', '/admin/correcciones', cuerpo);
    expect((await corregir({ ...datos, fecha: '2026-02-30' })).statusCode).toBe(400);
    expect((await corregir({ ...datos, hora_oficial: '2026-03-09T13:00:00Z' })).statusCode).toBe(400);
    const respuestas = await Promise.all([corregir(datos), corregir(datos)]);
    expect(respuestas.map((r) => r.statusCode).sort()).toEqual([201, 409]);
    expect(await faltasDe(c.id)).toHaveLength(1);
  });

  it('no existe ninguna ruta para cambiar la hora', async () => {
    const admin = await crearCuenta(app, { rol: 'admin' });
    const c = await crearCuenta(app);
    const { id } = await marcar(app, c.token);
    const r = await llamar(app, admin.token, 'POST', `/admin/marcaciones/${id}/correcciones`, {
      campo: 'hora_oficial',
      valor_nuevo: '2026-01-01T00:00:00Z',
      motivo: 'x',
    });
    expect(r.statusCode).toBe(404);
  });

  it('una persona no puede corregir', async () => {
    const c = await crearCuenta(app);
    const r = await llamar(app, c.token, 'POST', '/admin/correcciones', {
      cuenta_id: c.id,
      fecha: '2026-03-09',
      es_falta: false,
      motivo: 'x',
    });
    expect(r.statusCode).toBe(403);
  });
});

describe('historial', () => {
  it('cada persona ve solo lo suyo', async () => {
    const a = await crearCuenta(app);
    const b = await crearCuenta(app);
    const propia = await marcar(app, a.token);
    await marcar(app, b.token);
    const h = await llamar(app, a.token, 'GET', '/yo/historial');
    expect(h.json().items.map((i: { id: string }) => i.id)).toEqual([propia.id]);
  });
});
