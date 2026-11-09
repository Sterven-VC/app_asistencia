import { RotateCw, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { type ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { alto, ancho, borde, color, esp, icono, margen, movimiento, tipo } from '../tema';
import type { Estado, Tono } from '../textos';
import { Boton } from './acciones';

const tonos: Record<Tono, { fondo: string; tinta: string; borde: string }> = {
  exito: { fondo: color.exito, tinta: color.sobreColor, borde: color.exito },
  aviso: { fondo: color.aviso, tinta: color.tinta, borde: color.aviso },
  peligro: { fondo: color.peligro, tinta: color.sobreColor, borde: color.peligro },
  espera: { fondo: color.espera, tinta: color.sobreColor, borde: color.espera },
  neutro: { fondo: color.fondo, tinta: color.tinta, borde: color.tinta },
};

/** Estado como placa sólida, con icono y texto. Nunca solo color. */
export function Placa({ estado }: { estado: Estado }) {
  const { fondo, tinta, borde: linea } = tonos[estado.tono];
  const Icono = estado.icono;
  return (
    <View style={[estilos.placa, { backgroundColor: fondo, borderColor: linea }]}>
      <Icono color={tinta} size={icono.chico} strokeWidth={icono.trazoCartel} />
      <Text numberOfLines={1} style={[tipo.placa, { color: tinta }]}>
        {estado.texto}
      </Text>
    </View>
  );
}

export function Placas({ children }: { children: ReactNode }) {
  return <View style={estilos.placas}>{children}</View>;
}

/** Franja de borde a borde para lo que pasa ahora. */
export function Aviso({
  texto,
  tono = 'peligro',
  icono: Icono = TriangleAlert,
}: {
  texto: string;
  tono?: Tono;
  icono?: LucideIcon;
}) {
  const { fondo, tinta } = tonos[tono];
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[estilos.aviso, { backgroundColor: fondo }]}>
      <Icono color={tinta} size={icono.medio} strokeWidth={icono.trazo} />
      <Text style={[tipo.etiqueta, estilos.textoAviso, { color: tinta }]}>{texto}</Text>
    </View>
  );
}

/** Vacío como dato: un cero grande dice más que una ilustración. */
export function Vacio({ texto, children }: { texto: string; children?: ReactNode }) {
  return (
    <View style={estilos.vacio}>
      <Text style={estilos.cero}>0</Text>
      <Text style={estilos.textoVacio}>{texto}</Text>
      {children ? <View style={estilos.accionVacio}>{children}</View> : null}
    </View>
  );
}

export function ErrorCarga({
  texto,
  reintentar,
  etiqueta = 'Reintentar',
}: {
  texto: string;
  reintentar(): void;
  etiqueta?: string;
}) {
  return (
    <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={estilos.errorCarga}>
      <TriangleAlert color={color.peligro} size={icono.cartel} strokeWidth={icono.trazoCartel} />
      <Text style={estilos.textoVacio}>{texto}</Text>
      <View style={estilos.accionVacio}>
        <Boton alPulsar={reintentar} icono={RotateCw} texto={etiqueta} />
      </View>
    </View>
  );
}

/** Filas con la forma de lo que va a llegar. Es la única animación continua. */
export function Esqueleto({ filas = 6 }: { filas?: number }) {
  const reducido = useReducedMotion();
  const opacidad = useSharedValue(1);

  useEffect(() => {
    if (reducido) return;
    opacidad.value = withRepeat(
      withTiming(movimiento.opacidadPulso, { duration: movimiento.pulso }),
      -1,
      true,
    );
  }, [opacidad, reducido]);

  const pulso = useAnimatedStyle(() => ({ opacity: opacidad.value }));

  return (
    <Animated.View
      accessibilityLabel="Cargando"
      accessibilityRole="progressbar"
      accessible
      style={pulso}>
      {Array.from({ length: filas }, (_, i) => (
        <View key={i} style={estilos.filaEsqueleto}>
          <View style={estilos.horaEsqueleto} />
          <View style={estilos.textoEsqueleto}>
            <View style={estilos.lineaEsqueleto} />
            <View style={[estilos.lineaEsqueleto, estilos.lineaCorta]} />
            <View style={estilos.placaEsqueleto} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  placa: {
    minHeight: alto.placa,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[1],
    paddingHorizontal: esp[2],
    borderWidth: borde.fino,
    alignSelf: 'flex-start',
  },
  placas: { flexDirection: 'row', flexWrap: 'wrap', gap: esp[1] },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[3],
    paddingHorizontal: margen,
    paddingVertical: esp[3],
  },
  textoAviso: { flex: 1 },
  vacio: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: margen,
    paddingVertical: esp[7],
  },
  cero: { ...tipo.cero, color: color.tinta },
  textoVacio: { ...tipo.cuerpo, color: color.tintaMedia, marginTop: esp[2] },
  accionVacio: { marginTop: esp[5] },
  errorCarga: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: margen,
    paddingVertical: esp[7],
  },
  filaEsqueleto: {
    flexDirection: 'row',
    gap: esp[3],
    padding: margen,
    borderBottomWidth: borde.fino,
    borderBottomColor: color.linea,
  },
  horaEsqueleto: {
    width: ancho.esqueletoHora,
    height: alto.placa,
    backgroundColor: color.linea,
  },
  textoEsqueleto: { flex: 1, gap: esp[2] },
  lineaEsqueleto: { height: alto.esqueletoLinea, backgroundColor: color.linea },
  lineaCorta: { width: '60%' },
  placaEsqueleto: {
    width: ancho.esqueletoPlaca,
    height: alto.esqueletoPlaca,
    backgroundColor: color.fondoAlt,
  },
});
