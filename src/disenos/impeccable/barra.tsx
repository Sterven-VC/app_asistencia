import {
  CalendarX,
  ClipboardCheck,
  HardHat,
  History,
  LogOut,
  MapPinCheck,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconoNavegacion, VistaNavegacion } from '../contrato';
import { T } from './componentes/texto';
import { color, espacio, medida } from './tema';

const iconos: Record<IconoNavegacion, LucideIcon> = {
  marcar: MapPinCheck,
  historial: History,
  marcaciones: ClipboardCheck,
  cuentas: Users,
  proyectos: HardHat,
  faltas: CalendarX,
  salir: LogOut,
};

/**
 * La opción activa es una celda del mismo campo que el letrero de Marcar.
 * Con dos destinos van en fila y grandes. Con seis, en columna y en letra angosta.
 */
export function BarraNavegacion({ items }: VistaNavegacion) {
  const margen = useSafeAreaInsets();
  const pocas = items.length <= 3;

  return (
    <View accessibilityRole="tablist" style={[estilos.barra, { paddingBottom: margen.bottom }]}>
      {items.map((item) => {
        const Icono = iconos[item.icono];
        const tinta = item.activa ? color.blanco : color.bandaTexto;
        return (
          <Pressable
            key={item.id}
            onPress={item.ir}
            accessibilityRole={item.icono === 'salir' ? 'button' : 'tab'}
            accessibilityLabel={item.etiqueta}
            accessibilityState={item.icono === 'salir' ? undefined : { selected: item.activa }}
            android_ripple={{ color: color.ondaClara }}
            style={[
              estilos.celda,
              pocas ? estilos.celdaAncha : estilos.celdaAngosta,
              item.activa && estilos.celdaActiva,
            ]}>
            <Icono
              size={medida.icono}
              color={tinta}
              strokeWidth={item.activa ? medida.trazoCartel : medida.trazoIcono}
            />
            <T v={pocas ? 'navAncha' : 'nav'} c={tinta} lineas={1}>
              {item.etiqueta}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: { flexDirection: 'row', backgroundColor: color.banda },
  celda: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  celdaAncha: { flexDirection: 'row', gap: espacio.s, minHeight: medida.barraAncha },
  celdaAngosta: { gap: espacio.xs, minHeight: medida.barra },
  celdaActiva: { backgroundColor: color.accion },
});
