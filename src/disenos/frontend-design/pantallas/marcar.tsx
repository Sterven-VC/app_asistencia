import * as Haptics from 'expo-haptics';
import {
  Check,
  CloudUpload,
  LogOut,
  MapPinOff,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MarcaDelDia, VistaMarcar } from '../../contrato';
import { Aviso, Boton, BotonIcono, Losa } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { aHoras, Mira, Reticula } from '../componentes/mira';
import { motorNativo, useMovimientoReducido } from '../componentes/movimiento';
import { color, espacio, medida, movimiento, tipo, tono } from '../tema';
import { conMayuscula, plural, textoClase } from '../textos';

const logo = require('@/assets/images/logo-time-telemetry.png');

const HORA_INICIO = 6;
const HORA_FIN = 20;
const ALTO_LECTURA = 54;
const ALTO_LECTURA_SIN_UBICACION = 76;
const SEPARACION = 8;
const AIRE_INFERIOR = 8;

type Ubicada = { marca: MarcaDelDia; y: number; top: number; alto: number };

function altoDe(marca: MarcaDelDia) {
  return marca.sinUbicacion ? ALTO_LECTURA_SIN_UBICACION : ALTO_LECTURA;
}

/** Reparte las lecturas sin que se monten. Si no entran todas, quedan las últimas. */
function ubicarLecturas(marcas: { marca: MarcaDelDia; y: number }[], techo: number, piso: number) {
  const ordenadas = [...marcas].sort((a, b) => a.y - b.y);
  const visibles: Ubicada[] = [];
  let libre = piso - techo;

  for (let indice = ordenadas.length - 1; indice >= 0; indice -= 1) {
    const alto = altoDe(ordenadas[indice].marca);
    if (libre < alto) break;
    libre -= alto + SEPARACION;
    visibles.unshift({ ...ordenadas[indice], top: 0, alto });
  }

  let cursor = techo;
  for (const lectura of visibles) {
    lectura.top = Math.max(lectura.y - ALTO_LECTURA / 2, cursor);
    cursor = lectura.top + lectura.alto + SEPARACION;
  }

  let limite = piso;
  for (let indice = visibles.length - 1; indice >= 0; indice -= 1) {
    const lectura = visibles[indice];
    lectura.top = Math.min(lectura.top, limite - lectura.alto);
    limite = lectura.top - SEPARACION;
  }

  return visibles;
}

function Lectura({ marca, top, izquierda, nueva }: { marca: MarcaDelDia; top: number; izquierda: number; nueva: boolean }) {
  const { width } = useWindowDimensions();
  const reducido = useMovimientoReducido();
  const llegada = useRef(new Animated.Value(nueva ? 0 : 1)).current;

  useEffect(() => {
    if (!nueva) return;
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.timing(llegada, {
      toValue: 1,
      duration: reducido ? 0 : movimiento.media,
      easing: movimiento.entrada,
      useNativeDriver: motorNativo,
    }).start();
  }, [llegada, nueva, reducido]);

  const desplazamiento = llegada.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });
  const Icono = marca.enviada ? Check : Smartphone;

  return (
    <Animated.View
      accessible
      accessibilityLabel={`${textoClase[marca.clase]} a las ${marca.hora}. ${
        marca.enviada ? 'Enviada' : 'Guardada en tu teléfono, por enviar'
      }${marca.sinUbicacion ? '. Sin ubicación' : ''}`}
      style={[
        estilos.lectura,
        { top, left: izquierda, opacity: llegada, transform: [{ translateX: desplazamiento }] },
      ]}>
      <Text maxFontSizeMultiplier={1.1} style={[width < 360 ? tipo.lecturaAngosta : tipo.lectura, estilos.tinta]}>
        {marca.hora}
      </Text>
      <View style={estilos.lecturaDetalle}>
        <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[tipo.nombre, estilos.tinta]}>
          {textoClase[marca.clase]}
        </Text>
        <View style={estilos.lecturaLinea}>
          <Icono
            color={marca.enviada ? tono.exito.texto : color.grafito}
            size={medida.iconoChico}
            strokeWidth={medida.trazoIcono}
          />
          <Text
            maxFontSizeMultiplier={1.2}
            numberOfLines={1}
            style={[tipo.sello, marca.enviada ? estilos.enviada : estilos.tinta]}>
            {marca.enviada ? 'Enviada' : 'Guardada, por enviar'}
          </Text>
        </View>
        {marca.sinUbicacion ? (
          <View style={estilos.lecturaLinea}>
            <MapPinOff
              color={tono.aviso.texto}
              size={medida.iconoChico}
              strokeWidth={medida.trazoIcono}
            />
            <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[tipo.sello, estilos.sinUbicacion]}>
              Sin ubicación
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** La retícula recorre la mira mientras se busca la ubicación. */
function Barrido({ desde, hasta, ancho }: { desde: number; hasta: number; ancho: number }) {
  const reducido = useMovimientoReducido();
  const avance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducido) return;
    const vaiven = Animated.loop(
      Animated.sequence([
        Animated.timing(avance, {
          toValue: 1,
          duration: movimiento.barrido,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: motorNativo,
        }),
        Animated.timing(avance, {
          toValue: 0,
          duration: movimiento.barrido,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: motorNativo,
        }),
      ]),
    );
    vaiven.start();
    return () => vaiven.stop();
  }, [avance, reducido]);

  const y = avance.interpolate({ inputRange: [0, 1], outputRange: [desde, hasta] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[estilos.hilo, { width: ancho, transform: [{ translateY: y }] }]}
    />
  );
}

function Pasos({ actual }: { actual: 1 | 2 }) {
  return (
    <View
      accessibilityLabel={`Paso ${actual} de 2`}
      accessibilityRole="progressbar"
      style={estilos.pasos}>
      <View style={[estilos.paso, estilos.pasoHecho]} />
      <View style={[estilos.paso, actual === 2 && estilos.pasoHecho]} />
    </View>
  );
}

function Estado({ conectado, pendientes, hayMarcas }: { conectado: boolean; pendientes: number; hayMarcas: boolean }) {
  const Senal = conectado ? Wifi : WifiOff;
  const texto = conectado ? estilos.tinta : estilos.tintaSobreSenal;

  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      style={[estilos.estado, !conectado && estilos.estadoSinSenal]}>
      <View style={estilos.estadoParte}>
        <Senal color={color.grafito} size={22} strokeWidth={medida.trazoIcono} />
        <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[tipo.nombre, texto]}>
          {conectado ? 'Con señal' : 'Sin señal'}
        </Text>
      </View>
      {pendientes > 0 ? (
        <View style={estilos.estadoParte}>
          <CloudUpload color={color.grafito} size={22} strokeWidth={medida.trazoIcono} />
          <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[tipo.nombre, texto]}>
            {`${pendientes} por enviar`}
          </Text>
        </View>
      ) : hayMarcas ? (
        <View style={estilos.estadoParte}>
          <Check color={color.grafito} size={22} strokeWidth={medida.trazoIcono} />
          <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={[tipo.nombre, texto]}>
            Todo enviado
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function Marcar(props: VistaMarcar) {
  const { accion, marcar, marcasHoy, paso, pendientesEnvio, conectado, error, nombre, fecha, cerrarSesion } = props;
  const margen = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [altoZona, setAltoZona] = useState(0);
  const [altoCabecera, setAltoCabecera] = useState(0);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const yaVistas = useRef(new Set(marcasHoy.map((marca) => marca.id))).current;

  const compacto = height < 640;
  const anchoMira = width < 360 ? medida.miraMedia : medida.miraAncha;
  const izquierda = anchoMira + medida.margen;
  const ocupado = paso !== 'inactivo';
  const completo = accion === 'completo';

  const horas = marcasHoy
    .map((marca) => aHoras(marca.hora))
    .filter((hora): hora is number => hora !== null);
  const inicio = Math.floor(Math.min(HORA_INICIO, ...horas));
  const fin = Math.ceil(Math.max(HORA_FIN, ...horas.map((hora) => hora + 0.5)));
  const pxHora = Math.max((altoZona - altoCabecera - AIRE_INFERIOR) / (fin - inicio), 1);
  const yDe = (hora: number) => altoCabecera + (hora - inicio) * pxHora;

  const entrada = marcasHoy.find((marca) => marca.clase === 'entrada');
  const salida = [...marcasHoy].reverse().find((marca) => marca.clase === 'salida');
  const desde = entrada ? aHoras(entrada.hora) : null;
  const hasta = salida ? aHoras(salida.hora) : null;
  const tramo = desde !== null && hasta !== null && hasta > desde ? { desde, hasta } : null;

  const conHora = useMemo(
    () =>
      marcasHoy.flatMap((marca) => {
        const hora = aHoras(marca.hora);
        return hora === null ? [] : [{ marca, hora }];
      }),
    [marcasHoy],
  );
  const listo = altoZona > 0 && altoCabecera > 0;
  const lecturas = listo
    ? ubicarLecturas(
        conHora.map(({ marca, hora }) => ({ marca, y: yDe(hora) })),
        altoCabecera,
        altoZona - AIRE_INFERIOR,
      )
    : [];

  const altoLosa = compacto ? medida.losaMarcarCompacta : medida.losaMarcar;
  const letraAccion = compacto ? tipo.accionCompacta : tipo.accion;

  return (
    <View style={estilos.raiz}>
      <View
        onLayout={(evento) => setAltoZona(Math.round(evento.nativeEvent.layout.height))}
        style={estilos.zona}>
        {listo ? (
          <View style={estilos.miraCapa}>
            <Mira
              alto={altoZona}
              ancho={anchoMira}
              horaBase={inicio}
              pxHora={pxHora}
              tramo={tramo}
              yBase={altoCabecera}
            />
            <View style={[estilos.borde, { left: anchoMira }]} />
          </View>
        ) : null}

        <View
          onLayout={(evento) => setAltoCabecera(Math.round(evento.nativeEvent.layout.height))}
          style={[estilos.cabecera, { paddingTop: margen.top + espacio.s2, marginLeft: izquierda }]}>
          <Image
            accessibilityLabel="Time Telemetry"
            resizeMode="contain"
            source={logo}
            style={compacto ? estilos.logoCompacto : estilos.logo}
          />
          <View style={estilos.quien}>
            <View style={estilos.quienTexto}>
              <Text
                accessibilityRole="header"
                maxFontSizeMultiplier={1.2}
                numberOfLines={1}
                style={[compacto ? tipo.titulo : tipo.marca, estilos.tinta]}>
                {nombre}
              </Text>
              <Text numberOfLines={1} style={[tipo.fuerte, estilos.apagado]}>
                {conMayuscula(fecha)}
              </Text>
            </View>
            <BotonIcono
              alPresionar={() => setConfirmarSalida(true)}
              etiqueta="Cerrar sesión"
              icono={LogOut}
            />
          </View>
        </View>

        {conHora.map(({ marca, hora }) => (
          <View
            key={marca.id}
            pointerEvents="none"
            style={[estilos.hilo, { top: yDe(hora) - 1.5, width: anchoMira + 12 }]}
          />
        ))}

        {lecturas.map((lectura) => (
          <Lectura
            izquierda={izquierda}
            key={lectura.marca.id}
            marca={lectura.marca}
            nueva={!yaVistas.has(lectura.marca.id)}
            top={lectura.top}
          />
        ))}

        {listo && paso === 'ubicando' ? (
          <Barrido desde={altoCabecera} hasta={altoZona - AIRE_INFERIOR} ancho={width} />
        ) : null}
      </View>

      {error ? <Aviso banda mensaje={error} /> : null}
      <Estado conectado={conectado} hayMarcas={marcasHoy.length > 0} pendientes={pendientesEnvio} />

      {completo ? (
        <View style={[estilos.completo, { minHeight: altoLosa * 0.62 }]}>
          <Check color={tono.exito.texto} size={36} strokeWidth={2.75} />
          <Text maxFontSizeMultiplier={1.2} style={[tipo.titulo, estilos.completoTexto]}>
            Nada más por marcar hoy
          </Text>
        </View>
      ) : (
        <Pressable
          accessibilityLabel={
            paso === 'ubicando'
              ? 'Ubicando, paso 1 de 2'
              : paso === 'guardando'
                ? 'Guardando, paso 2 de 2'
                : `Marcar ${accion}`
          }
          accessibilityRole="button"
          accessibilityState={{ busy: ocupado, disabled: ocupado }}
          disabled={ocupado}
          onPress={marcar}
          style={[estilos.losa, { height: altoLosa }]}>
          {({ pressed }) => (
            <>
              <View style={estilos.losaTexto}>
                {ocupado ? (
                  <>
                    <Text maxFontSizeMultiplier={1.1} numberOfLines={1} style={[letraAccion, estilos.sobreAccion]}>
                      {paso === 'ubicando' ? 'Ubicando' : 'Guardando'}
                    </Text>
                    <Pasos actual={paso === 'ubicando' ? 1 : 2} />
                  </>
                ) : compacto ? (
                  <Text maxFontSizeMultiplier={1.1} numberOfLines={2} style={[letraAccion, estilos.sobreAccion]}>
                    {`Marcar\n${accion}`}
                  </Text>
                ) : (
                  <>
                    <Text maxFontSizeMultiplier={1.1} numberOfLines={1} style={[letraAccion, estilos.sobreAccion]}>
                      Marcar
                    </Text>
                    <Text maxFontSizeMultiplier={1.1} numberOfLines={1} style={[letraAccion, estilos.sobreAccion]}>
                      {accion}
                    </Text>
                  </>
                )}
              </View>
              <Reticula tamano={compacto ? 64 : 92} tinta={color.sobreAccion} />
              {pressed ? <View pointerEvents="none" style={estilos.capaPresion} /> : null}
            </>
          )}
        </Pressable>
      )}

      <Hoja
        cerrar={() => setConfirmarSalida(false)}
        pie={
          <>
            <Losa alPie={false} alPresionar={cerrarSesion} etiqueta="Cerrar sesión" />
            <Boton alPresionar={() => setConfirmarSalida(false)} etiqueta="Seguir aquí" />
          </>
        }
        titulo="Cerrar sesión"
        visible={confirmarSalida}>
        {pendientesEnvio > 0 ? (
          <Text style={[tipo.cuerpo, estilos.tinta]}>
            {`Tienes ${plural(pendientesEnvio, 'marcación', 'marcaciones')} por enviar.`}
          </Text>
        ) : null}
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  zona: { flex: 1, overflow: 'hidden' },
  miraCapa: { ...StyleSheet.absoluteFill },
  borde: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: medida.linea,
    backgroundColor: color.grafito,
  },
  cabecera: { paddingRight: espacio.s1, paddingBottom: espacio.s3 },
  logo: { width: 133, height: 40, marginBottom: espacio.s3 },
  logoCompacto: { width: 110, height: 33, marginBottom: espacio.s2 },
  quien: { flexDirection: 'row', alignItems: 'center' },
  quienTexto: { flex: 1, minWidth: 0 },
  tinta: { color: color.grafito },
  tintaSobreSenal: { color: color.grafito },
  apagado: { color: color.plomo },
  sobreAccion: { color: color.sobreAccion },
  enviada: { color: tono.exito.texto },
  sinUbicacion: { color: tono.aviso.texto },
  hilo: {
    position: 'absolute',
    left: 0,
    height: medida.lineaFuerte,
    backgroundColor: color.reticula,
  },
  lectura: {
    position: 'absolute',
    right: espacio.s1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacio.s3,
  },
  lecturaDetalle: { flex: 1, minWidth: 0, paddingTop: 2 },
  lecturaLinea: { flexDirection: 'row', alignItems: 'center', gap: espacio.s1 },
  estado: {
    minHeight: medida.bandaEstado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacio.s3,
    paddingHorizontal: medida.margen,
    backgroundColor: color.papel,
    borderTopColor: color.grafito,
    borderTopWidth: medida.linea,
  },
  estadoSinSenal: { backgroundColor: color.senal },
  estadoParte: { flexDirection: 'row', alignItems: 'center', gap: espacio.s2, flexShrink: 1 },
  losa: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacio.s3,
    paddingHorizontal: medida.margen,
    backgroundColor: color.accion,
  },
  losaTexto: { flex: 1, minWidth: 0, gap: espacio.s1 },
  capaPresion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
  pasos: { flexDirection: 'row', gap: espacio.s2, paddingTop: espacio.s2 },
  paso: {
    width: 56,
    height: 8,
    borderWidth: medida.linea,
    borderColor: color.sobreAccion,
  },
  pasoHecho: { backgroundColor: color.sobreAccion },
  completo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    paddingHorizontal: medida.margen,
    paddingVertical: espacio.s4,
    backgroundColor: tono.exito.fondo,
    borderTopColor: tono.exito.borde,
    borderTopWidth: medida.tapaActiva,
  },
  completoTexto: { flex: 1, minWidth: 0, color: tono.exito.texto },
});
