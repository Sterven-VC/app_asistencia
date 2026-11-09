import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { color, medida } from '../tema';

/**
 * El estado se lee por la forma, como en una señal de seguridad:
 * círculo lleno, hay que actuar. Triángulo, advertencia. Cuadrado, condición.
 * Círculo cruzado, rechazo. Funciona igual sin color.
 */
export type ClaseSenal = 'hacer' | 'ok' | 'aviso' | 'rechazo' | 'espera' | 'apagado';

type Props = {
  clase: ClaseSenal;
  tam?: number;
  /** Dibuja la señal en blanco para ponerla sobre un campo de color. */
  sobreCampo?: boolean;
};

export function Senal({ clase, tam = medida.senal, sobreCampo = false }: Props) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={tam} height={tam} viewBox="0 0 24 24" fill="none">
        {dibujo(clase, sobreCampo)}
      </Svg>
    </View>
  );
}

function dibujo(clase: ClaseSenal, sobreCampo: boolean) {
  const claro = color.blanco;
  switch (clase) {
    case 'hacer':
      return (
        <>
          <Circle cx={12} cy={12} r={11} fill={sobreCampo ? claro : color.accion} />
          <Path
            d="M6.8 12h9.4M12.6 7.8l4.2 4.2-4.2 4.2"
            stroke={sobreCampo ? color.accion : claro}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'ok':
      return (
        <>
          <Rect x={1} y={1} width={22} height={22} rx={4} fill={sobreCampo ? claro : color.listo} />
          <Path
            d="M6.4 12.6l3.8 3.8 7.4-8.4"
            stroke={sobreCampo ? color.listo : claro}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'aviso':
      return (
        <>
          <Path
            d="M12 2.6 22.3 20.5a.7.7 0 0 1-.6 1H2.3a.7.7 0 0 1-.6-1z"
            fill={color.aviso}
            stroke={color.tinta}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <Path d="M12 9.4v5.4" stroke={color.tinta} strokeWidth={2.4} strokeLinecap="round" />
          <Circle cx={12} cy={18} r={1.4} fill={color.tinta} />
        </>
      );
    case 'rechazo':
      return (
        <>
          <Circle
            cx={12}
            cy={12}
            r={9.8}
            fill={sobreCampo ? 'none' : claro}
            stroke={sobreCampo ? claro : color.peligro}
            strokeWidth={3.2}
          />
          <Path
            d="M5.2 5.2l13.6 13.6"
            stroke={sobreCampo ? claro : color.peligro}
            strokeWidth={3.2}
          />
        </>
      );
    case 'espera':
      return (
        <>
          <Rect x={1} y={1} width={22} height={22} rx={4} fill={sobreCampo ? claro : color.espera} />
          <Circle cx={12} cy={12} r={6.6} stroke={sobreCampo ? color.espera : claro} strokeWidth={2} />
          <Path
            d="M12 8.6V12l2.4 1.7"
            stroke={sobreCampo ? color.espera : claro}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'apagado':
      return (
        <>
          <Circle cx={12} cy={12} r={10} stroke={color.fileteFuerte} strokeWidth={2.4} />
          <Path d="M7.4 12h9.2" stroke={color.fileteFuerte} strokeWidth={2.4} strokeLinecap="round" />
        </>
      );
  }
}
