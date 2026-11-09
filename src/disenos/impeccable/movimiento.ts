import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing, Platform } from 'react-native';

import { curvaEntrada, curvaSalida } from './tema';

export const motorNativo = Platform.OS !== 'web';

export const entrada = Easing.bezier(...curvaEntrada);
export const salida = Easing.bezier(...curvaSalida);

/** Verdadero si el teléfono pide reducir animaciones. */
export function useSinMovimiento(): boolean {
  const [sinMovimiento, setSinMovimiento] = useState(false);

  useEffect(() => {
    let vigente = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (vigente) setSinMovimiento(valor);
    });
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setSinMovimiento);
    return () => {
      vigente = false;
      suscripcion.remove();
    };
  }, []);

  return sinMovimiento;
}
