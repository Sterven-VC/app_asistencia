import {
  CalendarX,
  ClipboardCheck,
  FolderKanban,
  History,
  LogOut,
  type LucideIcon,
  MapPinCheck,
  Users,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconoNavegacion, VistaNavegacion } from '../../contrato';
import { alto, borde, color, esp, icono, tipo } from '../tema';

const iconos: Record<IconoNavegacion, LucideIcon> = {
  marcar: MapPinCheck,
  historial: History,
  marcaciones: ClipboardCheck,
  cuentas: Users,
  proyectos: FolderKanban,
  faltas: CalendarX,
  salir: LogOut,
};

type Item = VistaNavegacion['items'][number];

function columnas(total: number): number {
  if (total <= 3) return Math.max(total, 1);
  return total === 4 ? 2 : 3;
}

function enFilas(items: readonly Item[], porFila: number): Item[][] {
  const filas: Item[][] = [];
  for (let i = 0; i < items.length; i += porFila) filas.push(items.slice(i, i + porFila));
  return filas;
}

/**
 * Tablero en vez de pestañas: el personal ve 2 celdas anchas y la admin una rejilla de 3 x 2.
 * Así los 6 destinos conservan su rótulo a 14 px y nada queda escondido en un "Más".
 */
export function BarraNavegacion({ items }: VistaNavegacion) {
  const seguro = useSafeAreaInsets();
  const porFila = columnas(items.length);
  const ancha = items.length <= 3;

  return (
    <View accessibilityRole="tablist" style={[estilos.barra, { paddingBottom: seguro.bottom }]}>
      {enFilas(items, porFila).map((fila, f) => (
        <View key={f} style={[estilos.fila, f > 0 && estilos.filaRegla]}>
          {fila.map((item, i) => {
            const Icono = iconos[item.icono];
            const tinta = item.activa ? color.sobreColor : color.tinta;
            return (
              <Pressable
                accessibilityRole={item.icono === 'salir' ? 'button' : 'tab'}
                accessibilityLabel={item.etiqueta}
                accessibilityState={item.icono === 'salir' ? undefined : { selected: item.activa }}
                key={item.id}
                onPress={item.ir}
                style={({ pressed }) => [
                  ancha ? estilos.celdaAncha : estilos.celda,
                  i > 0 && estilos.celdaRegla,
                  item.activa && estilos.celdaActiva,
                  pressed && !item.activa && estilos.celdaPresionada,
                ]}>
                <Icono
                  color={tinta}
                  size={ancha ? icono.medio : icono.base}
                  strokeWidth={icono.trazo}
                />
                <Text
                  numberOfLines={1}
                  style={[ancha ? tipo.seccion : tipo.placa, estilos.rotulo, { color: tinta }]}>
                  {item.etiqueta}
                </Text>
                {item.activa ? <View style={estilos.marca} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const celda = {
  flex: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: esp[1],
  paddingHorizontal: esp[1],
} as const;

const estilos = StyleSheet.create({
  barra: {
    backgroundColor: color.fondo,
    borderTopWidth: borde.regla,
    borderTopColor: color.tinta,
  },
  fila: { flexDirection: 'row' },
  filaRegla: { borderTopWidth: borde.fino, borderTopColor: color.tinta },
  celda: { ...celda, height: alto.celda },
  celdaAncha: { ...celda, height: alto.celdaAncha, gap: esp[2] },
  celdaRegla: { borderLeftWidth: borde.fino, borderLeftColor: color.tinta },
  celdaActiva: { backgroundColor: color.tinta },
  celdaPresionada: { backgroundColor: color.fondoAlt },
  rotulo: { flexShrink: 1 },
  marca: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: borde.acento,
    backgroundColor: color.marca,
  },
});
