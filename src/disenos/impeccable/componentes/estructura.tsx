import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, espacio, medida } from '../tema';
import { T } from './texto';

type PropsBanda = {
  titulo: string;
  detalle?: string;
  /** Cifra que acompaña al título, como las marcaciones de la lista. */
  cuenta?: number;
  volver?: () => void;
};

/**
 * Banda superior de cada pantalla de trabajo, como la franja de una señal.
 * Deja libre el cuadro de la esquina derecha.
 */
export function Banda({ titulo, detalle, cuenta, volver }: PropsBanda) {
  const margen = useSafeAreaInsets();
  return (
    <View style={[estilos.banda, { paddingTop: margen.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={[estilos.bandaFila, !volver && estilos.bandaSinVolver]}>
        {volver ? (
          <Pressable
            onPress={volver}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            android_ripple={{ color: color.ondaClara, borderless: true }}
            style={estilos.volver}>
            <ArrowLeft size={medida.icono} color={color.blanco} strokeWidth={medida.trazoCartel} />
          </Pressable>
        ) : null}
        <View style={estilos.flexible}>
          <View style={estilos.bandaTitulo}>
            <T v={detalle ? 'seccion' : 'titulo'} c={color.blanco} lineas={1} estilo={estilos.encoge}>
              {titulo}
            </T>
            {cuenta !== undefined ? (
              <T v="titulo" c={color.bandaTexto}>
                {cuenta}
              </T>
            ) : null}
          </View>
          {detalle ? (
            <T v="rotulo" c={color.bandaTexto} lineas={1}>
              {detalle}
            </T>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Lectura: etiqueta chica y valor grande. */
export function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <T v="rotulo" c={color.tintaMedia}>
        {etiqueta}
      </T>
      <T v="dato">{valor}</T>
    </View>
  );
}

export function Seccion({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <View style={estilos.seccion}>
      {titulo ? <T v="seccion">{titulo}</T> : null}
      {children}
    </View>
  );
}

type PropsFila = {
  alPresionar?: () => void;
  etiqueta?: string;
  deshabilitada?: boolean;
  children: ReactNode;
};

/** Fila de lista a todo el ancho, separada por filete. Sin tarjetas. */
export function Fila({ alPresionar, etiqueta, deshabilitada = false, children }: PropsFila) {
  return (
    <Pressable
      onPress={alPresionar}
      disabled={!alPresionar || deshabilitada}
      accessibilityRole={alPresionar ? 'button' : undefined}
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: deshabilitada }}
      android_ripple={alPresionar ? { color: color.ondaOscura } : undefined}
      style={({ pressed }) => [estilos.fila, pressed && estilos.filaPresionada]}>
      {children}
      {alPresionar && !deshabilitada ? (
        <ChevronRight size={medida.iconoChico} color={color.tintaMedia} strokeWidth={medida.trazoCartel} />
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  flexible: { flex: 1, minWidth: 0 },
  encoge: { flexShrink: 1 },
  banda: { backgroundColor: color.banda },
  bandaFila: {
    minHeight: medida.banda,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: medida.zonaLibre,
  },
  bandaSinVolver: { paddingLeft: espacio.l },
  bandaTitulo: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.s },
  volver: {
    width: medida.control,
    height: medida.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dato: { flexGrow: 1, flexBasis: medida.datoBase, minWidth: 0, gap: espacio.xs },
  seccion: {
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.xl,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  fila: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.m,
    backgroundColor: color.blanco,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  filaPresionada: { backgroundColor: color.placa },
});

export const base = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: color.blanco },
  flexible: { flex: 1, minWidth: 0 },
  filaDatos: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacio.l },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', columnGap: espacio.m, rowGap: espacio.xs },
  grupoTexto: { gap: espacio.xs },
  lista: { flexGrow: 1 },
});
