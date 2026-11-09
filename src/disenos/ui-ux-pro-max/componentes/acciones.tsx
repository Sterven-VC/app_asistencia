import { ArrowRight, type LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alto, borde, color, esp, icono, margen, movimiento, tipo } from '../tema';

type Tono = 'marca' | 'peligro' | 'neutro';

const fondoBloque: Record<Tono, string> = {
  marca: color.marcaFuerte,
  peligro: color.peligro,
  neutro: color.fondo,
};

/**
 * Firma del sistema: la acción principal es un bloque de borde a borde al pie de la pantalla.
 * Sin esquinas ni margen, para que un pulgar con guante no tenga que apuntar.
 */
export function BloqueAccion({
  texto,
  alPulsar,
  cargando = false,
  deshabilitado = false,
  tono = 'marca',
  icono: Icono = ArrowRight,
  pie = false,
  compacto = false,
  estilo,
}: {
  texto: string;
  alPulsar(): void;
  cargando?: boolean;
  deshabilitado?: boolean;
  tono?: Tono;
  icono?: LucideIcon;
  /** Verdadero si no hay barra debajo y debe respetar el área segura inferior. */
  pie?: boolean;
  /** Para compartir el pie con otra acción: letra de botón y sin icono. */
  compacto?: boolean;
  estilo?: StyleProp<ViewStyle>;
}) {
  const seguro = useSafeAreaInsets();
  const inactivo = cargando || deshabilitado;
  const neutro = tono === 'neutro';
  const tinta = deshabilitado || neutro ? color.tinta : color.sobreColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={alPulsar}
      style={[
        estilos.bloque,
        { backgroundColor: deshabilitado ? color.fondoAlt : fondoBloque[tono] },
        (neutro || deshabilitado) && estilos.bloqueConRegla,
        pie && { paddingBottom: seguro.bottom },
        estilo,
      ]}>
      {({ pressed }) => (
        <>
          <View style={estilos.contenido}>
            <Text
              numberOfLines={1}
              style={[compacto ? tipo.boton : tipo.bloque, estilos.textoBloque, { color: tinta }]}>
              {texto}
            </Text>
            {cargando ? (
              <ActivityIndicator color={tinta} />
            ) : compacto ? null : (
              <Icono color={tinta} size={icono.grande} strokeWidth={icono.trazoCartel} />
            )}
          </View>
          {pressed ? <View pointerEvents="none" style={estilos.capaPresion} /> : null}
        </>
      )}
    </Pressable>
  );
}

type Variante = 'secundario' | 'peligro';

/** Acción de apoyo dentro del cuerpo. Nunca compite con el bloque del pie. */
export function Boton({
  texto,
  alPulsar,
  variante = 'secundario',
  cargando = false,
  deshabilitado = false,
  icono: Icono,
  estilo,
}: {
  texto: string;
  alPulsar(): void;
  variante?: Variante;
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: LucideIcon;
  estilo?: StyleProp<ViewStyle>;
}) {
  const inactivo = cargando || deshabilitado;
  const tinta = variante === 'peligro' ? color.peligro : color.tinta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={alPulsar}
      style={({ pressed }) => [
        estilos.boton,
        { borderColor: tinta },
        deshabilitado && estilos.botonInactivo,
        pressed && estilos.botonPresionado,
        estilo,
      ]}>
      {cargando ? (
        <ActivityIndicator color={tinta} />
      ) : Icono ? (
        <Icono color={tinta} size={icono.base} strokeWidth={icono.trazo} />
      ) : null}
      <Text numberOfLines={1} style={[tipo.boton, { color: tinta }]}>
        {texto}
      </Text>
    </Pressable>
  );
}

/** Acción sin borde, para lo que no debe llamar la atención. */
export function BotonDiscreto({
  texto,
  alPulsar,
  icono: Icono,
  estilo,
}: {
  texto: string;
  alPulsar(): void;
  icono?: LucideIcon;
  estilo?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texto}
      onPress={alPulsar}
      style={({ pressed }) => [estilos.discreto, pressed && estilos.discretoPresionado, estilo]}>
      {Icono ? <Icono color={color.tintaMedia} size={icono.base} strokeWidth={icono.trazo} /> : null}
      <Text numberOfLines={1} style={[tipo.etiqueta, estilos.textoDiscreto]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  bloque: { minHeight: alto.bloque },
  bloqueConRegla: { borderTopWidth: borde.regla, borderTopColor: color.tinta },
  contenido: {
    minHeight: alto.bloque,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: esp[2],
    paddingHorizontal: margen,
  },
  textoBloque: { flexShrink: 1 },
  capaPresion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
  boton: {
    minHeight: alto.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: esp[2],
    paddingHorizontal: esp[4],
    borderWidth: borde.regla,
    backgroundColor: color.fondo,
  },
  botonInactivo: { opacity: 0.6 },
  botonPresionado: {
    backgroundColor: color.fondoAlt,
    transform: [{ scale: movimiento.presionBoton }],
  },
  discreto: {
    minHeight: alto.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[2],
    paddingHorizontal: esp[2],
  },
  discretoPresionado: { backgroundColor: color.presionClara },
  textoDiscreto: { color: color.tintaMedia },
});
