import { ListFilter, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { Marcacion } from '@/tipos';
import { formatearFecha, formatearHora } from '@/utils/fechas';
import type { FiltrosMarcaciones, VistaAdminMarcaciones } from '../../contrato';
import { Boton, BotonDiscreto } from '../componentes/acciones';
import { Casilla, Opcion, Segmentos, SelectorDia } from '../componentes/campos';
import { Placa, Placas } from '../componentes/estados';
import { Hoja } from '../componentes/hoja';
import { EstadoLista, Fila, Separador } from '../componentes/lista';
import { Marco, Riel } from '../componentes/marco';
import { color, esp, margen, tipo } from '../tema';
import { estadoValidacion, observacion, textoClase, textoTipo } from '../textos';

const estados: { valor: FiltrosMarcaciones['estado']; texto: string }[] = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pendiente', texto: 'Pendiente' },
  { valor: 'aprobada', texto: 'Aprobada' },
  { valor: 'rechazada', texto: 'Rechazada' },
];

function FilaMarcacion({ m, abrir }: { m: Marcacion; abrir(id: string): void }) {
  const hora = formatearHora(m.hora_oficial);
  const estado = estadoValidacion[m.estado];
  return (
    <Fila
      alPulsar={() => abrir(m.id)}
      espera={m.estado === 'pendiente'}
      etiqueta={`${m.persona}, ${textoClase[m.clase]}, ${hora}, ${estado.texto}`}>
      <View style={estilos.lectura}>
        <Text style={estilos.hora}>{hora}</Text>
        <Text style={estilos.meta}>{formatearFecha(m.fecha_laboral)}</Text>
      </View>
      <Text style={estilos.nombre}>{m.persona}</Text>
      <Text style={estilos.meta}>
        {textoClase[m.clase]}{m.tipo ? ` · ${m.proyecto ?? textoTipo[m.tipo]}` : ''}
      </Text>
      <Placas>
        <Placa estado={estado} />
        {m.observaciones.map((codigo) => <Placa estado={observacion[codigo]} key={codigo} />)}
      </Placas>
    </Fila>
  );
}

export function AdminMarcaciones(p: VistaAdminMarcaciones) {
  const [verFiltros, setVerFiltros] = useState(false);
  const { filtros, cambiarFiltros } = p;
  const cantidad = Number(filtros.fecha !== null) + Number(filtros.cuenta_id !== null)
    + Number(filtros.observada) + Number(filtros.sin_tipo);

  return (
    <Marco>
      <Riel titulo="Validar" dato={p.cargando ? undefined : p.items.length} />
      <Segmentos cambiar={(estado) => cambiarFiltros({ estado })} opciones={estados} valor={filtros.estado} />
      <View style={estilos.filtros}>
        <BotonDiscreto
          alPulsar={() => setVerFiltros(true)}
          icono={ListFilter}
          texto={cantidad > 0 ? `Filtros (${cantidad})` : 'Filtros'}
        />
        {cantidad > 0 ? <BotonDiscreto alPulsar={p.limpiarFiltros} icono={X} texto="Limpiar" /> : null}
      </View>
      <Separador />
      <EstadoLista
        cargando={p.cargando}
        error={p.error}
        recargar={p.recargar}
        textoVacio="No hay marcaciones con estos filtros"
        vacia={p.items.length === 0}>
        <FlatList
          contentContainerStyle={estilos.lista}
          data={p.items}
          ItemSeparatorComponent={Separador}
          keyExtractor={(m) => m.id}
          onRefresh={p.recargar}
          refreshing={p.cargando}
          renderItem={({ item }) => <FilaMarcacion abrir={p.abrir} m={item} />}
        />
      </EstadoLista>

      <Hoja cerrar={() => setVerFiltros(false)} titulo="Filtros" visible={verFiltros}>
        <Text style={estilos.nombre}>Fecha</Text>
        <SelectorDia cambiar={(fecha) => cambiarFiltros({ fecha })} fecha={filtros.fecha} />
        <Casilla cambiar={(observada) => cambiarFiltros({ observada })} marcada={filtros.observada} texto="Observadas" />
        <Casilla cambiar={(sin_tipo) => cambiarFiltros({ sin_tipo })} marcada={filtros.sin_tipo} texto="Sin tipo" />
        <Text style={estilos.nombre}>Persona</Text>
        <Opcion alPulsar={() => cambiarFiltros({ cuenta_id: null })} elegida={filtros.cuenta_id === null} texto="Todas las personas" />
        {p.personas.map(({ id, nombre }) => (
          <Opcion alPulsar={() => cambiarFiltros({ cuenta_id: id })} elegida={filtros.cuenta_id === id} key={id} texto={nombre} />
        ))}
        <Boton alPulsar={() => setVerFiltros(false)} texto="Ver marcaciones" />
      </Hoja>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  filtros: { flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingHorizontal: margen },
  lista: { paddingBottom: esp[5] },
  lectura: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: esp[2] },
  hora: { ...tipo.horaFila, color: color.tinta },
  nombre: { ...tipo.cuerpoFuerte, color: color.tinta },
  meta: { ...tipo.meta, color: color.tintaMedia },
});
