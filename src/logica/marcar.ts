import NetInfo from '@react-native-community/netinfo';
import { randomUUID } from 'expo-crypto';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { tienda } from '@/db/local';
import type { MarcacionLocal } from '@/db/tipos';
import type { MarcaDelDia, VistaHistorial, VistaMarcar } from '@/disenos/contrato';
import { mensajeDeError, pedir } from '@/services/api';
import { useSesion } from '@/services/sesion';
import { sincronizar, suscribirCambios } from '@/services/sincronizacion';
import { capturarUbicacion } from '@/services/ubicacion';
import type { Clase, ItemHistorial } from '@/tipos';
import { fechaLarga, fechaLima, formatearHora } from '@/utils/fechas';
import { siguienteAccion } from '@/utils/siguiente-accion';

type Remota = { id: string; clase: Clase; hora: string; sinUbicacion: boolean; repetida: boolean };

async function marcacionesDelServidor(): Promise<Remota[]> {
  const ayer = fechaLima(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const { items } = await pedir<{ items: ItemHistorial[] }>(`/yo/historial?desde=${ayer}`);
  return items.flatMap((i) =>
    i.item === 'marcacion'
      ? [{
          id: i.id,
          clase: i.clase,
          hora: i.hora,
          sinUbicacion: i.observaciones.includes('sin_ubicacion'),
          repetida: i.observaciones.includes('marcacion_repetida'),
        }]
      : [],
  );
}

export function usarMarcar(): VistaMarcar {
  const router = useRouter();
  const { cuenta: sesion, cerrar } = useSesion();
  const cuenta = sesion?.rol === 'admin' ? null : sesion;
  const rol = cuenta?.rol === 'administrativo' ? 'administrativo' : 'operario';
  const cuentaId = cuenta?.id ?? '';

  const [locales, setLocales] = useState<MarcacionLocal[]>([]);
  const [remotas, setRemotas] = useState<Remota[]>([]);
  const [conectado, setConectado] = useState(true);
  const [paso, setPaso] = useState<VistaMarcar['paso']>('inactivo');
  const [error, setError] = useState<string | null>(null);
  const ocupado = useRef(false);

  const recargar = useCallback(async () => {
    if (!cuentaId) return;
    setLocales(await tienda.recientes(cuentaId));
    try {
      setRemotas(await marcacionesDelServidor());
    } catch {
      // Sin señal se sigue con lo guardado en el teléfono.
    }
  }, [cuentaId]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
      void sincronizar();
    }, [recargar]),
  );

  useEffect(() => suscribirCambios(() => void recargar()), [recargar]);
  useEffect(() => NetInfo.addEventListener((e) => setConectado(Boolean(e.isConnected))), []);

  const idsRemotos = new Set(remotas.map((r) => r.id));
  const soloLocales = locales.filter((l) => !idsRemotos.has(l.id));
  const todas = [
    ...remotas.map((r) => ({ ...r, enviada: true })),
    ...soloLocales.map((l) => ({
      id: l.id,
      clase: l.clase,
      hora: l.hora_telefono,
      sinUbicacion: l.latitud === null,
      enviada: l.estado_envio === 'enviada',
      repetida: false,
    })),
  ];

  const accion = cuenta ? siguienteAccion(rol, todas.filter((m) => !m.repetida)) : 'completo';
  const hoy = fechaLima();
  const marcasHoy: MarcaDelDia[] = todas
    .filter((m) => fechaLima(new Date(m.hora)) === hoy)
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .map((m) => ({ ...m, hora: formatearHora(m.hora) }));

  const marcar = async () => {
    if (ocupado.current || !cuenta || accion === 'completo') return;
    ocupado.current = true;
    setError(null);
    try {
      setPaso('ubicando');
      const ubicacion = await capturarUbicacion();
      setPaso('guardando');
      const red = await NetInfo.fetch();
      await tienda.guardar({
        id: randomUUID(),
        cuenta_id: cuenta.id,
        clase: accion,
        hora_telefono: new Date().toISOString(),
        sin_conexion: !red.isConnected,
        ...ubicacion,
      });
      setLocales(await tienda.recientes(cuenta.id));
      void sincronizar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      ocupado.current = false;
      setPaso('inactivo');
    }
  };

  return {
    nombre: cuenta?.nombre_1 ?? '',
    rol,
    fecha: fechaLarga(),
    accion,
    marcar: () => void marcar(),
    paso,
    marcasHoy,
    pendientesEnvio: locales.filter((l) => l.estado_envio !== 'enviada').length,
    conectado,
    error,
    cerrarSesion: () => {
      void cerrar().then(() => router.replace('/'));
    },
  };
}

export function usarHistorial(): VistaHistorial {
  const { cuenta } = useSesion();
  const cuentaId = cuenta?.rol === 'admin' ? '' : cuenta?.id ?? '';
  const [items, setItems] = useState<ItemHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!cuentaId) return;
    setCargando(true);
    const porEnviar = await tienda.porEnviar(cuentaId);
    const sinEnviar: ItemHistorial[] = porEnviar.map((m) => ({
      item: 'marcacion',
      id: m.id,
      fecha: fechaLima(new Date(m.hora_telefono)),
      clase: m.clase,
      hora: m.hora_telefono,
      estado: 'pendiente',
      envio: 'sin_enviar',
      tipo: null,
      proyecto: null,
      motivo: null,
      minutos_extra: 0,
      observaciones: m.latitud === null ? ['sin_ubicacion'] : [],
    }));
    try {
      const r = await pedir<{ items: ItemHistorial[] }>('/yo/historial');
      const remotas = new Set(r.items.map((i) => i.id));
      setItems([...sinEnviar.filter((i) => !remotas.has(i.id)), ...r.items]);
      setError(null);
    } catch (e) {
      setItems(sinEnviar);
      setError(mensajeDeError(e));
    } finally {
      setCargando(false);
    }
  }, [cuentaId]);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  useEffect(() => suscribirCambios(() => void recargar()), [recargar]);

  return { items, cargando, error, recargar: () => void recargar() };
}
