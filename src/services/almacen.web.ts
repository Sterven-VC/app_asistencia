// Solo para revisar pantallas en el navegador.
export async function leer(clave: string): Promise<string | null> {
  return globalThis.localStorage?.getItem(clave) ?? null;
}

export async function guardar(clave: string, valor: string): Promise<void> {
  globalThis.localStorage?.setItem(clave, valor);
}

export async function borrar(clave: string): Promise<void> {
  globalThis.localStorage?.removeItem(clave);
}
