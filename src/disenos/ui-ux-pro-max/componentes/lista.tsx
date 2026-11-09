import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alto, borde, color, esp, icono, margen, tipo } from '../tema';
import { Aviso, ErrorCarga, Esqueleto, Vacio } from './estados';

/** Resuelve cargando, error y vacío igual en todas las listas. */
export function EstadoLista({
  cargando,
  error,
  vacia,
  recargar,
  textoVacio,
  accionVacio,
  children,
}: {
  cargando: boolean;
  error: string | null;
  vacia: boolean;
  recargar(): void;
  textoVacio: string;
  accionVacio?: ReactNode;
  children: ReactNode;
}) {
  if (vacia && cargando) return <Esqueleto />;
  if (vacia && error) return <ErrorCarga reintentar={recargar} texto={error} />;
  if (vacia) return <Vacio texto={textoVacio}>{accionVacio}</Vacio>;
  return (
    <>
      {error ? <Aviso texto={error} /> : null}
      {children}
    </>
  );
}

/** Fila de lista. `espera` la marca con la barra de acento: pide una acción. */
export function Fila({
  children,
  alPulsar,
  etiqueta,
  espera = false,
}: {
  children: ReactNode;
  alPulsar?: () => void;
  etiqueta: string;
  espera?: boolean;
}) {
  const interior = (
    <>
      {espera ? <View style={estilos.acento} /> : null}
      <View style={estilos.contenido}>{children}</View>
      {alPulsar ? (
        <ChevronRight color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
      ) : null}
    </>
  );

  if (!alPulsar) {
    return (
      <View accessibilityLabel={etiqueta} accessible style={estilos.fila}>
        {interior}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={alPulsar}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}>
      {interior}
    </Pressable>
  );
}

export function Separador() {
  return <View style={estilos.separador} />;
}

/** Etiqueta arriba, valor debajo. El valor manda. */
export function Dato({
  etiqueta,
  valor,
  grande = false,
}: {
  etiqueta: string;
  valor: string;
  grande?: boolean;
}) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.datoEtiqueta}>{etiqueta}</Text>
      <Text selectable style={grande ? estilos.datoGrande : estilos.datoValor}>
        {valor}
      </Text>
    </View>
  );
}

/** Dos datos que se comparan, separados por una regla vertical. */
export function ParDatos({ children }: { children: [ReactNode, ReactNode] }) {
  return (
    <View style={estilos.par}>
      <View style={estilos.parCelda}>{children[0]}</View>
      <View style={estilos.parRegla} />
      <View style={estilos.parCelda}>{children[1]}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    minHeight: alto.celdaAncha,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[2],
    paddingVertical: esp[3],
    paddingLeft: margen,
    paddingRight: esp[2],
    backgroundColor: color.fondo,
  },
  presionada: { backgroundColor: color.fondoAlt },
  acento: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: borde.barra,
    backgroundColor: color.marca,
  },
  contenido: { flex: 1, minWidth: 0, gap: esp[1] },
  separador: { height: borde.fino, backgroundColor: color.linea },
  dato: { gap: esp[1] },
  datoEtiqueta: { ...tipo.meta, color: color.tintaSuave },
  datoValor: { ...tipo.datoFuerte, color: color.tinta },
  datoGrande: { ...tipo.hora, color: color.tinta },
  par: { flexDirection: 'row', alignItems: 'stretch', gap: esp[3] },
  parCelda: { flex: 1, minWidth: 0 },
  parRegla: { width: borde.fino, backgroundColor: color.tinta },
});
