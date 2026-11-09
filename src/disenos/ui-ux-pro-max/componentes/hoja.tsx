import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alto, ancho, borde, color, esp, hoja, icono, margen, movimiento, tipo } from '../tema';

const frenado = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Hoja que sube desde el pie. El pie de la hoja repite la firma: bloque de borde a borde. */
export function Hoja({
  visible,
  cerrar,
  titulo,
  children,
  pie,
}: {
  visible: boolean;
  cerrar(): void;
  titulo: string;
  children: ReactNode;
  pie?: ReactNode;
}) {
  const seguro = useSafeAreaInsets();

  return (
    <Modal
      animationType="none"
      onRequestClose={cerrar}
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView behavior="padding" style={estilos.capa}>
        <Animated.View
          entering={FadeIn.duration(movimiento.corta)}
          style={[StyleSheet.absoluteFill, estilos.velo]}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            onPress={cerrar}
            style={estilos.relleno}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          entering={SlideInDown.duration(movimiento.hoja).easing(frenado)}
          style={estilos.hoja}>
          <View style={estilos.cabecera}>
            <Text accessibilityRole="header" numberOfLines={2} style={estilos.titulo}>
              {titulo}
            </Text>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              onPress={cerrar}
              style={estilos.cerrar}>
              <X color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[
              estilos.cuerpo,
              pie ? null : { paddingBottom: esp[5] + seguro.bottom },
            ]}
            keyboardShouldPersistTaps="handled"
            style={estilos.scroll}>
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
  relleno: { flex: 1 },
  hoja: {
    maxHeight: hoja.altoMaximo,
    backgroundColor: color.fondo,
    borderTopWidth: borde.barra,
    borderTopColor: color.marca,
  },
  cabecera: {
    minHeight: alto.riel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[2],
    paddingLeft: margen,
    paddingRight: esp[1],
    paddingTop: esp[1],
  },
  titulo: { ...tipo.hoja, color: color.tinta, flex: 1 },
  cerrar: {
    width: ancho.toque,
    height: alto.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 0, flexShrink: 1 },
  cuerpo: { gap: esp[4], paddingHorizontal: margen, paddingTop: esp[2], paddingBottom: esp[4] },
});
