import { ArrowLeft, type LucideIcon, TriangleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, espacio, medida, tipo, tono, type TonoEstado } from '../tema';

type PropsBotonIcono = {
  icono: LucideIcon;
  etiqueta: string;
  alPresionar(): void;
  tinta?: string;
};

export function BotonIcono({ icono: Icono, etiqueta, alPresionar, tinta = color.grafito }: PropsBotonIcono) {
  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      onPress={alPresionar}
      style={({ pressed }) => [estilos.botonIcono, pressed && estilos.presionClara]}>
      <Icono color={tinta} size={24} strokeWidth={medida.trazoIcono} />
    </Pressable>
  );
}

type PropsCabecera = {
  titulo: string;
  volver?(): void;
  /** Línea bajo el título. */
  detalle?: ReactNode;
  /** Dos líneas para nombres de persona, que no deben perderse. */
  lineas?: 1 | 2;
};

/** La primera fila deja libre el cuadro superior derecho. */
export function Cabecera({ titulo, volver, detalle, lineas = 1 }: PropsCabecera) {
  const margen = useSafeAreaInsets();

  return (
    <View style={[estilos.cabecera, { paddingTop: margen.top + espacio.s2 }]}>
      <View style={estilos.cabeceraFila}>
        {volver ? <BotonIcono etiqueta="Volver" icono={ArrowLeft} alPresionar={volver} /> : null}
        <Text
          accessibilityRole="header"
          ellipsizeMode="tail"
          numberOfLines={lineas}
          style={[tipo.titulo, estilos.titulo, !volver && estilos.tituloSinVolver]}>
          {titulo}
        </Text>
      </View>
      {detalle ? <View style={estilos.cabeceraDetalle}>{detalle}</View> : null}
    </View>
  );
}

type PropsLosa = {
  etiqueta: string;
  alPresionar(): void;
  /** Reemplaza la etiqueta mientras dura la acción. */
  ocupada?: string | false;
  deshabilitada?: boolean;
  /** Suma el área segura inferior. Falso cuando hay barra de navegación debajo. */
  alPie?: boolean;
  tinta?: 'accion' | 'peligro' | 'papel';
};

/** Acción principal: una losa de borde a borde, al alcance del pulgar. */
export function Losa({
  etiqueta,
  alPresionar,
  ocupada = false,
  deshabilitada = false,
  alPie = true,
  tinta = 'accion',
}: PropsLosa) {
  const margen = useSafeAreaInsets();
  const inactiva = deshabilitada || Boolean(ocupada);
  const fondo = {
    accion: color.accion,
    peligro: tono.peligro.borde,
    papel: color.papel,
  }[tinta];
  const letra = tinta === 'papel' ? tono.peligro.texto : color.sobreAccion;

  return (
    <Pressable
      accessibilityLabel={ocupada || etiqueta}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactiva, busy: Boolean(ocupada) }}
      disabled={inactiva}
      onPress={alPresionar}
      style={[
        estilos.losa,
        { backgroundColor: deshabilitada ? color.hormigon : fondo },
        alPie && { paddingBottom: margen.bottom },
      ]}>
      {({ pressed }) => (
        <>
          <View style={estilos.losaContenido}>
            {ocupada ? <ActivityIndicator color={letra} /> : null}
            <Text
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              style={[tipo.losa, { color: deshabilitada ? color.plomo : letra }]}>
              {ocupada || etiqueta}
            </Text>
          </View>
          {pressed ? <View pointerEvents="none" style={estilos.capaPresion} /> : null}
        </>
      )}
    </Pressable>
  );
}

type PropsBoton = {
  etiqueta: string;
  alPresionar(): void;
  icono?: LucideIcon;
  peligro?: boolean;
  deshabilitado?: boolean;
  ocupado?: boolean;
  /** Alto de 48 en vez de 56, para dentro de una fila. */
  chico?: boolean;
};

export function Boton({
  etiqueta,
  alPresionar,
  icono: Icono,
  peligro = false,
  deshabilitado = false,
  ocupado = false,
  chico = false,
}: PropsBoton) {
  const tinta = peligro ? tono.peligro.texto : color.grafito;
  const inactivo = deshabilitado || ocupado;

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: ocupado }}
      disabled={inactivo}
      onPress={alPresionar}
      style={({ pressed }) => [
        estilos.boton,
        chico && estilos.botonChico,
        { borderColor: tinta },
        pressed && estilos.presionClara,
        inactivo && estilos.inactivo,
      ]}>
      {ocupado ? (
        <ActivityIndicator color={tinta} />
      ) : Icono ? (
        <Icono color={tinta} size={medida.icono} strokeWidth={medida.trazoIcono} />
      ) : null}
      <Text numberOfLines={1} style={[tipo.nombre, { color: tinta }]}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

type PropsAviso = {
  mensaje: string;
  tinta?: TonoEstado;
  icono?: LucideIcon;
  /** De borde a borde, sin margen lateral. */
  banda?: boolean;
};

export function Aviso({ mensaje, tinta = 'peligro', icono: Icono = TriangleAlert, banda = false }: PropsAviso) {
  const paleta = tono[tinta];

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        estilos.aviso,
        banda && estilos.avisoBanda,
        { backgroundColor: paleta.fondo, borderLeftColor: paleta.borde },
      ]}>
      <Icono color={paleta.texto} size={medida.icono} strokeWidth={medida.trazoIcono} />
      <Text style={[tipo.fuerte, estilos.avisoTexto, { color: paleta.texto }]}>{mensaje}</Text>
    </View>
  );
}

export function Seccion({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <View style={estilos.seccion}>
      {titulo ? (
        <Text accessibilityRole="header" style={[tipo.seccion, estilos.tinta]}>
          {titulo}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** Etiqueta chica sobre una cifra, con su unidad dentro del valor. */
export function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Text numberOfLines={1} style={[tipo.etiqueta, estilos.apagado]}>
        {etiqueta}
      </Text>
      <Text numberOfLines={1} style={[tipo.hora, estilos.tinta]}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  botonIcono: {
    width: medida.toque,
    height: medida.toque,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: medida.radio,
  },
  presionClara: { backgroundColor: color.presionClara },
  inactivo: { opacity: 0.6 },
  cabecera: {
    backgroundColor: color.papel,
    borderBottomColor: color.grafito,
    borderBottomWidth: medida.lineaFuerte,
    paddingBottom: espacio.s2,
  },
  cabeceraFila: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: espacio.s1,
    paddingRight: medida.esquinaLibre,
  },
  titulo: { flex: 1, minWidth: 0, color: color.grafito },
  tituloSinVolver: { paddingLeft: medida.margen - espacio.s1 },
  cabeceraDetalle: {
    paddingHorizontal: medida.margen,
    paddingTop: espacio.s1,
    paddingBottom: espacio.s1,
  },
  losa: { minHeight: medida.losa, justifyContent: 'center' },
  losaContenido: {
    minHeight: medida.losa,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    paddingHorizontal: medida.margen,
  },
  capaPresion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
  boton: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.s2,
    paddingHorizontal: espacio.s4,
    borderWidth: medida.linea,
    borderRadius: medida.radio,
    backgroundColor: color.papel,
  },
  botonChico: { minHeight: medida.toque, paddingHorizontal: espacio.s3 },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.s2,
    paddingVertical: espacio.s3,
    paddingHorizontal: espacio.s3,
    borderLeftWidth: medida.tapaActiva,
  },
  avisoBanda: { paddingHorizontal: medida.margen, borderLeftWidth: 0 },
  avisoTexto: { flex: 1, minWidth: 0 },
  seccion: { gap: espacio.s3 },
  dato: { flex: 1, minWidth: 0, gap: espacio.s1 },
});
