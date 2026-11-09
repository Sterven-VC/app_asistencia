import type { ComponentType } from 'react';

import type {
  Clase,
  Cuenta,
  EstadoCuenta,
  EstadoValidacion,
  Falta,
  ItemHistorial,
  Marcacion,
  Proyecto,
  Rol,
  TipoAsistencia,
} from '@/tipos';
import type { AccionMarcar } from '@/utils/siguiente-accion';

/**
 * Contrato entre la lógica y las propuestas visuales.
 * Una propuesta solo dibuja estos datos y llama estas acciones.
 * El estado de formularios y filtros vive en la lógica, así sobrevive al cambio de diseño.
 */

export type VistaIniciarSesion = {
  identificador: string;
  cambiarIdentificador(valor: string): void;
  contrasena: string;
  cambiarContrasena(valor: string): void;
  enviar(): void;
  enviando: boolean;
  error: string | null;
  irARegistro(): void;
  /** Dirección del túnel de VS Code. Solo se muestra plegada en el APK de prueba. */
  servidor: string;
  cambiarServidor(valor: string): void;
  guardarServidor(): void;
  servidorGuardado: boolean;
};

export type CamposRegistro = {
  dni: string;
  nombre_1: string;
  nombre_2: string;
  apellido_paterno: string;
  apellido_materno: string;
  numero_referencia: string;
  rol: Rol | null;
  contrasena: string;
  confirmar: string;
};

export type VistaRegistro = {
  campos: CamposRegistro;
  cambiar<K extends keyof CamposRegistro>(campo: K, valor: CamposRegistro[K]): void;
  errores: Partial<Record<keyof CamposRegistro, string>>;
  error: string | null;
  enviar(): void;
  enviando: boolean;
  registrado: boolean;
  irAInicio(): void;
};

export type VistaCuentaNoActiva = {
  motivo: 'pendiente' | 'pausada' | 'desactivada';
  nombre: string;
  /** Fecha AAAA-MM-DD en que termina la pausa. */
  hasta: string | null;
  actualizar(): void;
  actualizando: boolean;
  cerrarSesion(): void;
};

export type MarcaDelDia = {
  id: string;
  clase: Clase;
  /** Hora ya formateada, por ejemplo 08:01. */
  hora: string;
  enviada: boolean;
  sinUbicacion: boolean;
};

export type VistaMarcar = {
  nombre: string;
  rol: Rol;
  /** Por ejemplo: jueves, 6 de noviembre. */
  fecha: string;
  accion: AccionMarcar;
  marcar(): void;
  /** Paso actual al marcar. */
  paso: 'inactivo' | 'ubicando' | 'guardando';
  marcasHoy: MarcaDelDia[];
  /** Marcaciones guardadas en el teléfono aún sin llegar al servidor. */
  pendientesEnvio: number;
  conectado: boolean;
  error: string | null;
  cerrarSesion(): void;
};

export type VistaHistorial = {
  items: ItemHistorial[];
  cargando: boolean;
  error: string | null;
  recargar(): void;
};

export type FiltrosMarcaciones = {
  estado: EstadoValidacion | 'todas';
  /** AAAA-MM-DD o null para todas las fechas. */
  fecha: string | null;
  cuenta_id: string | null;
  observada: boolean;
  sin_tipo: boolean;
};

export type OpcionPersona = { id: string; nombre: string };

export type VistaAdminMarcaciones = {
  filtros: FiltrosMarcaciones;
  cambiarFiltros(cambios: Partial<FiltrosMarcaciones>): void;
  limpiarFiltros(): void;
  personas: OpcionPersona[];
  items: Marcacion[];
  cargando: boolean;
  error: string | null;
  recargar(): void;
  abrir(id: string): void;
};

export type VistaAdminDetalleMarcacion = {
  marcacion: Marcacion | null;
  cargando: boolean;
  error: string | null;
  proyectos: Proyecto[];
  tipo: TipoAsistencia | null;
  cambiarTipo(valor: TipoAsistencia): void;
  proyectoId: string | null;
  cambiarProyecto(id: string): void;
  motivo: string;
  cambiarMotivo(valor: string): void;
  /** La entrada pide tipo. La salida solo decide el tiempo extra. */
  pideTipo: boolean;
  /** Falso cuando ya fue validada. */
  puedeValidar: boolean;
  /** Es una marcación de una admin que solo necesita su tipo. */
  soloAsignarTipo: boolean;
  aprobar(): void;
  rechazar(): void;
  procesando: boolean;
  abrirMapa(): void;
  volver(): void;
};

export type VistaAdminCuentas = {
  filtro: EstadoCuenta | 'todas';
  cambiarFiltro(valor: EstadoCuenta | 'todas'): void;
  items: Cuenta[];
  cargando: boolean;
  error: string | null;
  recargar(): void;
  abrir(id: string): void;
};

export type VistaAdminDetalleCuenta = {
  cuenta: Cuenta | null;
  cargando: boolean;
  error: string | null;
  rol: Rol | null;
  cambiarRol(valor: Rol): void;
  aprobar(): void;
  motivo: string;
  cambiarMotivo(valor: string): void;
  desactivar(): void;
  /** Fechas AAAA-MM-DD. */
  pausaDesde: string;
  cambiarPausaDesde(valor: string): void;
  pausaHasta: string;
  cambiarPausaHasta(valor: string): void;
  pausar(): void;
  terminarPausa(id: string): void;
  procesando: boolean;
  volver(): void;
};

export type VistaAdminProyectos = {
  items: Proyecto[];
  cargando: boolean;
  error: string | null;
  nombre: string;
  cambiarNombre(valor: string): void;
  crear(): void;
  creando: boolean;
  alternarActivo(id: string): void;
  recargar(): void;
};

export type VistaAdminFaltas = {
  items: Falta[];
  cargando: boolean;
  error: string | null;
  /** AAAA-MM-DD o null para todas las fechas. */
  fecha: string | null;
  cambiarFecha(valor: string | null): void;
  cuentas: OpcionPersona[];
  cuentaId: string | null;
  cambiarCuenta(id: string): void;
  fechaCorreccion: string;
  cambiarFechaCorreccion(fecha: string): void;
  seleccionarFalta(falta: Falta): void;
  motivo: string;
  cambiarMotivo(valor: string): void;
  corregir(esFalta: boolean): void;
  procesando: boolean;
  recargar(): void;
};

export type IconoNavegacion =
  | 'marcar'
  | 'historial'
  | 'marcaciones'
  | 'cuentas'
  | 'proyectos'
  | 'faltas'
  | 'salir';

export type VistaNavegacion = {
  items: {
    id: string;
    etiqueta: string;
    icono: IconoNavegacion;
    activa: boolean;
    ir(): void;
  }[];
};

export type Pantallas = {
  iniciarSesion: ComponentType<VistaIniciarSesion>;
  registro: ComponentType<VistaRegistro>;
  cuentaNoActiva: ComponentType<VistaCuentaNoActiva>;
  marcar: ComponentType<VistaMarcar>;
  historial: ComponentType<VistaHistorial>;
  adminMarcaciones: ComponentType<VistaAdminMarcaciones>;
  adminDetalleMarcacion: ComponentType<VistaAdminDetalleMarcacion>;
  adminCuentas: ComponentType<VistaAdminCuentas>;
  adminDetalleCuenta: ComponentType<VistaAdminDetalleCuenta>;
  adminProyectos: ComponentType<VistaAdminProyectos>;
  adminFaltas: ComponentType<VistaAdminFaltas>;
};

export type IdDiseno = 'ui-ux-pro-max' | 'impeccable' | 'frontend-design';

export type Diseno = {
  id: IdDiseno;
  /** Nombre que muestra el botón de cambio. */
  nombre: string;
  /** Fuentes que carga la app al iniciar, en el formato de useFonts. */
  fuentes: Record<string, number>;
  pantallas: Pantallas;
  BarraNavegacion: ComponentType<VistaNavegacion>;
};
