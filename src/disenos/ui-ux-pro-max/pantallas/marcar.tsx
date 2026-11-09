import * as Haptics from 'expo-haptics';
import { Check, MapPinOff, Smartphone, Upload, Wifi, WifiOff } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { MarcaDelDia, VistaMarcar } from '../../contrato';
import { BotonDiscreto } from '../componentes/acciones';
import { Aviso, Placa, Placas } from '../componentes/estados';
import { Marco, RielLogo } from '../componentes/marco';
import {
  ajustarCartel,
  alto,
  borde,
  CARTEL_MARCAR,
  CARTEL_NOMBRE,
  cartel,
  color,
  esp,
  icono,
  margen,
  movimiento,
  tipo,
} from '../tema';
import { iconoClase, textoClase } from '../textos';

function vibrarAlPulsar() {
  if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

function vibrarAlGuardar() {
  if (Platform.OS !== 'web') {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/** Señal y envíos pendientes siempre a la vista: es lo que decide si la persona confía. */
function Senal({ conectado, pendientes }: { conectado: boolean; pendientes: number }) {
  const IconoSenal = conectado ? Wifi : WifiOff;
  const hayPendientes = pendientes > 0;
  return (
    <View style={estilos.senal}>
      <View style={[estilos.celdaSenal, !conectado && estilos.celdaAviso]}>
        <IconoSenal color={color.tinta} size={icono.base} strokeWidth={icono.trazoCartel} />
        <Text numberOfLines={1} style={estilos.textoCelda}>
          {conectado ? 'Con señal' : 'Sin señal'}
        </Text>
      </View>
      <View style={[estilos.celdaSenal, estilos.celdaRegla, hayPendientes && estilos.celdaAviso]}>
        <Upload color={color.tinta} size={icono.base} strokeWidth={icono.trazoCartel} />
        <Text numberOfLines={1} style={estilos.textoCelda}>
          <Text style={estilos.numeroCelda}>{pendientes}</Text> por enviar
        </Text>
      </View>
    </View>
  );
}

function FilaMarca({ marca }: { marca: MarcaDelDia }) {
  return (
    <View style={estilos.marca}>
      <Text style={estilos.horaMarca}>{marca.hora}</Text>
      <View style={estilos.detalleMarca}>
        <Text style={estilos.claseMarca}>{textoClase[marca.clase]}</Text>
        <Placas>
          {marca.enviada ? (
            <Placa estado={{ texto: 'Enviada', tono: 'exito', icono: Check }} />
          ) : (
            <Placa estado={{ texto: 'En el teléfono', tono: 'aviso', icono: Smartphone }} />
          )}
          {marca.sinUbicacion ? (
            <Placa estado={{ texto: 'Sin ubicación', tono: 'aviso', icono: MapPinOff }} />
          ) : null}
        </Placas>
      </View>
    </View>
  );
}

function Palabra({ texto, disponible }: { texto: string; disponible: number }) {
  return (
    <Animated.Text
      entering={FadeInDown.duration(movimiento.corta)}
      key={texto}
      adjustsFontSizeToFit
      numberOfLines={1}
      style={[cartel(ajustarCartel(texto, disponible, CARTEL_MARCAR)), estilos.palabra]}>
      {texto}
    </Animated.Text>
  );
}

/** Todo el bloque es el botón. La palabra enorme dice qué toca: no hace falta otro título. */
function BloqueMarcar({ p, disponible }: { p: VistaMarcar; disponible: number }) {
  if (p.paso !== 'inactivo') {
    const ubicando = p.paso === 'ubicando';
    return (
      <View
        accessibilityLiveRegion="assertive"
        accessibilityLabel={ubicando ? 'Ubicando, paso 1 de 2' : 'Guardando, paso 2 de 2'}
        accessibilityRole="progressbar"
        accessible
        style={[estilos.bloque, estilos.bloqueOcupado]}>
        <Text style={estilos.antetitulo}>{ubicando ? 'Paso 1 de 2' : 'Paso 2 de 2'}</Text>
        <View style={estilos.pasos}>
          <Palabra disponible={disponible} texto={ubicando ? 'Ubicando' : 'Guardando'} />
          <View style={estilos.segmentos}>
            <View style={[estilos.segmento, estilos.segmentoLleno]} />
            <View style={[estilos.segmento, !ubicando && estilos.segmentoLleno]} />
          </View>
        </View>
      </View>
    );
  }

  if (p.accion === 'completo') {
    return (
      <View
        accessibilityLabel="Listo. Nada más por marcar hoy"
        accessible
        style={[estilos.bloque, estilos.bloqueListo]}>
        <View style={estilos.bloqueArriba}>
          <Text style={estilos.antetitulo}>Nada más por marcar hoy</Text>
          <Check color={color.sobreColor} size={icono.cartel} strokeWidth={icono.trazoCartel} />
        </View>
        <Palabra disponible={disponible} texto="Listo" />
      </View>
    );
  }

  const Icono = iconoClase[p.accion];
  const palabra = textoClase[p.accion].toLowerCase();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Marcar ${palabra}`}
      onPress={() => {
        vibrarAlPulsar();
        p.marcar();
      }}
      style={[estilos.bloque, estilos.bloqueMarca]}>
      {({ pressed }) => (
        <>
          <View style={estilos.bloqueArriba}>
            <Text style={estilos.antetitulo}>Marcar</Text>
            <Icono color={color.sobreColor} size={icono.cartel} strokeWidth={icono.trazoCartel} />
          </View>
          <Palabra disponible={disponible} texto={palabra} />
          {pressed ? <View pointerEvents="none" style={estilos.capaPresion} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Marcar(p: VistaMarcar) {
  const { width } = useWindowDimensions();
  const disponible = width - margen * 2;
  const total = p.marcasHoy.length;
  const totalPrevio = useRef(total);

  useEffect(() => {
    if (total > totalPrevio.current) vibrarAlGuardar();
    totalPrevio.current = total;
  }, [total]);

  const nota = p.conectado
    ? null
    : p.accion === 'completo'
      ? 'Se envía sola cuando vuelva la señal'
      : 'Marca igual: se guarda aquí y se envía sola';

  return (
    <Marco>
      <ScrollView bounces={false} contentContainerStyle={estilos.pagina}>
        <RielLogo />
        <View style={estilos.quien}>
          <Text
            accessibilityRole="header"
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[cartel(ajustarCartel(p.nombre, disponible, CARTEL_NOMBRE)), estilos.nombre]}>
            {p.nombre}
          </Text>
          <View style={estilos.fechaFila}>
            <Text style={estilos.fecha}>{p.fecha}</Text>
            <BotonDiscreto alPulsar={p.cerrarSesion} texto="Cerrar sesión" />
          </View>
        </View>

        <Senal conectado={p.conectado} pendientes={p.pendientesEnvio} />
        {nota ? <Text style={estilos.nota}>{nota}</Text> : null}

        {p.marcasHoy.map((marca) => (
          <FilaMarca key={marca.id} marca={marca} />
        ))}

        {p.error ? <Aviso texto={p.error} /> : null}
        <BloqueMarcar disponible={disponible} p={p} />
      </ScrollView>
    </Marco>
  );
}

const bloqueBase = { flexGrow: 1, minHeight: alto.bloqueMarcar } as const;

const estilos = StyleSheet.create({
  pagina: { flexGrow: 1 },
  quien: { paddingHorizontal: margen },
  nombre: { color: color.tinta },
  fechaFila: {
    minHeight: alto.toque,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: esp[2],
  },
  fecha: { ...tipo.cuerpo, color: color.tintaMedia, flex: 1 },
  senal: {
    flexDirection: 'row',
    borderTopWidth: borde.regla,
    borderBottomWidth: borde.regla,
    borderColor: color.tinta,
  },
  celdaSenal: {
    flex: 1,
    minWidth: 0,
    minHeight: alto.celda,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[2],
    paddingHorizontal: margen,
  },
  celdaRegla: { borderLeftWidth: borde.regla, borderLeftColor: color.tinta },
  celdaAviso: { backgroundColor: color.aviso },
  textoCelda: { ...tipo.etiqueta, color: color.tinta, flexShrink: 1 },
  numeroCelda: { ...tipo.datoFuerte, color: color.tinta },
  nota: {
    ...tipo.meta,
    color: color.tintaMedia,
    paddingHorizontal: margen,
    paddingTop: esp[2],
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[3],
    paddingHorizontal: margen,
    paddingVertical: esp[3],
  },
  horaMarca: { ...tipo.hora, color: color.tinta },
  detalleMarca: { flex: 1, minWidth: 0, gap: esp[1] },
  claseMarca: { ...tipo.cuerpoFuerte, color: color.tinta },
  bloque: { ...bloqueBase, justifyContent: 'space-between', padding: margen },
  bloqueMarca: { backgroundColor: color.marcaFuerte },
  bloqueOcupado: { backgroundColor: color.tinta },
  bloqueListo: { backgroundColor: color.exito },
  bloqueArriba: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: esp[2],
  },
  antetitulo: { ...tipo.antetitulo, color: color.sobreColor, flexShrink: 1 },
  palabra: { color: color.sobreColor },
  pasos: { gap: esp[3] },
  segmentos: { flexDirection: 'row', gap: esp[1] },
  segmento: { flex: 1, height: borde.barra, backgroundColor: color.tintaMedia },
  segmentoLleno: { backgroundColor: color.marca },
  capaPresion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
});
