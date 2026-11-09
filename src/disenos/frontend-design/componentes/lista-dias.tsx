import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatearFecha } from '@/utils/fechas';
import { color, espacio, medida, tipo } from '../tema';
import { conMayuscula } from '../textos';
import { TramoMira } from './mira';

export function agruparPorDia<T>(items: T[], fechaDe: (item: T) => string) {
  const grupos = new Map<string, T[]>();
  for (const item of items) {
    const fecha = fechaDe(item);
    grupos.set(fecha, [...(grupos.get(fecha) ?? []), item]);
  }
  return [...grupos].map(([fecha, delDia]) => ({ fecha, items: delDia }));
}

type Props = { fecha: string; indice: number; children: ReactNode };

/** Un día es un tramo de mira; el lado de los dientes alterna entre días. */
export function GrupoDia({ fecha, indice, children }: Props) {
  return (
    <View style={estilos.grupo}>
      <TramoMira empezarDerecha={indice % 2 === 1} />
      <View style={estilos.cuerpo}>
        <Text accessibilityRole="header" numberOfLines={1} style={[tipo.seccion, estilos.dia]}>
          {conMayuscula(formatearFecha(fecha))}
        </Text>
        {children}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { marginBottom: espacio.s3 },
  cuerpo: {
    marginLeft: medida.miraAngosta + espacio.s3,
    paddingRight: medida.margen,
    paddingBottom: espacio.s3,
  },
  dia: { color: color.grafito, paddingTop: espacio.s1, paddingBottom: espacio.s1 },
});
