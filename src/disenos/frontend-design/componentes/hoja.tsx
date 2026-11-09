import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, espacio, medida, movimiento, tipo } from '../tema';
import { motorNativo, useMovimientoReducido } from './movimiento';

type Props = {
  visible: boolean;
  cerrar(): void;
  titulo: string;
  children: ReactNode;
  /** Botones fijos al pie de la hoja. */
  pie?: ReactNode;
};

const DISTANCIA_CIERRE = 80;

/** Hoja inferior: sube frenando, sale más rápido y cierra al arrastrar el asa 80 px. */
export function Hoja({ visible, cerrar, titulo, children, pie }: Props) {
  const margen = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reducido = useMovimientoReducido();
  const [montada, setMontada] = useState(visible);
  const avance = useRef(new Animated.Value(0)).current;
  const arrastre = useRef(new Animated.Value(0)).current;
  const cerrarActual = useRef(cerrar);
  cerrarActual.current = cerrar;

  useEffect(() => {
    if (visible) {
      setMontada(true);
      arrastre.setValue(0);
      Animated.timing(avance, {
        toValue: 1,
        duration: reducido ? 0 : movimiento.hoja,
        easing: movimiento.entrada,
        useNativeDriver: motorNativo,
      }).start();
      return;
    }
    Animated.timing(avance, {
      toValue: 0,
      duration: reducido ? 0 : movimiento.corta,
      easing: movimiento.salida,
      useNativeDriver: motorNativo,
    }).start(({ finished }) => {
      if (finished) setMontada(false);
    });
  }, [arrastre, avance, reducido, visible]);

  const gesto = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_evento, estado) => arrastre.setValue(Math.max(0, estado.dy)),
        onPanResponderRelease: (_evento, estado) => {
          if (estado.dy > DISTANCIA_CIERRE) {
            cerrarActual.current();
            return;
          }
          Animated.timing(arrastre, {
            toValue: 0,
            duration: movimiento.corta,
            easing: movimiento.entrada,
            useNativeDriver: motorNativo,
          }).start();
        },
      }),
    [arrastre],
  );

  const subida = avance.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <Modal
      animationType="none"
      navigationBarTranslucent
      onRequestClose={cerrar}
      statusBarTranslucent
      transparent
      visible={montada}>
      <KeyboardAvoidingView behavior="padding" style={estilos.raiz}>
        <Animated.View style={[estilos.velo, { opacity: avance }]}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            onPress={cerrar}
            style={estilos.veloToque}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            estilos.panel,
            {
              maxHeight: height * 0.86,
              paddingBottom: margen.bottom + espacio.s4,
              transform: [{ translateY: Animated.add(subida, arrastre) }],
            },
          ]}>
          <View {...gesto.panHandlers} style={estilos.asaZona}>
            <View style={estilos.asa} />
          </View>
          <Text accessibilityRole="header" style={[tipo.titulo, estilos.titulo]}>
            {titulo}
          </Text>
          <ScrollView
            contentContainerStyle={estilos.contenido}
            keyboardShouldPersistTaps="handled"
            style={estilos.lista}>
            {children}
          </ScrollView>
          {pie ? <View style={estilos.pie}>{pie}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, justifyContent: 'flex-end' },
  velo: { ...StyleSheet.absoluteFill, backgroundColor: color.velo },
  veloToque: { flex: 1 },
  panel: {
    backgroundColor: color.papel,
    borderTopColor: color.grafito,
    borderTopWidth: medida.tapaActiva,
  },
  asaZona: { height: 28, alignItems: 'center', justifyContent: 'center' },
  asa: {
    width: 44,
    height: 5,
    borderRadius: medida.radio,
    backgroundColor: color.hormigonFuerte,
  },
  titulo: { color: color.grafito, paddingHorizontal: medida.margen, paddingBottom: espacio.s3 },
  lista: { flexShrink: 1 },
  contenido: { paddingHorizontal: medida.margen, paddingBottom: espacio.s2, gap: espacio.s2 },
  pie: { paddingHorizontal: medida.margen, paddingTop: espacio.s3, gap: espacio.s2 },
});
