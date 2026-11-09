import type { CuentaSesion } from '@/tipos';
import { borrar, guardar, leer } from './almacen';

const CLAVE = 'sesion';
let escrituras = Promise.resolve();

export type SesionGuardada = {
  token: string;
  servidor: string;
  expira_en: string;
  cuenta: CuentaSesion;
};

async function leerActual(): Promise<SesionGuardada | null> {
  const texto = await leer(CLAVE);
  if (!texto) return null;
  try {
    const sesion = JSON.parse(texto) as Partial<SesionGuardada> | null;
    if (!sesion?.servidor || !sesion.token || !sesion.expira_en || !sesion.cuenta) return null;
    return sesion as SesionGuardada;
  } catch {
    return null;
  }
}

export async function leerSesionGuardada() {
  await escrituras;
  return leerActual();
}

function cambiarSesion(escribir: () => Promise<void>, tokenEsperado?: string) {
  const operacion = escrituras.then(async () => {
    if (tokenEsperado !== undefined && (await leerActual())?.token !== tokenEsperado) return false;
    await escribir();
    return true;
  });
  escrituras = operacion.then(() => undefined, () => undefined);
  return operacion;
}

export function guardarSesion(sesion: SesionGuardada, tokenEsperado?: string) {
  return cambiarSesion(() => guardar(CLAVE, JSON.stringify(sesion)), tokenEsperado);
}

export function borrarSesion(tokenEsperado: string) {
  return cambiarSesion(() => borrar(CLAVE), tokenEsperado);
}
