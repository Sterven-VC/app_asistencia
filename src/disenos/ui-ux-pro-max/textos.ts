import {
  Ban,
  Building2,
  Check,
  Copy,
  Hourglass,
  LogIn,
  LogOut,
  type LucideIcon,
  MapPinOff,
  Stethoscope,
  HardHat,
  X,
} from 'lucide-react-native';

import type {
  Clase,
  CodigoObservacion,
  Cuenta,
  EstadoCuenta,
  EstadoValidacion,
  Falta,
  MotivoSinUbicacion,
  Rol,
  TipoAsistencia,
} from '@/tipos';

export type Tono = 'exito' | 'aviso' | 'peligro' | 'espera' | 'neutro';

export type Estado = { texto: string; tono: Tono; icono: LucideIcon };

export const estadoValidacion: Record<EstadoValidacion, Estado> = {
  pendiente: { texto: 'Pendiente', tono: 'espera', icono: Hourglass },
  aprobada: { texto: 'Aprobada', tono: 'exito', icono: Check },
  rechazada: { texto: 'Rechazada', tono: 'peligro', icono: X },
};

export const estadoCuenta: Record<EstadoCuenta, Estado> = {
  pendiente: { texto: 'Pendiente', tono: 'espera', icono: Hourglass },
  activa: { texto: 'Activa', tono: 'exito', icono: Check },
  desactivada: { texto: 'Desactivada', tono: 'peligro', icono: Ban },
};

export const observacion: Record<CodigoObservacion, Estado> = {
  sin_ubicacion: { texto: 'Sin ubicación', tono: 'aviso', icono: MapPinOff },
  salida_faltante: { texto: 'Sin salida', tono: 'aviso', icono: LogOut },
  cuenta_no_activa: { texto: 'Cuenta no activa', tono: 'aviso', icono: Ban },
  marcacion_repetida: { texto: 'Repetida', tono: 'aviso', icono: Copy },
};

export const tipos: { valor: TipoAsistencia; texto: string; icono: LucideIcon }[] = [
  { valor: 'proyecto', texto: 'Proyecto', icono: HardHat },
  { valor: 'oficina', texto: 'Oficina', icono: Building2 },
  { valor: 'cita_medica', texto: 'Cita médica', icono: Stethoscope },
];

export const textoTipo: Record<TipoAsistencia, string> = {
  proyecto: 'Proyecto',
  oficina: 'Oficina',
  cita_medica: 'Cita médica',
};

export const textoClase: Record<Clase, string> = { entrada: 'Entrada', salida: 'Salida' };

export const iconoClase: Record<Clase, LucideIcon> = { entrada: LogIn, salida: LogOut };

export const textoRol: Record<Rol, string> = {
  operario: 'Operario',
  administrativo: 'Administrativo',
};

export const textoSinUbicacion: Record<MotivoSinUbicacion, string> = {
  sin_permiso: 'Sin permiso de ubicación',
  sin_gps: 'GPS apagado',
  tiempo_agotado: 'El GPS no respondió',
};

export const textoOrigenFalta: Record<Falta['origen'], string> = {
  sin_marcacion: 'Sin marcación',
  rechazo: 'Por rechazo',
  correccion: 'Por corrección',
};

export function nombreCompleto(cuenta: Cuenta): string {
  return [cuenta.nombre_1, cuenta.nombre_2, cuenta.apellido_paterno, cuenta.apellido_materno]
    .filter(Boolean)
    .join(' ');
}
