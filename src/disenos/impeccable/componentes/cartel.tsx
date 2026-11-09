import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { entrada, motorNativo, useSinMovimiento } from '../movimiento';
import { color, espacio, medida, radio, texto, tiempo, tono as tonos, type Tono } from '../tema';

type Props = {
  tono: Tono;
  /** Cuando cambia, el letrero nuevo sube y tapa al anterior. */
  clave: string;
  alPresionar?: () => void;
  etiqueta?: string;
  estilo?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Letrero: campo plano a sangre con su filete interior. Es la pieza que lleva
 * el estado de la pantalla y, cuando hay algo que hacer, es el botón completo.
 */
export function Cartel({ tono, clave, alPresionar, etiqueta, estilo, children }: Props) {
  const sinMovimiento = useSinMovimiento();
  const avance = useRef(new Animated.Value(1)).current;
  const [alto, setAlto] = useState(0);
  const [tonoPrevio, setTonoPrevio] = useState(tono);
  const claveVista = useRef(clave);

  useEffect(() => {
    if (claveVista.current === clave) return;
    claveVista.current = clave;
    if (sinMovimiento) {
      setTonoPrevio(tono);
      return;
    }
    avance.setValue(0);
    Animated.timing(avance, {
      toValue: 1,
      duration: tiempo.medio,
      easing: entrada,
      useNativeDriver: motorNativo,
    }).start(() => setTonoPrevio(tono));
  }, [clave, tono, sinMovimiento, avance]);

  const colores = tonos[tono];
  const subida = avance.interpolate({ inputRange: [0, 1], outputRange: [alto, 0] });

  return (
    <Pressable
      disabled={!alPresionar}
      onPress={alPresionar}
      accessibilityRole={alPresionar ? 'button' : undefined}
      accessibilityLabel={etiqueta}
      android_ripple={alPresionar ? { color: color.ondaClara } : undefined}
      onLayout={(evento) => setAlto(evento.nativeEvent.layout.height)}
      style={[estilos.cartel, { backgroundColor: tonos[tonoPrevio].fondo }, estilo]}>
      {({ pressed }) => (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colores.fondo, transform: [{ translateY: subida }] },
            ]}
          />
          <View
            pointerEvents="none"
            style={[estilos.filo, { borderColor: colores.texto }]}
          />
          <Animated.View style={[estilos.contenido, { opacity: avance }]}>{children}</Animated.View>
          {pressed ? <View pointerEvents="none" style={estilos.presion} /> : null}
        </>
      )}
    </Pressable>
  );
}

/** Palabras del letrero. Cada línea se ajusta al ancho para no partirse nunca. */
export function PalabrasCartel({ lineas, tono }: { lineas: string[]; tono: Tono }) {
  const { width } = useWindowDimensions();
  const util = width - medida.cartelRelleno * 2;
  const larga = Math.max(...lineas.map((l) => l.length));
  const cuerpo = Math.min(
    medida.cartelTopeLetra,
    Math.floor(util / (larga * medida.cartelAnchoLetra)),
  );
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lineas.map((linea) => (
        <Text
          key={linea}
          numberOfLines={1}
          maxFontSizeMultiplier={1}
          style={[
            texto.portada,
            {
              color: tonos[tono].texto,
              fontSize: cuerpo,
              lineHeight: Math.round(cuerpo * medida.cartelInterlinea),
            },
          ]}>
          {linea}
        </Text>
      ))}
    </View>
  );
}

/** Dos tramos: ubicar y guardar. El que corre late. */
export function Pasos({ actual }: { actual: 1 | 2 }) {
  const sinMovimiento = useSinMovimiento();
  const latido = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sinMovimiento) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.timing(latido, {
          toValue: 0.4,
          duration: tiempo.pulso,
          useNativeDriver: motorNativo,
        }),
        Animated.timing(latido, { toValue: 1, duration: tiempo.pulso, useNativeDriver: motorNativo }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [latido, sinMovimiento]);

  return (
    <View style={estilos.pasos}>
      {[1, 2].map((paso) => (
        <View key={paso} style={estilos.pasoRiel}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              estilos.pasoRelleno,
              paso > actual && estilos.pasoOculto,
              paso === actual && { opacity: latido },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

/** Cinta de seguridad. Solo aparece cuando falta señal. */
export function Cinta() {
  const { width } = useWindowDimensions();
  const paso = medida.cintaPaso;
  const alto = medida.cintaAlto;
  const franjas = Math.ceil(width / paso) + 1;
  const trazo = Array.from({ length: franjas }, (_, i) => {
    const x = i * paso;
    return `M${x} ${alto}L${x + alto} 0H${x + alto + paso / 2}L${x + paso / 2} ${alto}Z`;
  }).join('');

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={estilos.cinta}>
      <Svg width={width} height={alto}>
        <Path d={trazo} fill={color.tinta} />
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartel: { overflow: 'hidden' },
  filo: {
    position: 'absolute',
    top: medida.filoMargen,
    right: medida.filoMargen,
    bottom: medida.filoMargen,
    left: medida.filoMargen,
    borderWidth: medida.filoGrosor,
    borderRadius: radio.filo,
  },
  contenido: {
    flex: 1,
    padding: medida.cartelRelleno,
    gap: espacio.l,
  },
  presion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
  pasos: { flexDirection: 'row', gap: espacio.s },
  pasoRiel: {
    flex: 1,
    height: medida.pasoAlto,
    borderRadius: radio.total,
    overflow: 'hidden',
    backgroundColor: color.pasoApagado,
  },
  pasoRelleno: { backgroundColor: color.blanco },
  pasoOculto: { opacity: 0 },
  cinta: { backgroundColor: color.aviso },
});
