import { Check, Smartphone, X } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { ItemHistorial } from '@/tipos';
import { formatearFecha, formatearHora, formatearMinutos } from '@/utils/fechas';
import type { VistaHistorial } from '../../contrato';
import { Placa, Placas } from '../componentes/estados';
import { EstadoLista } from '../componentes/lista';
import { Marco, Riel } from '../componentes/marco';
import { borde, color, esp, margen, tipo } from '../tema';
import { estadoValidacion, observacion, textoClase, textoTipo } from '../textos';

type Renglon = { clave: string; fecha: string } | { clave: string; item: ItemHistorial };

function agrupar(items: ItemHistorial[]): Renglon[] {
  const renglones: Renglon[] = [];
  let actual: string | null = null;
  for (const item of items) {
    if (item.fecha !== actual) {
      actual = item.fecha;
      renglones.push({ clave: `dia-${item.fecha}`, fecha: item.fecha });
    }
    renglones.push({ clave: item.id, item });
  }
  return renglones;
}

const FilaHistorial = memo(function FilaHistorial({ item }: { item: ItemHistorial }) {
  if (item.item === 'falta') {
    return (
      <View style={estilos.fila}>
        <Text style={estilos.hora}>--:--</Text>
        <View style={estilos.detalle}>
          <Text style={estilos.titulo}>{item.anulada ? 'Falta quitada' : 'Falta'}</Text>
          <Placas>
            {item.anulada ? (
              <Placa estado={{ texto: 'Quitada', tono: 'neutro', icono: Check }} />
            ) : (
              <Placa estado={{ texto: 'Injustificada', tono: 'peligro', icono: X }} />
            )}
          </Placas>
          {item.motivo ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}
        </View>
      </View>
    );
  }

  const tipoTexto = item.tipo
    ? item.proyecto
      ? `${textoTipo[item.tipo]} · ${item.proyecto}`
      : textoTipo[item.tipo]
    : null;

  return (
    <View style={estilos.fila}>
      <Text style={estilos.hora}>{formatearHora(item.hora)}</Text>
      <View style={estilos.detalle}>
        <Text style={estilos.titulo}>{textoClase[item.clase]}</Text>
        {tipoTexto ? <Text style={estilos.meta}>{tipoTexto}</Text> : null}
        {item.minutos_extra > 0 ? (
          <Text style={estilos.extra}>+{formatearMinutos(item.minutos_extra)} extra</Text>
        ) : null}
        <Placas>
          <Placa estado={estadoValidacion[item.estado]} />
          {item.envio === 'sin_enviar' ? (
            <Placa estado={{ texto: 'En el teléfono', tono: 'aviso', icono: Smartphone }} />
          ) : null}
          {item.observaciones.map((codigo) => (
            <Placa estado={observacion[codigo]} key={codigo} />
          ))}
        </Placas>
        {item.motivo ? <Text style={estilos.motivo}>{item.motivo}</Text> : null}
      </View>
    </View>
  );
});

export function Historial(p: VistaHistorial) {
  const renglones = useMemo(() => agrupar(p.items), [p.items]);

  return (
    <Marco>
      <Riel titulo="Historial" />
      <EstadoLista
        cargando={p.cargando}
        error={p.error}
        recargar={p.recargar}
        textoVacio="Aún no tienes marcaciones"
        vacia={p.items.length === 0}>
        <FlatList
          contentContainerStyle={estilos.lista}
          data={renglones}
          keyExtractor={(r) => r.clave}
          onRefresh={p.recargar}
          refreshing={p.cargando}
          renderItem={({ item: r }) =>
            'fecha' in r ? (
              <Text accessibilityRole="header" style={estilos.dia}>
                {formatearFecha(r.fecha)}
              </Text>
            ) : (
              <FilaHistorial item={r.item} />
            )
          }
        />
      </EstadoLista>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  lista: { paddingBottom: esp[5] },
  dia: {
    ...tipo.datoFuerte,
    color: color.tinta,
    paddingHorizontal: margen,
    paddingTop: esp[4],
    paddingBottom: esp[2],
    borderBottomWidth: borde.regla,
    borderBottomColor: color.tinta,
  },
  fila: {
    flexDirection: 'row',
    gap: esp[3],
    paddingHorizontal: margen,
    paddingVertical: esp[3],
    borderBottomWidth: borde.fino,
    borderBottomColor: color.linea,
  },
  hora: { ...tipo.horaFila, color: color.tinta },
  detalle: { flex: 1, minWidth: 0, gap: esp[1] },
  titulo: { ...tipo.cuerpoFuerte, color: color.tinta },
  meta: { ...tipo.meta, color: color.tintaMedia },
  extra: { ...tipo.dato, color: color.tinta },
  motivo: { ...tipo.meta, color: color.tinta },
});
