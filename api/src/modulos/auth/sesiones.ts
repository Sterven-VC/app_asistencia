import { createHash, randomBytes } from 'node:crypto';

import argon2 from 'argon2';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { type Ejecutor, pool } from '../../db/conexion.js';
import { ErrorHttp } from '../../errores.js';

const DURACION_PERSONAL = '90 days';
const DURACION_ADMIN = '8 hours';

export type RolPersonal = 'operario' | 'administrativo';

export type CuentaSesion = {
  id: string;
  dni: string;
  rol: RolPersonal | 'admin';
  estado: 'pendiente' | 'activa' | 'desactivada';
};

declare module 'fastify' {
  interface FastifyRequest {
    cuenta: CuentaSesion;
    tokenHash: string;
  }
}

export const hashear = (contrasena: string) => argon2.hash(contrasena, { type: argon2.argon2id });
export const verificar = (hash: string, contrasena: string) => argon2.verify(hash, contrasena);

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function crearSesion(cuenta: Pick<CuentaSesion, 'id' | 'rol'>, db: Ejecutor) {
  const token = randomBytes(32).toString('base64url');
  const duracion = cuenta.rol === 'admin' ? DURACION_ADMIN : DURACION_PERSONAL;
  const { rows } = await db.query<{ expira_en: Date }>(
    `INSERT INTO sesiones (cuenta_id, token_hash, expira_en)
     VALUES ($1, $2, now() + $3::interval) RETURNING expira_en`,
    [cuenta.id, hashToken(token), duracion],
  );
  return { token, expira_en: rows[0].expira_en };
}

export async function revocarSesiones(cuentaId: string, db: Ejecutor) {
  await db.query('UPDATE sesiones SET revocada_en = now() WHERE cuenta_id = $1 AND revocada_en IS NULL', [
    cuentaId,
  ]);
}

export async function revocarToken(tokenHash: string) {
  await pool.query('UPDATE sesiones SET revocada_en = now() WHERE token_hash = $1', [tokenHash]);
}

export async function autenticar(pedido: FastifyRequest, _respuesta: FastifyReply) {
  const encabezado = pedido.headers.authorization ?? '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : '';
  const invalida = new ErrorHttp(401, 'sesion_invalida', 'Tu sesión venció. Inicia sesión otra vez.');
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw invalida;

  const tokenHash = hashToken(token);
  // La sesión de personal se renueva como máximo una vez al día. La de admin vence a plazo fijo.
  const { rows } = await pool.query<CuentaSesion>(
    `WITH vigente AS (
       SELECT s.id AS sesion_id, s.expira_en, c.id, c.dni, c.rol, c.estado
       FROM sesiones s JOIN cuentas c ON c.id = s.cuenta_id
       WHERE s.token_hash = $1 AND s.revocada_en IS NULL AND s.expira_en > now()
         AND (c.rol <> 'admin' OR c.estado = 'activa')
     ), renovada AS (
       UPDATE sesiones s SET expira_en = now() + interval '${DURACION_PERSONAL}'
       FROM vigente v WHERE s.id = v.sesion_id AND v.rol <> 'admin'
         AND s.revocada_en IS NULL AND s.expira_en < now() + interval '89 days'
     )
     SELECT id, dni, rol, estado FROM vigente`,
    [tokenHash],
  );
  if (!rows[0]) throw invalida;
  pedido.cuenta = rows[0];
  pedido.tokenHash = tokenHash;
}

export async function soloAdmin(pedido: FastifyRequest, respuesta: FastifyReply) {
  await autenticar(pedido, respuesta);
  if (pedido.cuenta.rol !== 'admin') {
    throw new ErrorHttp(403, 'solo_admin', 'Usa tu cuenta de administración para esta acción.');
  }
}

export async function soloPersonal(pedido: FastifyRequest, respuesta: FastifyReply) {
  await autenticar(pedido, respuesta);
  if (pedido.cuenta.rol === 'admin') {
    throw new ErrorHttp(403, 'solo_personal', 'Usa tu cuenta de personal para esta acción.');
  }
}
