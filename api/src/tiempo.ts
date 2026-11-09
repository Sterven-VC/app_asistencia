const ZONA = 'America/Lima';

/** Día calendario en Lima, como AAAA-MM-DD. */
export function fechaLima(momento: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(momento);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** 0 es domingo y 6 es sábado. */
export function diaDeSemana(fecha: string): number {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay();
}

/** Minutos después del fin de la jornada de esa fecha. Perú no cambia de hora: siempre es UTC-5. */
export function minutosExtra(fechaLaboral: string, horaOficial: Date, finDeJornada: string): number {
  const fin = new Date(`${fechaLaboral}T${finDeJornada}:00-05:00`);
  return Math.max(0, Math.floor((horaOficial.getTime() - fin.getTime()) / 60000));
}
