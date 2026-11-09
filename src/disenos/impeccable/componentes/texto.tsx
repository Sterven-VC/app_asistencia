import type { ReactNode } from 'react';
import { Image, Text, type StyleProp, type TextStyle } from 'react-native';

import { color, medida, texto, type VarianteTexto } from '../tema';

type Props = {
  v?: VarianteTexto;
  c?: string;
  lineas?: number;
  estilo?: StyleProp<TextStyle>;
  children: ReactNode;
};

/** Texto de la propuesta. Siempre sale de la rampa de tema.ts. */
export function T({ v = 'cuerpo', c = color.tinta, lineas, estilo, children }: Props) {
  return (
    <Text
      numberOfLines={lineas}
      ellipsizeMode={lineas ? 'tail' : undefined}
      maxFontSizeMultiplier={1.4}
      style={[texto[v], { color: c }, estilo]}>
      {children}
    </Text>
  );
}

export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <Image
      source={require('@/assets/images/logo-time-telemetry.png')}
      resizeMode="contain"
      accessibilityLabel="Time Telemetry"
      style={{
        width: grande ? medida.logoGrandeAncho : medida.logoAncho,
        height: grande ? medida.logoGrandeAlto : medida.logoAlto,
      }}
    />
  );
}
