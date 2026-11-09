import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { espacio, medida, tipo, tono, type TonoEstado } from '../tema';

type Props = { texto: string; tinta: TonoEstado; icono?: LucideIcon };

/** Sello de inspección: rectángulo con borde, icono y texto. Nunca solo color. */
export function Sello({ texto, tinta, icono: Icono }: Props) {
  const paleta = tono[tinta];

  return (
    <View style={[estilos.sello, { backgroundColor: paleta.fondo, borderColor: paleta.borde }]}>
      {Icono ? (
        <Icono color={paleta.texto} size={medida.iconoChico} strokeWidth={medida.trazoIcono} />
      ) : null}
      <Text numberOfLines={1} style={[tipo.sello, { color: paleta.texto }]}>
        {texto}
      </Text>
    </View>
  );
}

export function Sellos({ children }: { children: React.ReactNode }) {
  return <View style={estilos.sellos}>{children}</View>;
}

const estilos = StyleSheet.create({
  sello: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espacio.s1,
    minHeight: 28,
    paddingHorizontal: 7,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  sellos: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s1 + 2 },
});
