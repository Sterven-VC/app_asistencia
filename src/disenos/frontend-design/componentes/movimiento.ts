import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** En web, el controlador nativo de Animated no existe. */
export const motorNativo = Platform.OS !== 'web';

export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    let vigente = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (vigente) setReducido(valor);
    });
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);
    return () => {
      vigente = false;
      suscripcion.remove();
    };
  }, []);

  return reducido;
}
