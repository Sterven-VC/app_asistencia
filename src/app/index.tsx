import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { colorComun } from '@/disenos/tema-comun';
import { pausaVigente, useSesion } from '@/services/sesion';

export default function Inicio() {
  const { listo, cuenta } = useSesion();
  if (!listo) return <View style={{ flex: 1, backgroundColor: colorComun.superficie }} />;
  if (!cuenta) return <Redirect href="/iniciar-sesion" />;
  if (cuenta.estado !== 'activa' || pausaVigente(cuenta)) return <Redirect href="/cuenta-no-activa" />;
  return <Redirect href={cuenta.rol === 'admin' ? '/marcaciones' : '/marcar'} />;
}
