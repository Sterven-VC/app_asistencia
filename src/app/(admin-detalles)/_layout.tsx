import { Redirect, Stack } from 'expo-router';

import { useSesion } from '@/services/sesion';

export default function LayoutAdminDetalles() {
  const { listo, cuenta } = useSesion();
  if (!listo) return null;
  if (cuenta?.rol !== 'admin' || cuenta.estado !== 'activa') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
