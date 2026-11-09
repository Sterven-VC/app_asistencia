import type { Clase, MotivoSinUbicacion } from '@/tipos';

export type EstadoEnvio = 'pendiente' | 'enviando' | 'enviada' | 'error';

export type MarcacionLocal = {
  id: string;
  cuenta_id: string;
  clase: Clase;
  hora_telefono: string;
  latitud: number | null;
  longitud: number | null;
  precision_m: number | null;
  motivo_sin_ubicacion: MotivoSinUbicacion | null;
  sin_conexion: boolean;
  estado_envio: EstadoEnvio;
  intentos: number;
  ultimo_error: string | null;
};

export type NuevaMarcacion = Omit<MarcacionLocal, 'estado_envio' | 'intentos' | 'ultimo_error'>;

export type TiendaLocal = {
  guardar(m: NuevaMarcacion): Promise<void>;
  /** Marcaciones sin confirmar de la cuenta, incluidas las que tienen error. */
  porEnviar(cuentaId: string): Promise<MarcacionLocal[]>;
  recientes(cuentaId: string): Promise<MarcacionLocal[]>;
  cambiarEstado(ids: string[], estado: EstadoEnvio, error?: string | null): Promise<void>;
  limpiarEnviadas(antesDe: string): Promise<void>;
};
