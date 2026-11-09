import { Check, ChevronDown, type LucideIcon } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  useWindowDimensions,
  View,
} from 'react-native';

import { color, espacio, medida, tipo, tono } from '../tema';

type PropsCampo = TextInputProps & {
  etiqueta: string;
  error?: string;
  opcional?: boolean;
  derecha?: ReactNode;
};

/** Pozo gris con borde inferior de tinta: se reconoce como campo también al sol. */
export function Campo({ etiqueta, error, opcional = false, derecha, multiline, ...resto }: PropsCampo) {
  const [foco, setFoco] = useState(false);

  return (
    <View style={estilos.campo}>
      <View style={estilos.campoEtiqueta}>
        <Text style={[tipo.etiqueta, estilos.tinta]}>{etiqueta}</Text>
        {opcional ? <Text style={[tipo.apoyo, estilos.apagado]}>opcional</Text> : null}
      </View>
      <View
        style={[
          estilos.pozo,
          multiline && estilos.pozoAlto,
          foco && estilos.pozoFoco,
          Boolean(error) && estilos.pozoError,
        ]}>
        <TextInput
          {...resto}
          accessibilityLabel={etiqueta}
          multiline={multiline}
          onBlur={(evento) => {
            setFoco(false);
            resto.onBlur?.(evento);
          }}
          onFocus={(evento) => {
            setFoco(true);
            resto.onFocus?.(evento);
          }}
          placeholderTextColor={color.plomo}
          selectionColor={color.accion}
          style={[tipo.campo, estilos.entrada, multiline && estilos.entradaAlta]}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {derecha}
      </View>
      {error ? <Text style={[tipo.etiqueta, estilos.campoError]}>{error}</Text> : null}
    </View>
  );
}

type PropsSegmentado<T extends string> = {
  opciones: { valor: T; etiqueta: string }[];
  valor: T | null;
  cambiar(valor: T): void;
  etiqueta: string;
};

export function Segmentado<T extends string>({ opciones, valor, cambiar, etiqueta }: PropsSegmentado<T>) {
  const { width } = useWindowDimensions();
  const letra =
    opciones.length <= 3 ? tipo.rotulo : width < 360 ? estilos.letraApretada : estilos.letraMedia;

  return (
    <View accessibilityLabel={etiqueta} accessibilityRole="radiogroup" style={estilos.segmentado}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: activa }}
            key={opcion.valor}
            onPress={() => cambiar(opcion.valor)}
            style={[estilos.segmento, activa && estilos.segmentoActivo]}>
            <Text
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              style={[letra, activa ? estilos.segmentoTextoActivo : estilos.tinta]}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type PropsFiltro = {
  etiqueta: string;
  activo: boolean;
  alPresionar(): void;
  /** Abre una hoja con opciones en vez de alternar. */
  desplegable?: boolean;
};

export function Filtro({ etiqueta, activo, alPresionar, desplegable = false }: PropsFiltro) {
  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.filtro,
        activo && estilos.filtroActivo,
        pressed && estilos.filtroPresionado,
      ]}>
      {activo && !desplegable ? (
        <Check color={color.grafito} size={medida.iconoChico} strokeWidth={medida.trazoIcono} />
      ) : null}
      <Text numberOfLines={1} style={[tipo.rotulo, estilos.tinta]}>
        {etiqueta}
      </Text>
      {desplegable ? (
        <ChevronDown color={color.grafito} size={medida.iconoChico} strokeWidth={medida.trazoIcono} />
      ) : null}
    </Pressable>
  );
}

type PropsOpcion = {
  etiqueta: string;
  elegida: boolean;
  alPresionar(): void;
  icono?: LucideIcon;
};

/** Opción de una lista, también en hojas. La elegida lleva marca además de color. */
export function Opcion({ etiqueta, elegida, alPresionar, icono: Icono }: PropsOpcion) {
  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="radio"
      accessibilityState={{ selected: elegida }}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.opcion,
        elegida && estilos.opcionElegida,
        pressed && estilos.filtroPresionado,
      ]}>
      {Icono ? <Icono color={color.grafito} size={22} strokeWidth={medida.trazoIcono} /> : null}
      <Text numberOfLines={1} style={[tipo.nombre, estilos.opcionTexto]}>
        {etiqueta}
      </Text>
      {elegida ? <Check color={color.accion} size={22} strokeWidth={2.75} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  campo: { gap: espacio.s2 },
  campoEtiqueta: { flexDirection: 'row', alignItems: 'baseline', gap: espacio.s2 },
  pozo: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.hormigon,
    borderBottomColor: color.grafito,
    borderBottomWidth: medida.linea,
    borderTopLeftRadius: medida.radio,
    borderTopRightRadius: medida.radio,
  },
  pozoAlto: { minHeight: 104, alignItems: 'flex-start' },
  pozoFoco: {
    backgroundColor: color.tinte,
    borderBottomColor: color.reticula,
    borderBottomWidth: medida.tapaActiva,
    marginBottom: -medida.linea,
  },
  pozoError: { backgroundColor: tono.peligro.fondo, borderBottomColor: tono.peligro.borde },
  entrada: {
    flex: 1,
    minWidth: 0,
    minHeight: medida.control - medida.linea,
    paddingHorizontal: espacio.s3,
    color: color.grafito,
    outlineWidth: 0,
  },
  entradaAlta: { paddingVertical: espacio.s3, minHeight: 100 },
  campoError: { color: tono.peligro.texto },
  segmentado: {
    flexDirection: 'row',
    borderWidth: medida.linea,
    borderColor: color.grafito,
    borderRadius: medida.radio,
    overflow: 'hidden',
  },
  segmento: {
    flex: 1,
    minWidth: 0,
    minHeight: medida.toque,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.s1,
    backgroundColor: color.papel,
  },
  segmentoActivo: { backgroundColor: color.grafito },
  letraMedia: { ...tipo.rotulo, fontSize: 17, lineHeight: 20 },
  letraApretada: { ...tipo.rotulo, fontSize: 14, lineHeight: 17 },
  segmentoTextoActivo: { color: color.sobreAccion },
  filtro: {
    minHeight: medida.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s1,
    paddingHorizontal: espacio.s3,
    backgroundColor: color.hormigon,
    borderWidth: medida.linea,
    borderColor: color.hormigon,
    borderRadius: medida.radio,
  },
  filtroActivo: { backgroundColor: color.tinte, borderColor: color.reticula },
  filtroPresionado: { opacity: 0.75 },
  opcion: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    paddingHorizontal: espacio.s3,
    backgroundColor: color.hormigon,
    borderWidth: medida.linea,
    borderColor: color.hormigon,
    borderRadius: medida.radio,
  },
  opcionElegida: { backgroundColor: color.tinte, borderColor: color.reticula },
  opcionTexto: { flex: 1, minWidth: 0, color: color.grafito },
});
