import {
  CalendarX,
  ClipboardCheck,
  Crosshair,
  HardHat,
  History,
  LogOut,
  type LucideIcon,
  Users,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconoNavegacion, VistaNavegacion } from '../../contrato';
import { color, espacio, medida, tipo } from '../tema';

const iconos: Record<IconoNavegacion, LucideIcon> = {
  marcar: Crosshair,
  historial: History,
  marcaciones: ClipboardCheck,
  cuentas: Users,
  proyectos: HardHat,
  faltas: CalendarX,
  salir: LogOut,
};

/** El activo es un bloque de tinta con tapa naranja, visible a pleno sol. */
export function BarraNavegacion({ items }: VistaNavegacion) {
  const margen = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pocos = items.length <= 3;
  const letra = pocos ? tipo.rotulo : width < 360 ? estilos.letraApretada : tipo.nav;

  return (
    <View
      accessibilityRole="tablist"
      style={[estilos.barra, { paddingBottom: margen.bottom }]}>
      {items.map((item) => {
        const Icono = iconos[item.icono];
        const tinta = item.activa ? color.sobreAccion : color.grafito;
        return (
          <Pressable
            accessibilityLabel={item.etiqueta}
            accessibilityRole={item.icono === 'salir' ? 'button' : 'tab'}
            accessibilityState={item.icono === 'salir' ? undefined : { selected: item.activa }}
            key={item.id}
            onPress={item.ir}
            style={({ pressed }) => [
              estilos.destino,
              pocos && estilos.destinoAncho,
              item.activa && estilos.destinoActivo,
              pressed && !item.activa && estilos.presion,
            ]}>
            <Icono color={tinta} size={pocos ? 24 : 22} strokeWidth={medida.trazoIcono} />
            <Text maxFontSizeMultiplier={1.15} numberOfLines={1} style={[letra, { color: tinta }]}>
              {item.etiqueta}
            </Text>
            {item.activa ? <View style={estilos.tapa} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: color.papel,
    borderTopColor: color.grafito,
    borderTopWidth: medida.lineaFuerte,
  },
  destino: {
    flex: 1,
    minWidth: 0,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  destinoAncho: { flexDirection: 'row', gap: espacio.s2 },
  destinoActivo: { backgroundColor: color.grafito },
  presion: { backgroundColor: color.presionClara },
  tapa: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: medida.tapaActiva,
    backgroundColor: color.reticula,
  },
  letraApretada: { ...tipo.nav, fontSize: 13 },
});
