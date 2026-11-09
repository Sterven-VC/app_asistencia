import type { MarcacionLocal, TiendaLocal } from '@/db/tipos';

const MAXIMO_LOTE = 200;

export type EntregaLote =
  | { confirmadas: readonly string[] }
  | { fallo: 'temporal' | 'invalida' | 'cuenta_no_activa'; mensaje: string | null };

export async function enviarPendientes(
  tienda: TiendaLocal,
  cuentaId: string,
  enviar: (lote: MarcacionLocal[]) => Promise<EntregaLote>,
) {
  const pendientes = (await tienda.porEnviar(cuentaId)).filter((m) => m.estado_envio !== 'error');

  async function enviarLote(lote: MarcacionLocal[]): Promise<boolean> {
    const ids = lote.map((m) => m.id);
    await tienda.cambiarEstado(ids, 'enviando');
    const entrega = await enviar(lote);

    if ('confirmadas' in entrega) {
      const confirmadas = new Set(entrega.confirmadas);
      const aceptadas = ids.filter((id) => confirmadas.has(id));
      const restantes = ids.filter((id) => !confirmadas.has(id));
      await tienda.cambiarEstado(aceptadas, 'enviada');
      await tienda.cambiarEstado(restantes, 'pendiente');
      return restantes.length === 0;
    }

    if (entrega.fallo !== 'temporal' && lote.length > 1) {
      // Un registro inválido no debe impedir que se envíen los demás.
      const mitad = Math.ceil(lote.length / 2);
      return (await enviarLote(lote.slice(0, mitad))) && (await enviarLote(lote.slice(mitad)));
    }

    await tienda.cambiarEstado(ids, entrega.fallo === 'invalida' ? 'error' : 'pendiente', entrega.mensaje);
    return entrega.fallo !== 'temporal';
  }

  for (let i = 0; i < pendientes.length; i += MAXIMO_LOTE) {
    if (!(await enviarLote(pendientes.slice(i, i + MAXIMO_LOTE)))) break;
  }
}
