import cors from '@fastify/cors';
import Fastify, { LogController } from 'fastify';
import { ZodError } from 'zod';

import { config } from './config.js';
import { ErrorHttp } from './errores.js';
import { rutasAuth } from './modulos/auth/rutas.js';
import { soloAdmin } from './modulos/auth/sesiones.js';
import { rutasCuentas } from './modulos/cuentas/rutas.js';
import { rutasFaltas } from './modulos/faltas/rutas.js';
import { rutasMarcaciones } from './modulos/marcaciones/rutas.js';
import { rutasProyectos } from './modulos/proyectos/rutas.js';
import { rutasValidacion } from './modulos/validacion/rutas.js';

const origenesLocales = [
  'http://localhost:8081', 'http://127.0.0.1:8081',
  'http://localhost:8082', 'http://127.0.0.1:8082',
];

export async function crearApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test' && !process.env.VITEST,
    logController: new LogController({ disableRequestLogging: true }),
  });
  const origenes = config.CORS_ORIGENES ?? (process.env.NODE_ENV === 'production' ? [] : origenesLocales);
  await app.register(cors, {
    origin: origenes.length ? origenes : false,
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.addHook('onSend', async (_pedido, respuesta) => {
    respuesta.header('Cache-Control', 'no-store');
  });
  app.addHook('onResponse', async (pedido, respuesta) => {
    pedido.log.info({
      metodo: pedido.method,
      ruta: pedido.routeOptions.url,
      estado: respuesta.statusCode,
      duracionMs: respuesta.elapsedTime,
    }, 'Solicitud completada');
  });

  app.setErrorHandler((error, _pedido, respuesta) => {
    if (error instanceof ErrorHttp) {
      return respuesta.code(error.estado).send({ error: { codigo: error.codigo, mensaje: error.message } });
    }
    if (error instanceof ZodError) {
      return respuesta
        .code(400)
        .send({ error: { codigo: 'datos_invalidos', mensaje: 'Revisa los datos enviados' } });
    }
    if (error instanceof Error && 'statusCode' in error && typeof error.statusCode === 'number'
      && error.statusCode >= 400 && error.statusCode < 500) {
      return respuesta.code(error.statusCode).send({
        error: { codigo: 'solicitud_invalida', mensaje: 'Revisa los datos enviados' },
      });
    }
    _pedido.log.error({ tipo: error instanceof Error ? error.name : 'Desconocido' }, 'Falló la solicitud');
    return respuesta
      .code(500)
      .send({ error: { codigo: 'error_interno', mensaje: 'Ocurrió un error en el servidor' } });
  });

  await app.register(
    async (v1) => {
      v1.get('/salud', async () => ({ estado: 'ok' }));
      await v1.register(rutasAuth);
      await v1.register(rutasMarcaciones);
      await v1.register(async (admin) => {
        admin.addHook('onRequest', soloAdmin);
        await admin.register(rutasCuentas);
        await admin.register(rutasValidacion);
        await admin.register(rutasFaltas);
        await admin.register(rutasProyectos);
      }, { prefix: '/admin' });
    },
    { prefix: '/v1' },
  );

  return app;
}
