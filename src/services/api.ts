import Constants from 'expo-constants';

import { guardar, leer } from './almacen';
import { leerSesionGuardada, type SesionGuardada } from './sesion-almacen';

const CLAVE_SERVIDOR = 'servidor_api';
const POR_DEFECTO = 'http://localhost:3000/v1';
const EQUIPOS_LOCALES = ['localhost', '127.0.0.1', '10.0.2.2', '[::1]'];

let servidor: string | null = null;

export class ErrorApi extends Error {
  constructor(
    public codigo: string,
    mensaje: string,
    public estado: number,
  ) {
    super(mensaje);
  }
}

export class ErrorRed extends Error {
  constructor() {
    super('No hay conexión con el servidor. Inténtalo de nuevo.');
  }
}

export function validarServidor(valor: string): string {
  let url: URL;
  try {
    url = new URL(valor.trim());
  } catch {
    throw new Error('Escribe una dirección válida del servidor.');
  }
  const extra = Constants.expoConfig?.extra;
  const httpLocal = url.protocol === 'http:' && (__DEV__ || extra?.permitirHttp === true)
    && EQUIPOS_LOCALES.includes(url.hostname);
  if (url.protocol !== 'https:' && !httpLocal) {
    throw new Error('El servidor debe usar HTTPS. Para pruebas locales puedes usar localhost.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Usa la dirección base del servidor.');
  }
  const ruta = url.pathname.replace(/\/+$/, '');
  return url.origin + (ruta.endsWith('/v1') ? ruta : `${ruta}/v1`);
}

export async function obtenerServidor(): Promise<string> {
  if (servidor) return servidor;
  const guardado = await leer(CLAVE_SERVIDOR);
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  servidor = guardado || extra?.apiUrl || POR_DEFECTO;
  return servidor;
}

export async function cambiarServidor(valor: string): Promise<void> {
  const validado = validarServidor(valor);
  await guardar(CLAVE_SERVIDOR, validado);
  servidor = validado;
}

export async function pedir<T>(
  ruta: string,
  opciones: {
    metodo?: string;
    cuerpo?: unknown;
    sesion?: Pick<SesionGuardada, 'servidor' | 'token'> | null;
    servidor?: string;
  } = {},
): Promise<T> {
  const sesion = opciones.sesion === undefined ? await leerSesionGuardada() : opciones.sesion;
  const base = validarServidor(sesion?.servidor ?? opciones.servidor ?? await obtenerServidor());
  const controlador = new AbortController();
  const limite = setTimeout(() => controlador.abort(), 15_000);
  let respuesta: Response;
  let texto: string;
  try {
    respuesta = await fetch(`${base}${ruta}`, {
      method: opciones.metodo ?? 'GET',
      headers: {
        ...(opciones.cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}),
      },
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      signal: controlador.signal,
    });
    if (respuesta.status === 204) return undefined as T;
    texto = await respuesta.text();
  } catch {
    throw new ErrorRed();
  } finally {
    clearTimeout(limite);
  }

  let datos: unknown = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    // Un túnel privado responde HTML en vez de JSON.
    throw new ErrorApi('respuesta_invalida', 'El servidor no respondió como se esperaba.', respuesta.status);
  }

  if (!respuesta.ok) {
    const error = (datos as { error?: { codigo?: string; mensaje?: string } } | null)?.error;
    throw new ErrorApi(
      error?.codigo ?? 'error',
      error?.mensaje ?? 'No se pudo completar la acción.',
      respuesta.status,
    );
  }
  return datos as T;
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'No se pudo completar la acción.';
}
