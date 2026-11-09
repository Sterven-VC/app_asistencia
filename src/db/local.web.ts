import type { MarcacionLocal, TiendaLocal } from './tipos';

// Solo para revisar pantallas en el navegador. El APK usa SQLite.
const CLAVE = 'marcaciones_locales';

const todas = (): MarcacionLocal[] =>
  JSON.parse(globalThis.localStorage?.getItem(CLAVE) ?? '[]') as MarcacionLocal[];
const escribir = (lista: MarcacionLocal[]) =>
  globalThis.localStorage?.setItem(CLAVE, JSON.stringify(lista));

export const tienda: TiendaLocal = {
  async guardar(m) {
    escribir([...todas(), { ...m, estado_envio: 'pendiente', intentos: 0, ultimo_error: null }]);
  },
  async porEnviar(cuentaId) {
    return todas()
      .filter((m) => m.cuenta_id === cuentaId && m.estado_envio !== 'enviada')
      .sort((a, b) => a.hora_telefono.localeCompare(b.hora_telefono));
  },
  async recientes(cuentaId) {
    return todas()
      .filter((m) => m.cuenta_id === cuentaId)
      .sort((a, b) => b.hora_telefono.localeCompare(a.hora_telefono))
      .slice(0, 20);
  },
  async cambiarEstado(ids, estado, error = null) {
    escribir(
      todas().map((m) =>
        ids.includes(m.id)
          ? { ...m, estado_envio: estado, ultimo_error: error, intentos: m.intentos + 1 }
          : m,
      ),
    );
  },
  async limpiarEnviadas(antesDe) {
    escribir(todas().filter((m) => !(m.estado_envio === 'enviada' && m.hora_telefono < antesDe)));
  },
};
