import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alto, ancho, anchoAngosto, borde, color, esp, icono, margen, tipo } from '../tema';

const logo = require('@/assets/images/logo-time-telemetry.png');

/** Fondo, área segura superior y teclado. El área inferior la resuelve el pie de cada pantalla. */
export function Marco({ children }: { children: ReactNode }) {
  const seguro = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior="padding" style={[estilos.marco, { paddingTop: seguro.top }]}>
      {children}
    </KeyboardAvoidingView>
  );
}

/** Fila superior. Nunca entra al cuadro reservado de la esquina derecha. */
export function Riel({ titulo, dato }: { titulo: string; dato?: number }) {
  const { width } = useWindowDimensions();
  const estiloTitulo = width < anchoAngosto ? tipo.tituloChico : tipo.titulo;
  return (
    <View style={estilos.riel}>
      <Text accessibilityRole="header" numberOfLines={1} style={[estiloTitulo, estilos.titulo]}>
        {titulo}
      </Text>
      {dato === undefined ? null : <Text style={estilos.conteo}>{dato}</Text>}
    </View>
  );
}

export function RielVolver({ volver }: { volver(): void }) {
  return (
    <View style={estilos.rielVolver}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={volver}
        style={({ pressed }) => [estilos.volver, pressed && estilos.presionado]}>
        <ArrowLeft color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
      </Pressable>
    </View>
  );
}

export function RielLogo() {
  return (
    <View style={estilos.rielLogo}>
      <Image
        accessibilityLabel="Time Telemetry"
        accessibilityRole="image"
        resizeMode="contain"
        source={logo}
        style={estilos.logo}
      />
    </View>
  );
}

/** Regla de 2 px que separa bloques. Es la única estructura visible del sistema. */
export function Regla() {
  return <View style={estilos.regla} />;
}

const estilos = StyleSheet.create({
  marco: { flex: 1, backgroundColor: color.fondo },
  riel: {
    minHeight: alto.riel,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: esp[2],
    paddingLeft: margen,
    paddingRight: ancho.zonaLibre,
    paddingTop: esp[1],
  },
  titulo: { color: color.tinta, flexShrink: 1 },
  conteo: { ...tipo.conteo, color: color.marcaFuerte },
  rielVolver: {
    height: alto.riel,
    justifyContent: 'center',
    paddingLeft: esp[1],
    paddingRight: ancho.zonaLibre,
  },
  volver: {
    width: ancho.toque,
    height: alto.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: { backgroundColor: color.presionClara },
  rielLogo: {
    height: alto.rielLogo,
    justifyContent: 'center',
    paddingLeft: margen,
    paddingRight: ancho.zonaLibre,
  },
  logo: { width: ancho.logo, height: alto.logo },
  regla: { height: borde.regla, backgroundColor: color.tinta },
});
