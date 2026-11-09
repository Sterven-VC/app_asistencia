import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { mensajeDeError } from '@/services/api';

/** Carga datos al entrar a la pantalla y permite recargarlos. */
export function usarCarga<T>(cargar: () => Promise<T>, inicial: T) {
  const [datos, setDatos] = useState<T>(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const solicitud = useRef(0);

  const recargar = useCallback(async () => {
    const id = ++solicitud.current;
    setCargando(true);
    try {
      const respuesta = await cargar();
      if (solicitud.current === id) {
        setDatos(respuesta);
        setError(null);
      }
    } catch (e) {
      if (solicitud.current === id) setError(mensajeDeError(e));
    } finally {
      if (solicitud.current === id) setCargando(false);
    }
  }, [cargar]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
      return () => { solicitud.current++; };
    }, [recargar]),
  );

  return { datos, setDatos, cargando, error, setError, recargar };
}

/** Ejecuta una acción mostrando su progreso y su error. */
export function usarAccion() {
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const ocupada = useRef(false);

  const ejecutar = useCallback(async (accion: () => Promise<void>) => {
    if (ocupada.current) return;
    ocupada.current = true;
    setProcesando(true);
    setErrorAccion(null);
    try {
      await accion();
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    } finally {
      ocupada.current = false;
      setProcesando(false);
    }
  }, []);

  return { procesando, errorAccion, ejecutar };
}
