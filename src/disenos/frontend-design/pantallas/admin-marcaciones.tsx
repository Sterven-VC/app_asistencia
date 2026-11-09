import { ChevronRight, MapPinOff, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Marcacion } from '@/tipos';
import { formatearFecha, formatearHora } from '@/utils/fechas';
import type { FiltrosMarcaciones, VistaAdminMarcaciones } from '../../contrato';
import { Filtro, Opcion, Segmentado } from '../componentes/campos';
import { EstadoError, EstadoVacio, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Boton, Cabecera } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { agruparPorDia, GrupoDia } from '../componentes/lista-dias';
import { Sello, Sellos } from '../componentes/sello';
import { SelectorFecha } from '../componentes/selector-fecha';
import { color, espacio, medida, tipo } from '../tema';
import { conMayuscula, plural, selloValidacion, textoClase, textoObservacion } from '../textos';

const opcionesEstado: { valor: FiltrosMarcaciones['estado']; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'aprobada', etiqueta: 'Aprobadas' },
  { valor: 'rechazada', etiqueta: 'Rechazadas' },
  { valor: 'todas', etiqueta: 'Todas' },
];

function Fila({ marcacion, abrir }: { marcacion: Marcacion; abrir(id: string): void }) {
  const estado = selloValidacion[marcacion.estado];
  const hora = formatearHora(marcacion.hora_oficial);

  return (
    <Pressable
      accessibilityHint="Abre el detalle"
      accessibilityLabel={`${marcacion.persona}, ${textoClase[marcacion.clase]} a las ${hora}, ${estado.texto}`}
      accessibilityRole="button"
      onPress={() => abrir(marcacion.id)}
      style={({ pressed }) => [estilos.fila, pressed && estilos.filaPresionada]}>
      <View style={estilos.columnaHora}>
        <Text numberOfLines={1} style={[tipo.hora, estilos.tinta]}>
          {hora}
        </Text>
        <Text style={[tipo.sello, estilos.apagado]}>{textoClase[marcacion.clase]}</Text>
      </View>
      <View style={estilos.detalle}>
        <Text ellipsizeMode="tail" numberOfLines={2} style={[tipo.nombre, estilos.tinta]}>
          {marcacion.persona}
        </Text>
        <Sellos>
          <Sello icono={estado.icono} texto={estado.texto} tinta={estado.tono} />
          {marcacion.sin_conexion ? <Sello icono={WifiOff} texto="Sin señal" tinta="neutro" /> : null}
          {marcacion.observaciones.map((codigo) => (
            <Sello
              icono={codigo === 'sin_ubicacion' ? MapPinOff : undefined}
              key={codigo}
              texto={textoObservacion[codigo]}
              tinta="aviso"
            />
          ))}
        </Sellos>
      </View>
      <ChevronRight color={color.plomo} size={22} strokeWidth={medida.trazoIcono} />
    </Pressable>
  );
}

export function AdminMarcaciones(props: VistaAdminMarcaciones) {
  const { filtros, cambiarFiltros, limpiarFiltros, personas, items, cargando, error, recargar, abrir } = props;
  const [hoja, setHoja] = useState<'fecha' | 'persona' | null>(null);

  const grupos = agruparPorDia(items, (item) => item.fecha_laboral);
  const sinDatos = items.length === 0;
  const persona = personas.find((opcion) => opcion.id === filtros.cuenta_id);
  const hayFiltros = Boolean(filtros.fecha || filtros.cuenta_id || filtros.observada || filtros.sin_tipo);

  return (
    <View style={estilos.raiz}>
      <Cabecera
        detalle={
          cargando ? null : (
            <Text style={[tipo.fuerte, estilos.apagado]}>
              {plural(items.length, 'marcación', 'marcaciones')}
            </Text>
          )
        }
        titulo="Validar"
      />

      <View style={estilos.filtros}>
        <View style={estilos.estados}>
          <Segmentado
            cambiar={(estado) => cambiarFiltros({ estado })}
            etiqueta="Estado"
            opciones={opcionesEstado}
            valor={filtros.estado}
          />
        </View>
        <ScrollView
          contentContainerStyle={estilos.filtrosFila}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}>
          <Filtro
            activo={filtros.fecha !== null}
            alPresionar={() => setHoja('fecha')}
            desplegable
            etiqueta={filtros.fecha ? conMayuscula(formatearFecha(filtros.fecha)) : 'Fecha'}
          />
          <Filtro
            activo={filtros.cuenta_id !== null}
            alPresionar={() => setHoja('persona')}
            desplegable
            etiqueta={persona ? persona.nombre : 'Persona'}
          />
          <Filtro
            activo={filtros.observada}
            alPresionar={() => cambiarFiltros({ observada: !filtros.observada })}
            etiqueta="Observadas"
          />
          <Filtro
            activo={filtros.sin_tipo}
            alPresionar={() => cambiarFiltros({ sin_tipo: !filtros.sin_tipo })}
            etiqueta="Sin tipo"
          />
          {hayFiltros ? <Boton alPresionar={limpiarFiltros} chico etiqueta="Limpiar" /> : null}
        </ScrollView>
      </View>

      {sinDatos && cargando ? (
        <FilasEsqueleto />
      ) : sinDatos && error ? (
        <EstadoError mensaje={error} reintentar={recargar} />
      ) : (
        <FlatList
          ListEmptyComponent={
            <EstadoVacio
              accion={
                hayFiltros ? <Boton alPresionar={limpiarFiltros} etiqueta="Limpiar filtros" /> : undefined
              }
              titulo="No hay marcaciones"
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
                <Fila abrir={abrir} key={item.id} marcacion={item} />
              ))}
            </GrupoDia>
          )}
        />
      )}

      <SelectorFecha
        cambiar={(fecha) => cambiarFiltros({ fecha })}
        cerrar={() => setHoja(null)}
        fecha={filtros.fecha}
        visible={hoja === 'fecha'}
      />
      <Hoja cerrar={() => setHoja(null)} titulo="Persona" visible={hoja === 'persona'}>
        <Opcion
          alPresionar={() => {
            cambiarFiltros({ cuenta_id: null });
            setHoja(null);
          }}
          elegida={filtros.cuenta_id === null}
          etiqueta="Todas las personas"
        />
        {personas.map((opcion) => (
          <Opcion
            alPresionar={() => {
              cambiarFiltros({ cuenta_id: opcion.id });
              setHoja(null);
            }}
            elegida={filtros.cuenta_id === opcion.id}
            etiqueta={opcion.nombre}
            key={opcion.id}
          />
        ))}
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  filtros: { paddingTop: espacio.s3, gap: espacio.s2 },
  estados: { paddingHorizontal: medida.margen },
  filtrosFila: { paddingHorizontal: medida.margen, gap: espacio.s2, paddingBottom: espacio.s1 },
  lista: { paddingTop: espacio.s3, paddingBottom: espacio.s6 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    minHeight: 72,
    paddingVertical: espacio.s2,
  },
  filaPresionada: { backgroundColor: color.hormigon },
  columnaHora: { width: medida.columnaHora },
  detalle: { flex: 1, minWidth: 0, gap: espacio.s1 },
});
