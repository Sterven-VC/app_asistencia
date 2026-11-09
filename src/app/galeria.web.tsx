import { useLocalSearchParams } from 'expo-router';
import type { ComponentType } from 'react';
import { View } from 'react-native';

import type { IdDiseno, Pantallas, VistaNavegacion } from '@/disenos/contrato';
import { ejemplos, navegacionEjemplo } from '@/disenos/datos-ejemplo';
import { useDiseno } from '@/disenos/proveedor';
import { disenos } from '@/disenos/registro';

/**
 * Galería para revisar el aspecto sin servidor.
 * Uso: /galeria?diseno=impeccable&pantalla=marcar&barra=1
 */
export default function Galeria() {
  const parametros = useLocalSearchParams<{ diseno?: string; pantalla?: string; barra?: string }>();
  const activo = useDiseno().diseno;
  const id = parametros.diseno as IdDiseno;
  const diseno = Object.hasOwn(disenos, id) ? disenos[id] : activo;
  const pantalla = parametros.pantalla as keyof Pantallas;
  const nombre = Object.hasOwn(ejemplos, pantalla) ? pantalla : 'marcar';
  const Pantalla = diseno.pantallas[nombre] as ComponentType<object>;
  const Barra = diseno.BarraNavegacion as ComponentType<VistaNavegacion>;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Pantalla {...ejemplos[nombre]} />
      </View>
      {parametros.barra === '1' ? (
        <Barra {...(navegacionEjemplo as unknown as VistaNavegacion)} />
      ) : null}
    </View>
  );
}
