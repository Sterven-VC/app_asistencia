export type Rol = 'operario' | 'administrativo';
export type EstadoCuenta = 'pendiente' | 'activa' | 'desactivada';
export type Clase = 'entrada' | 'salida';
export type TipoAsistencia = 'proyecto' | 'oficina' | 'cita_medica';
export type EstadoValidacion = 'pendiente' | 'aprobada' | 'rechazada';
export type MotivoSinUbicacion = 'sin_permiso' | 'sin_gps' | 'tiempo_agotado';
export type CodigoObservacion =
  | 'sin_ubicacion'
  | 'salida_faltante'
  | 'cuenta_no_activa'
  | 'marcacion_repetida';

export type Pausa = { id: string; desde: string; hasta: string };

export type Cuenta = {
  id: string;
  dni: string;
  nombre_1: string;
  nombre_2: string | null;
  apellido_paterno: string;
  apellido_materno: string;
  numero_referencia: string;
  rol: Rol;
  estado: EstadoCuenta;
  pausas: Pausa[];
};

export type CuentaSesion = Omit<Cuenta, 'rol'> & { rol: Rol | 'admin' };

export type Proyecto = { id: string; nombre: string; activo: boolean };

export type ValidacionMarcacion = {
  id: string;
  decision: 'aprobada' | 'rechazada';
  tipo: TipoAsistencia | null;
  proyecto_id: string | null;
  motivo: string | null;
  automatica: boolean;
  autor_id: string | null;
  autor: string | null;
  creado_en: string;
};

export type Marcacion = {
  id: string;
  cuenta_id: string;
  persona: string;
  dni: string;
  rol: Rol;
  clase: Clase;
  fecha_laboral: string;
  hora_oficial: string;
  hora_telefono: string;
  hora_recepcion: string;
  desfase_segundos: number;
  sin_conexion: boolean;
  latitud: number | null;
  longitud: number | null;
  precision_m: number | null;
  motivo_sin_ubicacion: MotivoSinUbicacion | null;
  es_repetida: boolean;
  minutos_extra: number;
  estado: EstadoValidacion;
  tipo: TipoAsistencia | null;
  proyecto_id: string | null;
  proyecto: string | null;
  motivo: string | null;
  automatica: boolean;
  observaciones: CodigoObservacion[];
  validaciones?: ValidacionMarcacion[];
};

export type CorreccionFalta = {
  id: string;
  es_falta_anterior: boolean;
  es_falta_nuevo: boolean;
  motivo: string;
  autor_id: string;
  autor: string;
  creado_en: string;
};

export type Falta = {
  id: string;
  cuenta_id: string;
  persona: string;
  fecha: string;
  origen: 'sin_marcacion' | 'rechazo' | 'correccion';
  anulada: boolean;
  motivo_anulacion: string | null;
  es_falta?: boolean;
  correcciones?: CorreccionFalta[];
};

export type ItemHistorial =
  | {
      item: 'marcacion';
      id: string;
      fecha: string;
      clase: Clase;
      hora: string;
      estado: EstadoValidacion;
      envio: 'enviada' | 'sin_enviar';
      tipo: TipoAsistencia | null;
      proyecto: string | null;
      motivo: string | null;
      minutos_extra: number;
      observaciones: CodigoObservacion[];
    }
  | {
      item: 'falta';
      id: string;
      fecha: string;
      anulada: boolean;
      motivo: string | null;
    };
