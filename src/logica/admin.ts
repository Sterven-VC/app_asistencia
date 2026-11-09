import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

import type {
  FiltrosMarcaciones,
  VistaAdminCuentas,
  VistaAdminDetalleCuenta,
  VistaAdminDetalleMarcacion,
  VistaAdminFaltas,
  VistaAdminMarcaciones,
  VistaAdminProyectos,
} from '@/disenos/contrato';
import { pedir } from '@/services/api';
import { useSesion } from '@/services/sesion';
import type { Cuenta, EstadoCuenta, Falta, Marcacion, Proyecto, Rol, TipoAsistencia } from '@/tipos';
import { fechaLima } from '@/utils/fechas';
import { usarAccion, usarCarga } from './comun';

const filtrosIniciales: FiltrosMarcaciones = {
  estado: 'pendiente',
  fecha: null,
  cuenta_id: null,
  observada: false,
  sin_tipo: false,
};

function consulta(f: FiltrosMarcaciones) {
  const p = new URLSearchParams();
  if (f.estado !== 'todas') p.set('estado', f.estado);
  if (f.fecha) p.set('fecha', f.fecha);
  if (f.cuenta_id) p.set('cuenta_id', f.cuenta_id);
  if (f.observada) p.set('observada', 'true');
  if (f.sin_tipo) p.set('sin_tipo', 'true');
  return p.toString();
}

const nombreCompleto = (c: Cuenta) => `${c.nombre_1} ${c.apellido_paterno} ${c.apellido_materno}`;

export function usarAdminMarcaciones(): VistaAdminMarcaciones {
  const router = useRouter();
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const cargar = useCallback(async () => {
    const [marcaciones, cuentas] = await Promise.all([
      pedir<{ items: Marcacion[] }>(`/admin/marcaciones?${consulta(filtros)}`),
      pedir<{ items: Cuenta[] }>('/admin/cuentas'),
    ]);
    return {
      items: marcaciones.items,
      personas: cuentas.items.map((c) => ({ id: c.id, nombre: nombreCompleto(c) })),
    };
  }, [filtros]);
  const { datos, cargando, error, recargar } = usarCarga(cargar, {
    items: [] as Marcacion[],
    personas: [] as { id: string; nombre: string }[],
  });

  return {
    filtros,
    // "Sin tipo" solo existe en marcaciones ya aprobadas.
    cambiarFiltros: (c) =>
      setFiltros((f) => ({ ...f, ...c, ...(c.sin_tipo ? { estado: 'todas' as const } : {}) })),
    limpiarFiltros: () => setFiltros({ ...filtrosIniciales, estado: 'todas' }),
    personas: datos.personas,
    items: datos.items,
    cargando,
    error,
    recargar: () => void recargar(),
    abrir: (id) => router.push({ pathname: '/marcacion/[id]', params: { id } }),
  };
}

export function usarAdminDetalleMarcacion(): VistaAdminDetalleMarcacion {
  const router = useRouter();
  const { cuenta } = useSesion();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cargar = useCallback(async () => {
    const [marcacion, proyectos] = await Promise.all([
      pedir<Marcacion>(`/admin/marcaciones/${id}`),
      pedir<{ items: Proyecto[] }>('/admin/proyectos'),
    ]);
    return { marcacion, proyectos: proyectos.items.filter((p) => p.activo) };
  }, [id]);
  const { datos, cargando, error } = usarCarga(cargar, {
    marcacion: null as Marcacion | null,
    proyectos: [] as Proyecto[],
  });
  const { procesando, errorAccion, ejecutar } = usarAccion();

  const [tipo, setTipo] = useState<TipoAsistencia | null>(null);
  const [proyectoId, setProyectoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  const m = datos.marcacion;
  const tipoElegido = tipo ?? m?.tipo ?? null;
  const proyectoElegido = proyectoId ?? m?.proyecto_id ?? null;
  const soloAsignarTipo = Boolean(
    m?.automatica && m.tipo === null && m.clase === 'entrada' && cuenta?.rol === 'admin' && m.dni === cuenta.dni,
  );

  return {
    marcacion: m,
    cargando,
    error: error ?? errorAccion,
    proyectos: datos.proyectos,
    tipo: tipoElegido,
    cambiarTipo: setTipo,
    proyectoId: proyectoElegido,
    cambiarProyecto: setProyectoId,
    motivo,
    cambiarMotivo: setMotivo,
    pideTipo: m?.clase === 'entrada',
    puedeValidar: m?.estado === 'pendiente' || soloAsignarTipo,
    soloAsignarTipo,
    aprobar: () =>
      void ejecutar(async () => {
        await pedir(`/admin/marcaciones/${id}/aprobar`, {
          metodo: 'POST',
          cuerpo: { tipo: tipoElegido, proyecto_id: tipoElegido === 'proyecto' ? proyectoElegido : null },
        });
        router.back();
      }),
    rechazar: () =>
      void ejecutar(async () => {
        await pedir(`/admin/marcaciones/${id}/rechazar`, { metodo: 'POST', cuerpo: { motivo } });
        router.back();
      }),
    procesando,
    abrirMapa: () => {
      if (m?.latitud != null) {
        void Linking.openURL(`https://www.google.com/maps?q=${m.latitud},${m.longitud}`);
      }
    },
    volver: () => router.back(),
  };
}

export function usarAdminCuentas(): VistaAdminCuentas {
  const router = useRouter();
  const [filtro, setFiltro] = useState<EstadoCuenta | 'todas'>('todas');
  const cargar = useCallback(async () => {
    const q = filtro === 'todas' ? '' : `?estado=${filtro}`;
    return (await pedir<{ items: Cuenta[] }>(`/admin/cuentas${q}`)).items;
  }, [filtro]);
  const { datos, cargando, error, recargar } = usarCarga(cargar, [] as Cuenta[]);

  return {
    filtro,
    cambiarFiltro: setFiltro,
    items: datos,
    cargando,
    error,
    recargar: () => void recargar(),
    abrir: (id) => router.push({ pathname: '/cuenta/[id]', params: { id } }),
  };
}

export function usarAdminDetalleCuenta(): VistaAdminDetalleCuenta {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cargar = useCallback(() => pedir<Cuenta>(`/admin/cuentas/${id}`), [id]);
  const { datos, setDatos, cargando, error } = usarCarga(cargar, null as Cuenta | null);
  const { procesando, errorAccion, ejecutar } = usarAccion();

  const [rol, setRol] = useState<Rol | null>(null);
  const [motivo, setMotivo] = useState('');
  const [pausaDesde, setPausaDesde] = useState('');
  const [pausaHasta, setPausaHasta] = useState('');

  useEffect(() => {
    if (datos && !rol) setRol(datos.rol);
  }, [datos, rol]);

  const accion = (ruta: string, cuerpo: object, metodo = 'POST', alCompletar?: () => void) =>
    void ejecutar(async () => {
      setDatos(await pedir<Cuenta>(ruta, { metodo, cuerpo }));
      alCompletar?.();
    });

  return {
    cuenta: datos,
    cargando,
    error: error ?? errorAccion,
    rol,
    cambiarRol: setRol,
    aprobar: () => accion(`/admin/cuentas/${id}/aprobar`, { rol }),
    motivo,
    cambiarMotivo: setMotivo,
    desactivar: () =>
      accion(`/admin/cuentas/${id}/desactivar`, { motivo }, 'POST', () => setMotivo('')),
    pausaDesde,
    cambiarPausaDesde: setPausaDesde,
    pausaHasta,
    cambiarPausaHasta: setPausaHasta,
    pausar: () =>
      accion(`/admin/cuentas/${id}/pausas`, { desde: pausaDesde, hasta: pausaHasta }, 'POST', () => {
        setPausaDesde('');
        setPausaHasta('');
      }),
    terminarPausa: (pausaId) => {
      const ayer = fechaLima(new Date(Date.now() - 24 * 60 * 60 * 1000));
      accion(`/admin/cuentas/${id}/pausas/${pausaId}`, { hasta: ayer }, 'PATCH');
    },
    procesando,
    volver: () => router.back(),
  };
}

export function usarAdminProyectos(): VistaAdminProyectos {
  const cargar = useCallback(
    async () => (await pedir<{ items: Proyecto[] }>('/admin/proyectos')).items,
    [],
  );
  const { datos, cargando, error, recargar } = usarCarga(cargar, [] as Proyecto[]);
  const { procesando, errorAccion, ejecutar } = usarAccion();
  const [nombre, setNombre] = useState('');

  return {
    items: datos,
    cargando,
    error: error ?? errorAccion,
    nombre,
    cambiarNombre: setNombre,
    crear: () =>
      void ejecutar(async () => {
        await pedir('/admin/proyectos', { metodo: 'POST', cuerpo: { nombre } });
        setNombre('');
        await recargar();
      }),
    creando: procesando,
    alternarActivo: (id) =>
      void ejecutar(async () => {
        const proyecto = datos.find((p) => p.id === id);
        await pedir(`/admin/proyectos/${id}`, { metodo: 'PATCH', cuerpo: { activo: !proyecto?.activo } });
        await recargar();
      }),
    recargar: () => void recargar(),
  };
}

export function usarAdminFaltas(): VistaAdminFaltas {
  const [fecha, setFecha] = useState<string | null>(null);
  const [cuentaId, setCuentaId] = useState<string | null>(null);
  const [fechaCorreccion, setFechaCorreccion] = useState(() => fechaLima());
  const [motivo, setMotivo] = useState('');
  const cargar = useCallback(async () => {
    const q = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
    const [faltas, cuentas] = await Promise.all([
      pedir<{ items: Falta[] }>(`/admin/faltas${q}`),
      pedir<{ items: Cuenta[] }>('/admin/cuentas'),
    ]);
    return {
      items: faltas.items,
      cuentas: cuentas.items.map((c) => ({ id: c.id, nombre: nombreCompleto(c) })),
    };
  }, [fecha]);
  const { datos, cargando, error, recargar } = usarCarga(cargar, {
    items: [],
    cuentas: [],
  });
  const { procesando, errorAccion, ejecutar } = usarAccion();

  return {
    items: datos.items,
    cargando,
    error: error ?? errorAccion,
    fecha,
    cambiarFecha: setFecha,
    cuentas: datos.cuentas,
    cuentaId,
    cambiarCuenta: setCuentaId,
    fechaCorreccion,
    cambiarFechaCorreccion: setFechaCorreccion,
    seleccionarFalta: (falta) => {
      setCuentaId(falta.cuenta_id);
      setFechaCorreccion(falta.fecha);
      setMotivo('');
    },
    motivo,
    cambiarMotivo: setMotivo,
    corregir: (esFalta) =>
      void ejecutar(async () => {
        if (!cuentaId) throw new Error('Elige a la persona.');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaCorreccion)) {
          throw new Error('Escribe la fecha en formato AAAA-MM-DD.');
        }
        if (!motivo.trim()) throw new Error('Escribe el motivo de la corrección.');
        await pedir('/admin/correcciones', {
          metodo: 'POST',
          cuerpo: { cuenta_id: cuentaId, fecha: fechaCorreccion, es_falta: esFalta, motivo: motivo.trim() },
        });
        setMotivo('');
        if (fecha && fecha !== fechaCorreccion) setFecha(fechaCorreccion);
        else await recargar();
      }),
    procesando,
    recargar: () => void recargar(),
  };
}
