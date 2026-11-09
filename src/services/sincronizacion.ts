import NetInfo from '@react-native-community/netinfo';

import { tienda } from '@/db/local';
import type { MarcacionLocal } from '@/db/tipos';
import { ErrorApi, pedir } from './api';
import { enviarPendientes } from './cola-marcaciones';
import { leerSesionGuardada } from './sesion-almacen';

type Resultado = { id: string; resultado: 'guardada' | 'ya_existia' | 'repetida' };

const oyentes = new Set<() => void>();
let enCurso: Promise<void> | null = null;
let repetir = false;

export function suscribirCambios(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function avisarCambios() {
  oyentes.forEach((o) => o());
}

const aEnvio = (m: MarcacionLocal) => ({
  id: m.id,
  clase: m.clase,
  hora_telefono: m.hora_telefono,
  sin_conexion: m.sin_conexion,
  latitud: m.latitud,
  longitud: m.longitud,
  precision_m: m.precision_m,
  motivo_sin_ubicacion: m.motivo_sin_ubicacion,
});

/** Envía solo las marcaciones de la cuenta con sesión activa. */
async function sincronizarCuenta() {
  const sesion = await leerSesionGuardada();
  if (!sesion || sesion.cuenta.rol === 'admin') return;

  await enviarPendientes(tienda, sesion.cuenta.id, async (lote) => {
    if ((await leerSesionGuardada())?.token !== sesion.token) {
      return { fallo: 'temporal', mensaje: null };
    }
    try {
      const { resultados } = await pedir<{ resultados: Resultado[] }>('/marcaciones/sincronizar', {
        metodo: 'POST',
        sesion,
        cuerpo: {
          hora_envio_telefono: new Date().toISOString(),
          marcaciones: lote.map(aEnvio),
        },
      });
      return { confirmadas: resultados.map((r) => r.id) };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : null;
      if (error instanceof ErrorApi && error.estado === 400) return { fallo: 'invalida', mensaje };
      if (error instanceof ErrorApi && error.codigo === 'cuenta_no_activa') {
        return { fallo: 'cuenta_no_activa', mensaje };
      }
      return { fallo: 'temporal', mensaje };
    }
  });

  const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  await tienda.limpiarEnviadas(hace3Dias);
}

export function sincronizar(): Promise<void> {
  repetir = true;
  enCurso ??= (async () => {
    do {
      repetir = false;
      await sincronizarCuenta();
    } while (repetir);
  })().finally(() => {
    enCurso = null;
    avisarCambios();
  });
  return enCurso;
}

/** Reintenta cada vez que vuelve la conexión. */
export function iniciarEscuchaDeRed() {
  return NetInfo.addEventListener((estado) => {
    if (estado.isConnected) void sincronizar();
  });
}
