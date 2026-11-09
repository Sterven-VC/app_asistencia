const ZONA = 'America/Lima';

export function fechaLima(fecha: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(fecha);
  return partes;
}

export function formatearHora(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatearFecha(fecha: string): string {
  const base = fecha.length === 10 ? `${fecha}T12:00:00-05:00` : fecha;
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(base));
}

export function fechaLarga(fecha: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fecha);
}

export function formatearMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
