import { ArrowLeftRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDiseno } from './proveedor';
import { colorComun } from './tema-comun';

/** Herramienta temporal de comparación. Se borra al elegir un diseño. */
export function BotonCambioDiseno() {
  const { diseno, siguiente } = useDiseno();
  const margen = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const cambiar = () => {
    siguiente();
    setVisible(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setVisible(false), 1800);
  };

  return (
    <View pointerEvents="box-none" style={[estilos.capa, { top: margen.top + 6 }]}>
      {visible ? (
        <View style={estilos.etiqueta}>
          <Text accessibilityLiveRegion="polite" style={estilos.texto}>{diseno.nombre}</Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Cambiar diseño. Actual: ${diseno.nombre}`}
        hitSlop={6}
        onPress={cambiar}
        style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}>
        <ArrowLeftRight size={18} color={colorComun.superficie} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  capa: {
    position: 'absolute',
    right: 8,
    zIndex: 1000,
    elevation: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorComun.flotante,
  },
  presionado: { backgroundColor: colorComun.flotantePresionado },
  etiqueta: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colorComun.flotante,
  },
  texto: { color: colorComun.superficie, fontSize: 13, fontWeight: '600' },
});
