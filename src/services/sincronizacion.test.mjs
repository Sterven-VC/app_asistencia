import assert from 'node:assert/strict';
import test from 'node:test';

import { enviarPendientes } from './cola-marcaciones.ts';

function tiendaDePrueba(marcas) {
  const filas = marcas.map(([id, cuenta_id, estado_envio = 'pendiente']) => ({ id, cuenta_id, estado_envio }));
  return {
    async porEnviar(cuentaId) {
      return filas.filter((m) => m.cuenta_id === cuentaId && m.estado_envio !== 'enviada');
    },
    async cambiarEstado(ids, estado) {
      for (const marca of filas) {
        if (ids.includes(marca.id)) marca.estado_envio = estado;
      }
    },
    estados() {
      return filas.map((m) => m.estado_envio);
    },
  };
}

const idsDe = (lote) => lote.map((m) => m.id);

test('reintenta solo los registros sin confirmar de la cuenta que marcó', async () => {
  const tienda = tiendaDePrueba([['a', 'cuenta-a'], ['b', 'cuenta-a', 'enviando'], ['c', 'cuenta-b']]);

  await enviarPendientes(tienda, 'cuenta-a', async (lote) => {
    assert.deepEqual(idsDe(lote), ['a', 'b']);
    return { fallo: 'temporal', mensaje: 'Sin conexión' };
  });
  assert.deepEqual(tienda.estados(), ['pendiente', 'pendiente', 'pendiente']);

  await enviarPendientes(tienda, 'cuenta-a', async () => ({ confirmadas: ['a', 'c'] }));
  assert.deepEqual(tienda.estados(), ['enviada', 'pendiente', 'pendiente']);

  await enviarPendientes(tienda, 'cuenta-a', async (lote) => {
    assert.deepEqual(idsDe(lote), ['b']);
    return { confirmadas: ['b'] };
  });
  assert.deepEqual(tienda.estados(), ['enviada', 'enviada', 'pendiente']);
});

test('envía una cola larga respetando el límite de 200 por lote', async () => {
  const tienda = tiendaDePrueba(Array.from({ length: 201 }, (_, i) => [`marca-${i}`, 'cuenta-a']));
  const tamanos = [];

  await enviarPendientes(tienda, 'cuenta-a', async (lote) => {
    tamanos.push(lote.length);
    return { confirmadas: idsDe(lote) };
  });

  assert.deepEqual(tamanos, [200, 1]);
  assert.ok(tienda.estados().every((estado) => estado === 'enviada'));
});

test('aísla una marcación inválida y conserva su registro local', async () => {
  const tienda = tiendaDePrueba([['a', 'cuenta-a'], ['b', 'cuenta-a'], ['c', 'cuenta-a']]);

  await enviarPendientes(tienda, 'cuenta-a', async (lote) => {
    const ids = idsDe(lote);
    return ids.includes('b')
      ? { fallo: 'invalida', mensaje: 'Marcación inválida' }
      : { confirmadas: ids };
  });

  assert.deepEqual(tienda.estados(), ['enviada', 'error', 'enviada']);
});
