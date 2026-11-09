import * as Location from 'expo-location';

import type { MotivoSinUbicacion } from '@/tipos';

const ESPERA_MS = 7000;

export type ResultadoUbicacion = {
  latitud: number | null;
  longitud: number | null;
  precision_m: number | null;
  motivo_sin_ubicacion: MotivoSinUbicacion | null;
};

const sinUbicacion = (motivo: MotivoSinUbicacion): ResultadoUbicacion => ({
  latitud: null,
  longitud: null,
  precision_m: null,
  motivo_sin_ubicacion: motivo,
});

/** Captura la ubicación solo en este momento. No usa la última conocida ni sigue a la persona. */
export async function capturarUbicacion(): Promise<ResultadoUbicacion> {
  try {
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return sinUbicacion('sin_permiso');
    if (!(await Location.hasServicesEnabledAsync())) return sinUbicacion('sin_gps');

    const posicion = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolver) => setTimeout(() => resolver(null), ESPERA_MS)),
    ]);
    if (!posicion) return sinUbicacion('tiempo_agotado');

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precision_m: posicion.coords.accuracy ?? null,
      motivo_sin_ubicacion: null,
    };
  } catch {
    return sinUbicacion('sin_gps');
  }
}
