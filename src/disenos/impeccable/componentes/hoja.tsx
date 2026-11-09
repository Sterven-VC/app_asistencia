import { X } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { entrada, motorNativo, salida, useSinMovimiento } from '../movimiento';
import { color, espacio, medida, tiempo } from '../tema';
import { T } from './texto';

type Props = {
  visible: boolean;
  titulo: string;
  detalle?: string;
  alCerrar(): void;
  /** Se dibuja fijo al pie de la hoja, sin margen. */
  pie?: ReactNode;
  children: ReactNode;
};

/** Hoja inferior. Reemplaza a los selects y protege las decisiones que no se deshacen. */
export function Hoja({ visible, titulo, detalle, alCerrar, pie, children }: Props) {
  const margen = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sinMovimiento = useSinMovimiento();
  const avance = useRef(new Animated.Value(0)).current;
  const [montada, setMontada] = useState(visible);

  useEffect(() => {
    if (visible) setMontada(true);
    if (sinMovimiento) {
      avance.setValue(visible ? 1 : 0);
      if (!visible) setMontada(false);
      return;
    }
    Animated.timing(avance, {
      toValue: visible ? 1 : 0,
      duration: visible ? tiempo.hoja : tiempo.corto,
      easing: visible ? entrada : salida,
      useNativeDriver: motorNativo,
    }).start(({ finished }) => {
      if (finished && !visible) setMontada(false);
    });
  }, [visible, sinMovimiento, avance]);

  const subida = avance.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <Modal
      visible={montada}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={alCerrar}>
      <KeyboardAvoidingView behavior="padding" style={estilos.capa}>
        <Animated.View style={[StyleSheet.absoluteFill, estilos.velo, { opacity: avance }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={alCerrar}
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            estilos.hoja,
            {
              maxHeight: height * medida.hojaTope,
              transform: [{ translateY: subida }],
            },
          ]}>
          <View style={estilos.cabeza}>
            <View style={estilos.flexible}>
              <T v="seccion">{titulo}</T>
              {detalle ? (
                <T v="rotulo" c={color.tintaMedia}>
                  {detalle}
                </T>
              ) : null}
            </View>
            <Pressable
              onPress={alCerrar}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              android_ripple={{ color: color.ondaOscura, borderless: true }}
              style={estilos.cerrar}>
              <X size={medida.icono} color={color.tinta} strokeWidth={medida.trazoCartel} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={estilos.cuerpo}
            contentContainerStyle={!pie ? { paddingBottom: margen.bottom } : undefined}>
            {children}
          </ScrollView>
          {pie}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  capa: { flex: 1, justifyContent: 'flex-end' },
  velo: { backgroundColor: color.velo },
  hoja: { backgroundColor: color.blanco },
  flexible: { flex: 1, minWidth: 0 },
  cabeza: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingLeft: espacio.l,
    paddingVertical: espacio.s,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  cerrar: {
    width: medida.control,
    height: medida.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: { flexGrow: 0 },
});
