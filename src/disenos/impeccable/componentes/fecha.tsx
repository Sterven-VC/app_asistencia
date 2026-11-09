import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { fechaLima, formatearFecha } from '@/utils/fechas';

import { color, espacio, medida, radio } from '../tema';
import { T } from './texto';

function moverDia(fecha: string, dias: number): string {
  const dia = new Date(`${fecha}T12:00:00-05:00`);
  dia.setUTCDate(dia.getUTCDate() + dias);
  return fechaLima(dia);
}

type Props = {
  valor: string | null;
  alCambiar(valor: string | null): void;
};

/** Selector de día con flechas grandes, sin teclado ni calendario pequeño. */
export function SelectorFecha({ valor, alCambiar }: Props) {
  const mover = (dias: number) => alCambiar(moverDia(valor ?? fechaLima(), valor ? dias : 0));

  return (
    <View style={estilos.fila}>
      <Flecha icono={ChevronLeft} etiqueta="Día anterior" alPresionar={() => mover(-1)} />
      <Pressable
        onPress={() => alCambiar(valor ? null : fechaLima())}
        accessibilityRole="button"
        accessibilityLabel={valor ? 'Ver todas las fechas' : 'Ver hoy'}
        android_ripple={{ color: color.ondaOscura }}
        style={estilos.centro}>
        <T v="fuerte" lineas={1}>
          {valor ? formatearFecha(valor) : 'Todas las fechas'}
        </T>
        <T v="rotulo" c={color.tintaMedia} lineas={1}>
          {valor ? 'Ver todas' : 'Ver hoy'}
        </T>
      </Pressable>
      <Flecha icono={ChevronRight} etiqueta="Día siguiente" alPresionar={() => mover(1)} />
    </View>
  );
}

function Flecha({
  icono: Icono,
  etiqueta,
  alPresionar,
}: {
  icono: LucideIcon;
  etiqueta: string;
  alPresionar(): void;
}) {
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      android_ripple={{ color: color.ondaOscura }}
      style={estilos.flecha}>
      <Icono size={medida.icono} color={color.tinta} strokeWidth={medida.trazoCartel} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: espacio.xs,
  },
  flecha: {
    width: medida.control,
    minHeight: medida.campo,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.placa,
    backgroundColor: color.placa,
    overflow: 'hidden',
  },
  centro: {
    flex: 1,
    minWidth: 0,
    minHeight: medida.campo,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.placa,
    backgroundColor: color.placa,
    overflow: 'hidden',
  },
});
