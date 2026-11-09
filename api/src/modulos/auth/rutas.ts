import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { enTransaccion, pool } from '../../db/conexion.js';
import { ErrorHttp } from '../../errores.js';
import { cuentaConPausas } from '../cuentas/consulta.js';
import { autenticar, type CuentaSesion, crearSesion, hashear, revocarToken, verificar } from './sesiones.js';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

const texto = z.string().trim().min(1).max(120);
const dniValido = z.string().regex(/^\d{8}$/);
const claveIngreso = z.string().min(1).max(256);
const cuerpoAcotado = { bodyLimit: 8 * 1024 };

const registro = z.strictObject({
  dni: dniValido,
  nombre_1: texto,
  nombre_2: z.string().trim().max(120).optional().nullable(),
  apellido_paterno: texto,
  apellido_materno: texto,
  numero_referencia: texto,
  rol: z.enum(['operario', 'administrativo']),
  contrasena: z.string().min(8).max(256),
});

const ingreso = z.union([
  z.strictObject({ dni: dniValido, contrasena: claveIngreso }),
  z.strictObject({
    identificador: z.string().trim().toLowerCase().regex(/^(?:admin\.)?\d{8}$/),
    contrasena: claveIngreso,
  }),
]);

export async function rutasAuth(app: FastifyInstance) {
  app.post('/auth/registro', cuerpoAcotado, async (pedido, respuesta) => {
    const d = registro.parse(pedido.body);
    try {
      const { rows } = await pool.query<{ id: string }>(
        `INSERT INTO cuentas
         (dni, nombre_1, nombre_2, apellido_paterno, apellido_materno, numero_referencia, rol, contrasena_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          d.dni,
          d.nombre_1,
          d.nombre_2 || null,
          d.apellido_paterno,
          d.apellido_materno,
          d.numero_referencia,
          d.rol,
          await hashear(d.contrasena),
        ],
      );
      return respuesta.code(201).send(await cuentaConPausas(rows[0].id));
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ErrorHttp(409, 'dni_duplicado', 'Ese DNI ya tiene una cuenta');
      }
      throw error;
    }
  });

  app.post('/auth/iniciar-sesion', cuerpoAcotado, async (pedido) => {
    const datos = ingreso.parse(pedido.body);
    const identificador = 'dni' in datos ? datos.dni : datos.identificador;
    const admin = identificador.startsWith('admin.');
    const dni = admin ? identificador.slice('admin.'.length) : identificador;
    const incorrecto = new ErrorHttp(401, 'credenciales_invalidas', 'Usuario o contraseña incorrectos');

    const resultado = await enTransaccion(async (c) => {
      const { rows } = await c.query<{
        id: string;
        rol: CuentaSesion['rol'];
        contrasena_hash: string;
        intentos_fallidos: number;
        bloqueada: boolean;
      }>(
        `SELECT id, rol, contrasena_hash, intentos_fallidos,
                COALESCE(bloqueada_hasta > clock_timestamp(), false) AS bloqueada
         FROM cuentas WHERE dni = $1 AND (rol = 'admin') = $2
           AND (rol <> 'admin' OR estado = 'activa') FOR NO KEY UPDATE`,
        [dni, admin],
      );
      const cuenta = rows[0];
      if (!cuenta) return null;
      if (cuenta.bloqueada) {
        throw new ErrorHttp(429, 'cuenta_bloqueada', `Demasiados intentos. Espera ${MINUTOS_BLOQUEO} minutos.`);
      }

      if (!(await verificar(cuenta.contrasena_hash, datos.contrasena))) {
        const intentos = cuenta.intentos_fallidos + 1;
        const bloquear = intentos >= MAX_INTENTOS;
        await c.query(
          `UPDATE cuentas SET intentos_fallidos = $2,
           bloqueada_hasta = CASE WHEN $3 THEN clock_timestamp() + interval '${MINUTOS_BLOQUEO} minutes' ELSE NULL END
           WHERE id = $1`,
          [cuenta.id, bloquear ? 0 : intentos, bloquear],
        );
        return null;
      }

      await c.query('UPDATE cuentas SET intentos_fallidos = 0, bloqueada_hasta = NULL WHERE id = $1', [cuenta.id]);
      const sesion = await crearSesion(cuenta, c);
      return { ...sesion, cuenta: await cuentaConPausas(cuenta.id, c) };
    });
    if (!resultado) throw incorrecto;
    return resultado;
  });

  app.post('/auth/cerrar-sesion', { preHandler: autenticar }, async (pedido, respuesta) => {
    await revocarToken(pedido.tokenHash);
    return respuesta.code(204).send();
  });

  app.get('/yo', { preHandler: autenticar }, async (pedido) => cuentaConPausas(pedido.cuenta.id));
}
