import { TriangleAlert } from 'lucide-react-native';
import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { color, espacio, medida, movimiento, tipo, tono } from '../tema';
import { Boton } from './estructura';
import { TramoMira } from './mira';
import { motorNativo, useMovimientoReducido } from './movimiento';

/** Filas con la forma de lo que va a llegar: hora a la izquierda, texto a la derecha. */
export function FilasEsqueleto({ filas = 5, conHora = true }: { filas?: number; conHora?: boolean }) {
  const reducido = useMovimientoReducido();
  const opacidad = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducido) return;
    const pulso = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, {
          toValue: 0.5,
          duration: movimiento.barrido,
          useNativeDriver: motorNativo,
        }),
        Animated.timing(opacidad, {
          toValue: 1,
          duration: movimiento.barrido,
          useNativeDriver: motorNativo,
        }),
      ]),
    );
    pulso.start();
    return () => pulso.stop();
  }, [opacidad, reducido]);

  return (
    <Animated.View
      accessibilityLabel="Cargando"
      accessibilityRole="progressbar"
      style={[estilos.esqueleto, { opacity: opacidad }]}>
      {Array.from({ length: filas }, (_, indice) => (
        <View key={indice} style={estilos.esqueletoFila}>
          {conHora ? <View style={estilos.esqueletoHora} /> : null}
          <View style={estilos.esqueletoTexto}>
            <View style={estilos.esqueletoLinea} />
            <View style={[estilos.esqueletoLinea, estilos.esqueletoLineaCorta]} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

type PropsVacio = { titulo: string; detalle?: string; accion?: ReactNode };

/** Mira sin lectura: todavía no hay nada que leer. */
export function EstadoVacio({ titulo, detalle, accion }: PropsVacio) {
  return (
    <View style={estilos.vacio}>
      <TramoMira />
      <View style={estilos.vacioCuerpo}>
        <Text accessibilityRole="header" style={[tipo.seccion, estilos.tinta]}>
          {titulo}
        </Text>
        {detalle ? <Text style={[tipo.cuerpo, estilos.apagado]}>{detalle}</Text> : null}
        {accion}
      </View>
    </View>
  );
}

export function EstadoError({ mensaje, reintentar }: { mensaje: string; reintentar?(): void }) {
  return (
    <View accessibilityRole="alert" style={estilos.error}>
      <TriangleAlert color={tono.peligro.texto} size={32} strokeWidth={medida.trazoIcono} />
      <Text style={[tipo.seccion, estilos.errorTexto]}>{mensaje}</Text>
      {reintentar ? <Boton alPresionar={reintentar} etiqueta="Reintentar" /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  esqueleto: { padding: medida.margen, gap: espacio.s5 },
  esqueletoFila: { flexDirection: 'row', gap: espacio.s3 },
  esqueletoHora: { width: medida.columnaHora, height: 38, backgroundColor: color.hormigon },
  esqueletoTexto: { flex: 1, gap: espacio.s2, paddingTop: espacio.s1 },
  esqueletoLinea: { height: 18, backgroundColor: color.hormigon },
  esqueletoLineaCorta: { width: '55%', height: 14 },
  vacio: { minHeight: 160, marginTop: espacio.s5 },
  vacioCuerpo: {
    marginLeft: medida.miraAngosta + espacio.s4,
    marginRight: medida.margen,
    gap: espacio.s2,
    paddingVertical: espacio.s2,
  },
  error: { padding: medida.margen, paddingTop: espacio.s6, gap: espacio.s3 },
  errorTexto: { color: tono.peligro.texto },
});
