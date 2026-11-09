import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { color, espacio, medida, radio } from '../tema';
import { Vacio } from './estados';
import { base, Fila } from './estructura';
import { Hoja } from './hoja';
import { T } from './texto';

type Props = {
  titulo: string;
  opciones: { id: string; nombre: string }[];
  elegida: string | null;
  elegir(id: string): void;
  /** Texto del campo mientras no hay nada elegido. */
  ayuda: string;
};

/** Campo que abre una hoja con las opciones. Reemplaza al select nativo. */
export function Selector({ titulo, opciones, elegida, elegir, ayuda }: Props) {
  const [abierto, setAbierto] = useState(false);
  const nombre = opciones.find((opcion) => opcion.id === elegida)?.nombre;
  return (
    <View style={estilos.campo}>
      <T v="rotuloFuerte">{titulo}</T>
      <Pressable
        onPress={() => setAbierto(true)}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${nombre ?? ayuda}`}
        android_ripple={{ color: color.ondaOscura }}
        style={estilos.control}>
        <T v="fuerte" c={nombre ? color.tinta : color.tintaMedia} lineas={1} estilo={base.flexible}>
          {nombre ?? ayuda}
        </T>
        <ChevronDown size={medida.icono} color={color.tinta} strokeWidth={medida.trazoCartel} />
      </Pressable>
      <Hoja titulo={titulo} visible={abierto} alCerrar={() => setAbierto(false)}>
        {!opciones.length ? <Vacio titulo="Sin opciones disponibles" /> : null}
        {opciones.map((opcion) => (
          <Fila
            key={opcion.id}
            etiqueta={opcion.id === elegida ? `${opcion.nombre}, elegida` : opcion.nombre}
            alPresionar={() => {
              elegir(opcion.id);
              setAbierto(false);
            }}>
            <T v="fuerte" estilo={base.flexible}>
              {opcion.nombre}
            </T>
            {opcion.id === elegida ? (
              <Check size={medida.icono} color={color.accion} strokeWidth={medida.trazoCartel} />
            ) : null}
          </Fila>
        ))}
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: espacio.s },
  control: {
    minHeight: medida.campo,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.l,
    backgroundColor: color.placa,
    borderTopLeftRadius: radio.placa,
    borderTopRightRadius: radio.placa,
    borderBottomWidth: medida.rayaCampo,
    borderBottomColor: color.tinta,
    overflow: 'hidden',
  },
});
