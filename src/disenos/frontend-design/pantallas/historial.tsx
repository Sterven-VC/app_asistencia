import { Clock3, MapPinOff, Smartphone } from 'lucide-react-native';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { ItemHistorial } from '@/tipos';
import { formatearHora, formatearMinutos } from '@/utils/fechas';
import type { VistaHistorial } from '../../contrato';
import { EstadoError, EstadoVacio, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Cabecera } from '../componentes/estructura';
import { agruparPorDia, GrupoDia } from '../componentes/lista-dias';
import { Sello, Sellos } from '../componentes/sello';
import { color, espacio, medida, tipo, tono } from '../tema';
import { selloValidacion, textoClase, textoObservacion, textoTipo } from '../textos';

function Fila({ item }: { item: ItemHistorial }) {
  if (item.item === 'falta') {
    return (
      <View style={estilos.fila}>
        <Text style={[tipo.hora, estilos.hora, item.anulada ? estilos.anulada : estilos.falta]}>Falta</Text>
        <View style={estilos.detalle}>
          <Text style={[tipo.nombre, estilos.tinta]}>{item.anulada ? 'Quitada' : 'Sin marcación'}</Text>
          {item.motivo ? <Text style={[tipo.apoyo, estilos.apagado]}>{item.motivo}</Text> : null}
        </View>
      </View>
    );
  }

  const estado = selloValidacion[item.estado];
  const lugar = item.proyecto ?? (item.tipo ? textoTipo[item.tipo] : null);

  return (
    <View style={estilos.fila}>
      <Text numberOfLines={1} style={[tipo.hora, estilos.hora, estilos.tinta]}>
        {formatearHora(item.hora)}
      </Text>
      <View style={estilos.detalle}>
        <Text numberOfLines={1} style={[tipo.nombre, estilos.tinta]}>
          {textoClase[item.clase]}
        </Text>
        {lugar ? (
          <Text numberOfLines={1} style={[tipo.apoyo, estilos.apagado]}>
            {lugar}
          </Text>
        ) : null}
        <Sellos>
          <Sello icono={estado.icono} texto={estado.texto} tinta={estado.tono} />
          {item.envio === 'sin_enviar' ? (
            <Sello icono={Smartphone} texto="Por enviar" tinta="aviso" />
          ) : null}
          {item.minutos_extra > 0 ? (
            <Sello icono={Clock3} texto={`${formatearMinutos(item.minutos_extra)} extra`} tinta="neutro" />
          ) : null}
          {item.observaciones.map((codigo) => (
            <Sello
              icono={codigo === 'sin_ubicacion' ? MapPinOff : undefined}
              key={codigo}
              texto={textoObservacion[codigo]}
              tinta="aviso"
            />
          ))}
        </Sellos>
        {item.motivo ? <Text style={[tipo.apoyo, estilos.motivo]}>{item.motivo}</Text> : null}
      </View>
    </View>
  );
}

export function Historial({ items, cargando, error, recargar }: VistaHistorial) {
  const grupos = agruparPorDia(items, (item) => item.fecha);
  const sinDatos = items.length === 0;

  return (
    <View style={estilos.raiz}>
      <Cabecera titulo="Historial" />
      {sinDatos && cargando ? (
        <FilasEsqueleto />
      ) : sinDatos && error ? (
        <EstadoError mensaje={error} reintentar={recargar} />
      ) : (
        <FlatList
          ListEmptyComponent={
            <EstadoVacio
              detalle="Aquí verás cada marcación y su estado."
              titulo="Aún no tienes marcaciones"
            />
          }
          ListHeaderComponent={error ? <Aviso banda mensaje={error} /> : undefined}
          contentContainerStyle={estilos.lista}
          data={grupos}
          keyExtractor={(grupo) => grupo.fecha}
          refreshControl={
            <RefreshControl colors={[color.accion]} onRefresh={recargar} refreshing={cargando} />
          }
          renderItem={({ item: grupo, index }) => (
            <GrupoDia fecha={grupo.fecha} indice={index}>
              {grupo.items.map((item) => (
                <Fila item={item} key={item.id} />
              ))}
            </GrupoDia>
          )}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  lista: { paddingTop: espacio.s3, paddingBottom: espacio.s6 },
  fila: { flexDirection: 'row', gap: espacio.s3, paddingVertical: espacio.s2 },
  hora: { width: medida.columnaHora },
  detalle: { flex: 1, minWidth: 0, gap: espacio.s1 },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  falta: { color: tono.peligro.texto },
  anulada: { color: color.plomo, textDecorationLine: 'line-through' },
  motivo: { color: tono.peligro.texto },
});
