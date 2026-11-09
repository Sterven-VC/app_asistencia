import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';

import type { VistaAdminFaltas } from '../../contrato';
import type { Falta } from '@/tipos';
import { formatearFecha, formatearHora } from '@/utils/fechas';
import { Boton, Campo, LineaEstado, Pie } from '../componentes/controles';
import { Aviso, Esqueleto, Vacio } from '../componentes/estados';
import { Banda, base, Fila, Seccion } from '../componentes/estructura';
import { SelectorFecha } from '../componentes/fecha';
import { Hoja } from '../componentes/hoja';
import { Selector } from '../componentes/selector';
import { T } from '../componentes/texto';
import { mascaraFecha, nombreOrigen } from '../formato';
import { color } from '../tema';

const estado = (esFalta: boolean) => esFalta ? 'Falta' : 'Sin falta';

export function AdminFaltas(v: VistaAdminFaltas) {
  const lista = useRef<FlatList<Falta>>(null);
  const [formularioVisible, setFormularioVisible] = useState(Boolean(v.cuentaId || v.motivo));
  const [confirmacion, setConfirmacion] = useState<boolean | null>(null);
  const listaParaCorregir = Boolean(v.cuentaId && v.fechaCorreccion.length === 10 && v.motivo.trim());
  const persona = v.cuentas.find((cuenta) => cuenta.id === v.cuentaId)?.nombre;

  return (
    <KeyboardAvoidingView behavior="padding" style={base.pantalla}>
      <Banda titulo="Faltas" cuenta={v.items.length} />
      <FlatList
        ref={lista}
        data={v.items}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        refreshing={v.cargando}
        onRefresh={v.recargar}
        contentContainerStyle={base.lista}
        ListHeaderComponent={(
          <>
            <Seccion>
              <SelectorFecha valor={v.fecha} alCambiar={v.cambiarFecha} />
              <Boton etiqueta={formularioVisible ? 'Ocultar corrección' : 'Corregir día'} variante="contorno"
                alPresionar={() => setFormularioVisible((visible) => !visible)} />
              {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
            </Seccion>
            {formularioVisible ? (
              <Seccion>
                <Selector titulo="Persona" opciones={v.cuentas} elegida={v.cuentaId} elegir={v.cambiarCuenta} ayuda="Elegir persona" />
                <Campo etiqueta="Fecha (AAAA-MM-DD)" valor={v.fechaCorreccion} teclado="number-pad"
                  alCambiar={(x) => v.cambiarFechaCorreccion(mascaraFecha(x))} />
                <Campo etiqueta="Motivo" valor={v.motivo} alCambiar={v.cambiarMotivo} multilinea />
                <Boton etiqueta="Marcar como falta" alPresionar={() => setConfirmacion(true)}
                  deshabilitado={!listaParaCorregir || v.procesando} />
                <Boton etiqueta="Marcar sin falta" alPresionar={() => setConfirmacion(false)} variante="contorno"
                  deshabilitado={!listaParaCorregir || v.procesando} />
              </Seccion>
            ) : null}
          </>
        )}
        ListEmptyComponent={v.cargando ? <Esqueleto filas={3} /> : v.error ? undefined : <Vacio titulo="Sin faltas para esta fecha" />}
        renderItem={({ item }) => {
          const esFalta = item.es_falta ?? !item.anulada;
          return (
            <View>
              <Fila
                etiqueta={`${item.persona}, ${formatearFecha(item.fecha)}, ${estado(esFalta)}. Corregir día.`}
                alPresionar={() => {
                  v.seleccionarFalta(item);
                  setFormularioVisible(true);
                  lista.current?.scrollToOffset({ offset: 0, animated: false });
                }}>
                <View style={[base.flexible, base.grupoTexto]}>
                  <T v="fuerte">{item.persona}</T>
                  <T v="rotulo" c={color.tintaMedia}>{formatearFecha(item.fecha)} · {nombreOrigen[item.origen]}</T>
                  <LineaEstado clase={esFalta ? 'rechazo' : 'ok'} texto={estado(esFalta)} />
                  {item.motivo_anulacion ? <T>{item.motivo_anulacion}</T> : null}
                </View>
              </Fila>
              {item.correcciones?.length ? (
                <Seccion titulo="Correcciones">
                  {item.correcciones.map((cambio) => (
                    <View key={cambio.id} style={base.grupoTexto}>
                      <T v="fuerte">{estado(cambio.es_falta_anterior)} a {estado(cambio.es_falta_nuevo).toLowerCase()}</T>
                      <T>{cambio.motivo}</T>
                      <T v="rotulo" c={color.tintaMedia}>{cambio.autor} · {formatearFecha(cambio.creado_en)} · {formatearHora(cambio.creado_en)}</T>
                    </View>
                  ))}
                </Seccion>
              ) : null}
            </View>
          );
        }}
      />
      <Hoja titulo={confirmacion ? 'Marcar como falta' : 'Marcar sin falta'} visible={confirmacion !== null}
        alCerrar={() => setConfirmacion(null)}
        pie={<Pie acciones={[
          { etiqueta: 'Cancelar', alPresionar: () => setConfirmacion(null), variante: 'neutro' },
          { etiqueta: 'Guardar', alPresionar: () => {
            if (confirmacion === null) return;
            v.corregir(confirmacion);
            setConfirmacion(null);
          }, deshabilitado: !listaParaCorregir, cargando: v.procesando },
        ]} />}>
        <Seccion>
          <T v="fuerte">{persona} · {v.fechaCorreccion}</T>
          <T>{v.motivo}</T>
        </Seccion>
      </Hoja>
    </KeyboardAvoidingView>
  );
}
