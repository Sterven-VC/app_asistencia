import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';

import type { CuentaSesion } from '@/tipos';
import { fechaLima } from '@/utils/fechas';
import { ErrorApi, obtenerServidor, pedir, validarServidor } from './api';
import { borrarSesion, guardarSesion, leerSesionGuardada, type SesionGuardada } from './sesion-almacen';
import { sincronizar } from './sincronizacion';

type ContextoSesion = {
  listo: boolean;
  cuenta: CuentaSesion | null;
  iniciar(identificador: string, contrasena: string): Promise<void>;
  cerrar(): Promise<void>;
  actualizar(): Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

export function pausaVigente(cuenta: CuentaSesion, hoy = fechaLima()) {
  return cuenta.pausas.find((p) => p.desde <= hoy && hoy <= p.hasta) ?? null;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [listo, setListo] = useState(false);
  const [sesionActiva, setSesionActiva] = useState<SesionGuardada | null>(null);

  const retirar = useCallback(async (token: string) => {
    if (await borrarSesion(token)) {
      setSesionActiva((actual) => (actual?.token === token ? null : actual));
    }
  }, []);

  const actualizar = useCallback(async () => {
    const sesion = await leerSesionGuardada();
    if (!sesion) return;
    const admin = sesion.cuenta.rol === 'admin';
    if (admin && Date.parse(sesion.expira_en) <= Date.now()) {
      await retirar(sesion.token);
      return;
    }
    try {
      const cuenta = await pedir<CuentaSesion>('/yo', { sesion });
      const nueva = { ...sesion, cuenta };
      if (await guardarSesion(nueva, sesion.token)) {
        setSesionActiva((actual) => (!actual || actual.token === sesion.token ? nueva : actual));
      }
    } catch (error) {
      if (admin || (error instanceof ErrorApi && error.codigo === 'sesion_invalida')) {
        // Las marcaciones guardadas se conservan hasta entrar otra vez.
        await retirar(sesion.token);
      }
    }
  }, [retirar]);

  useEffect(() => {
    void (async () => {
      const sesion = await leerSesionGuardada();
      if (sesion?.cuenta.rol === 'admin') {
        await actualizar();
        setListo(true);
        return;
      }
      setSesionActiva(sesion);
      setListo(true);
      if (sesion) {
        await actualizar();
        void sincronizar();
      }
    })();
  }, [actualizar]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void actualizar();
    });
    return () => suscripcion.remove();
  }, [actualizar]);

  useEffect(() => {
    if (sesionActiva?.cuenta.rol !== 'admin') return;
    const restante = Math.max(0, Date.parse(sesionActiva.expira_en) - Date.now());
    const temporizador = setTimeout(() => void retirar(sesionActiva.token), restante);
    return () => clearTimeout(temporizador);
  }, [sesionActiva, retirar]);

  const iniciar = useCallback(async (identificador: string, contrasena: string) => {
    const servidor = validarServidor(await obtenerServidor());
    const r = await pedir<Omit<SesionGuardada, 'servidor'>>('/auth/iniciar-sesion', {
      metodo: 'POST',
      cuerpo: { identificador, contrasena },
      sesion: null,
      servidor,
    });
    const nueva = { ...r, servidor };
    await guardarSesion(nueva);
    setSesionActiva(nueva);
    if (nueva.cuenta.rol !== 'admin') void sincronizar();
  }, []);

  const cerrar = useCallback(async () => {
    const sesion = await leerSesionGuardada();
    if (!sesion || !(await borrarSesion(sesion.token))) return;
    setSesionActiva((actual) => (actual?.token === sesion.token ? null : actual));
    void pedir('/auth/cerrar-sesion', { metodo: 'POST', sesion }).catch(() => {
      // El cierre local también funciona sin señal.
    });
  }, []);

  const cuenta = sesionActiva?.cuenta ?? null;
  const valor = useMemo(
    () => ({ listo, cuenta, iniciar, cerrar, actualizar }),
    [listo, cuenta, iniciar, cerrar, actualizar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('Falta ProveedorSesion');
  return valor;
}
