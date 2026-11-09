import { Check, Clock3, type LucideIcon, X } from 'lucide-react-native';

import type {
  Clase,
  CodigoObservacion,
  EstadoCuenta,
  EstadoValidacion,
  Falta,
  MotivoSinUbicacion,
  Rol,
  TipoAsistencia,
} from '@/tipos';
import type { TonoEstado } from './tema';

export const textoClase: Record<Clase, string> = { entrada: 'Entrada', salida: 'Salida' };

export const textoTipo: Record<TipoAsistencia, string> = {
  proyecto: 'Proyecto',
  oficina: 'Oficina',
  cita_medica: 'Cita médica',
};

export const textoRol: Record<Rol, string> = {
  operario: 'Operario',
  administrativo: 'Administrativo',
};

export const textoObservacion: Record<CodigoObservacion, string> = {
  sin_ubicacion: 'Sin ubicación',
  salida_faltante: 'Sin salida',
  cuenta_no_activa: 'Cuenta no activa',
  marcacion_repetida: 'Repetida',
};

export const textoSinUbicacion: Record<MotivoSinUbicacion, string> = {
  sin_permiso: 'No dio permiso de ubicación',
  sin_gps: 'Tenía el GPS apagado',
  tiempo_agotado: 'El GPS no respondió a tiempo',
};

export const textoOrigenFalta: Record<Falta['origen'], string> = {
  sin_marcacion: 'Sin marcación',
  rechazo: 'Marcación rechazada',
  correccion: 'Corrección',
};

export const selloValidacion: Record<
  EstadoValidacion,
  { texto: string; tono: TonoEstado; icono: LucideIcon }
> = {
  pendiente: { texto: 'Pendiente', tono: 'espera', icono: Clock3 },
  aprobada: { texto: 'Aprobada', tono: 'exito', icono: Check },
  rechazada: { texto: 'Rechazada', tono: 'peligro', icono: X },
};

export const selloCuenta: Record<
  EstadoCuenta,
  { texto: string; tono: TonoEstado; icono: LucideIcon }
> = {
  pendiente: { texto: 'Pendiente', tono: 'espera', icono: Clock3 },
  activa: { texto: 'Activa', tono: 'exito', icono: Check },
  desactivada: { texto: 'Desactivada', tono: 'peligro', icono: X },
};

export function conMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function plural(cantidad: number, singular: string, varios: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}
