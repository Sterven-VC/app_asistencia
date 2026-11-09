import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BotonCambioDiseno } from '@/disenos/boton-cambio';
import { ProveedorDiseno } from '@/disenos/proveedor';
import { fuentesDeTodos } from '@/disenos/registro';
import { colorComun } from '@/disenos/tema-comun';
import { ProveedorSesion } from '@/services/sesion';
import { iniciarEscuchaDeRed } from '@/services/sincronizacion';
import { registrarTareaDeEnvio } from '@/services/tarea-sincronizacion';

export default function Raiz() {
  const [fuentesListas] = useFonts(fuentesDeTodos);

  useEffect(() => {
    void registrarTareaDeEnvio();
    return iniciarEscuchaDeRed();
  }, []);

  if (!fuentesListas) return <View style={{ flex: 1, backgroundColor: colorComun.superficie }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProveedorSesion>
          <ProveedorDiseno>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
            <BotonCambioDiseno />
          </ProveedorDiseno>
        </ProveedorSesion>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
