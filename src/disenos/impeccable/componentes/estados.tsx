import { RefreshCw } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { motorNativo, useSinMovimiento } from '../movimiento';
import { color, espacio, medida, radio, tiempo } from '../tema';
import { Boton } from './controles';
import { Senal, type ClaseSenal } from './senal';
import { T } from './texto';

/** Filas con la forma de lo que va a llegar. */
export function Esqueleto({ filas = 6 }: { filas?: number }) {
  const sinMovimiento = useSinMovimiento();
  const latido = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sinMovimiento) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.timing(latido, {
          toValue: 0.45,
          duration: tiempo.pulso,
          useNativeDriver: motorNativo,
        }),
        Animated.timing(latido, { toValue: 1, duration: tiempo.pulso, useNativeDriver: motorNativo }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [latido, sinMovimiento]);

  return (
    <Animated.View
      accessibilityLabel="Cargando"
      accessibilityRole="progressbar"
      style={{ opacity: latido }}>
      {Array.from({ length: filas }, (_, i) => (
        <View key={i} style={estilos.fila}>
          <View style={estilos.senal} />
          <View style={estilos.textos}>
            <View style={[estilos.barra, estilos.barraTitulo]} />
            <View style={[estilos.barra, estilos.barraDetalle]} />
          </View>
          <View style={[estilos.barra, estilos.barraHora]} />
        </View>
      ))}
    </Animated.View>
  );
}

type PropsVacio = {
  senal?: ClaseSenal;
  titulo: string;
  detalle?: string;
  accion?: { etiqueta: string; alPresionar(): void };
};

export function Vacio({ senal = 'apagado', titulo, detalle, accion }: PropsVacio) {
  return (
    <View style={estilos.centro}>
      <Senal clase={senal} tam={medida.iconoVacio} />
      <View style={estilos.grupo}>
        <T v="seccion">{titulo}</T>
        {detalle ? <T c={color.tintaMedia}>{detalle}</T> : null}
      </View>
      {accion ? (
        <View style={estilos.accion}>
          <Boton etiqueta={accion.etiqueta} alPresionar={accion.alPresionar} variante="neutro" />
        </View>
      ) : null}
    </View>
  );
}

type PropsFallo = {
  mensaje: string;
  reintentar?: () => void;
  volver?: () => void;
};

export function Fallo({ mensaje, reintentar, volver }: PropsFallo) {
  return (
    <View style={estilos.centro}>
      <Senal clase="rechazo" tam={medida.iconoVacio} />
      <View style={estilos.grupo}>
        <T v="seccion">No se pudo cargar</T>
        <T c={color.tintaMedia}>{mensaje}</T>
      </View>
      <View style={estilos.accion}>
        {reintentar ? (
          <Boton etiqueta="Reintentar" alPresionar={reintentar} variante="neutro" icono={RefreshCw} />
        ) : null}
        {volver ? <Boton etiqueta="Volver" alPresionar={volver} variante="neutro" /> : null}
      </View>
    </View>
  );
}

type TonoAviso = 'peligro' | 'aviso' | 'listo' | 'espera';

const aspectoAviso: Record<TonoAviso, { fondo: string; texto: string; senal: ClaseSenal }> = {
  peligro: { fondo: color.peligroFondo, texto: color.peligroTexto, senal: 'rechazo' },
  aviso: { fondo: color.avisoFondo, texto: color.avisoTexto, senal: 'aviso' },
  listo: { fondo: color.listoFondo, texto: color.listo, senal: 'ok' },
  espera: { fondo: color.esperaFondo, texto: color.espera, senal: 'espera' },
};

/** Aviso a todo el ancho. Dice qué pasó y, si hace falta, qué hacer. */
export function Aviso({ tono, mensaje, detalle }: { tono: TonoAviso; mensaje: string; detalle?: string }) {
  const a = aspectoAviso[tono];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[estilos.aviso, { backgroundColor: a.fondo }]}>
      <Senal clase={a.senal} tam={medida.senal} />
      <View style={estilos.textos}>
        <T v="fuerte" c={a.texto}>
          {mensaje}
        </T>
        {detalle ? (
          <T v="rotulo" c={a.texto}>
            {detalle}
          </T>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    padding: espacio.l,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  senal: {
    width: medida.senal,
    height: medida.senal,
    borderRadius: radio.placa,
    backgroundColor: color.placa,
  },
  textos: { flex: 1, minWidth: 0, gap: espacio.xs },
  barra: { borderRadius: radio.placa, backgroundColor: color.placa },
  barraTitulo: { width: '70%', height: medida.esqueletoTitulo },
  barraDetalle: { width: '45%', height: medida.esqueletoTexto },
  barraHora: { width: medida.columnaHora / 1.6, height: medida.senal },
  centro: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: espacio.l,
    padding: espacio.xl,
  },
  grupo: { gap: espacio.xs },
  accion: { alignSelf: 'stretch', gap: espacio.s },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.m,
  },
});
