import type { Clase, Rol } from '@/tipos';
import { fechaLima } from './fechas';

export type MarcaReciente = { clase: Clase; hora: string };
export type AccionMarcar = Clase | 'completo';

const VENTANA_SALIDA_MS = 16 * 60 * 60 * 1000;

/** Decide qué toca marcar, también sin señal. */
export function siguienteAccion(
  rol: Rol,
  marcas: MarcaReciente[],
  ahora: Date = new Date(),
): AccionMarcar {
  const ordenadas = [...marcas].sort((a, b) => a.hora.localeCompare(b.hora));
  const hoy = fechaLima(ahora);
  const deHoy = ordenadas.filter((m) => fechaLima(new Date(m.hora)) === hoy);

  if (rol === 'operario') {
    return deHoy.some((m) => m.clase === 'entrada') ? 'completo' : 'entrada';
  }

  const ultima = ordenadas[ordenadas.length - 1];
  if (ultima?.clase === 'entrada') {
    const transcurrido = ahora.getTime() - new Date(ultima.hora).getTime();
    if (transcurrido >= 0 && transcurrido <= VENTANA_SALIDA_MS) return 'salida';
  }

  return deHoy.some((m) => m.clase === 'entrada') ? 'completo' : 'entrada';
}
