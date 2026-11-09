import type {
  Clase,
  CodigoObservacion,
  Cuenta,
  EstadoValidacion,
  Falta,
  MotivoSinUbicacion,
  Pausa,
  Rol,
  TipoAsistencia,
} from '@/tipos';
import { fechaLima } from '@/utils/fechas';

import type { ClaseSenal } from './componentes/senal';

export const nombreClase: Record<Clase, string> = { entrada: 'Entrada', salida: 'Salida' };

export const nombreTipo: Record<TipoAsistencia, string> = {
  proyecto: 'Proyecto',
  oficina: 'Oficina',
  cita_medica: 'Cita médica',
};

export const nombreRol: Record<Rol, string> = {
  operario: 'Operario',
  administrativo: 'Administrativo',
};

export const nombreObservacion: Record<CodigoObservacion, string> = {
  sin_ubicacion: 'Sin ubicación',
  salida_faltante: 'Sin salida',
  cuenta_no_activa: 'Cuenta no activa',
  marcacion_repetida: 'Repetida',
};

export const nombreSinUbicacion: Record<MotivoSinUbicacion, string> = {
  sin_permiso: 'Sin permiso de ubicación',
  sin_gps: 'GPS apagado',
  tiempo_agotado: 'Se agotó el tiempo',
};

export const nombreOrigen: Record<Falta['origen'], string> = {
  sin_marcacion: 'Sin marcación',
  rechazo: 'Marcación rechazada',
  correccion: 'Corrección',
};

/** Lo que ve quien marcó. Pendiente depende de otra persona. */
export const estadoPropio: Record<EstadoValidacion, { senal: ClaseSenal; nombre: string }> = {
  pendiente: { senal: 'espera', nombre: 'En revisión' },
  aprobada: { senal: 'ok', nombre: 'Aprobada' },
  rechazada: { senal: 'rechazo', nombre: 'Rechazada' },
};

/** Lo que ve la admin. Pendiente es trabajo suyo. */
export const estadoAdmin: Record<EstadoValidacion, { senal: ClaseSenal; nombre: string }> = {
  pendiente: { senal: 'hacer', nombre: 'Por validar' },
  aprobada: { senal: 'ok', nombre: 'Aprobada' },
  rechazada: { senal: 'rechazo', nombre: 'Rechazada' },
};

export function nombreCuenta(cuenta: Cuenta): string {
  return [cuenta.nombre_1, cuenta.nombre_2, cuenta.apellido_paterno, cuenta.apellido_materno]
    .filter(Boolean)
    .join(' ');
}

export function pausaVigente(cuenta: Cuenta): Pausa | null {
  const hoy = fechaLima();
  return cuenta.pausas.find((p) => p.desde <= hoy && hoy <= p.hasta) ?? null;
}

export function formatearDesfase(segundos: number): string {
  const total = Math.abs(segundos);
  return total < 60 ? `${total} s` : `${Math.round(total / 60)} min`;
}

export function contar(cantidad: number, uno: string, varios: string): string {
  return `${cantidad} ${cantidad === 1 ? uno : varios}`;
}

/** Deja solo cifras y arma AAAA-MM-DD mientras se escribe. */
export function mascaraFecha(valor: string): string {
  const cifras = valor.replace(/\D/g, '').slice(0, 8);
  return [cifras.slice(0, 4), cifras.slice(4, 6), cifras.slice(6, 8)].filter(Boolean).join('-');
}
