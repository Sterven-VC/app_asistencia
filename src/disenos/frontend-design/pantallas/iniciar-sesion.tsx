import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Server } from 'lucide-react-native';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VistaIniciarSesion } from '../../contrato';
import { Campo } from '../componentes/campos';
import { Aviso, Boton, BotonIcono, Losa } from '../componentes/estructura';
import { Mira } from '../componentes/mira';
import { color, espacio, medida, tipo, tono } from '../tema';

const logo = require('@/assets/images/logo-time-telemetry.png');

const PX_HORA = 60;

export function IniciarSesion(props: VistaIniciarSesion) {
  const margen = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [verContrasena, setVerContrasena] = useState(false);
  const [servidorAbierto, setServidorAbierto] = useState(false);
  const [altoCuerpo, setAltoCuerpo] = useState(0);

  const anchoMira = width < 360 ? 40 : medida.miraMedia;
  const Plegador = servidorAbierto ? ChevronUp : ChevronDown;

  return (
    <KeyboardAvoidingView behavior="padding" style={estilos.raiz}>
      <ScrollView
        bounces={false}
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled">
        <View
          onLayout={(evento) => setAltoCuerpo(Math.round(evento.nativeEvent.layout.height))}
          style={estilos.cuerpo}>
          {altoCuerpo > 0 ? (
            <View style={estilos.miraCapa}>
              <Mira
                alto={altoCuerpo}
                ancho={anchoMira}
                cifras={false}
                horaBase={0}
                pxHora={PX_HORA}
                tramo={{ desde: 0, hasta: 99 }}
                yBase={0}
              />
            </View>
          ) : null}

          <View
            style={[
              estilos.columna,
              { marginLeft: anchoMira + medida.margen, paddingTop: margen.top + espacio.s3 },
            ]}>
            <Image
              accessibilityLabel="Time Telemetry"
              resizeMode="contain"
              source={logo}
              style={estilos.logo}
            />
            <Text accessibilityRole="header" style={[tipo.marca, estilos.tinta]}>
              Asistencia
            </Text>

            <View style={estilos.campos}>
              <Campo
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect={false}
                etiqueta="DNI o usuario admin"
                maxLength={14}
                onChangeText={props.cambiarIdentificador}
                returnKeyType="next"
                value={props.identificador}
              />
              <Campo
                autoCapitalize="none"
                autoComplete="current-password"
                derecha={
                  <BotonIcono
                    alPresionar={() => setVerContrasena((actual) => !actual)}
                    etiqueta={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    icono={verContrasena ? EyeOff : Eye}
                  />
                }
                etiqueta="Contraseña"
                onChangeText={props.cambiarContrasena}
                onSubmitEditing={props.enviar}
                returnKeyType="go"
                secureTextEntry={!verContrasena}
                value={props.contrasena}
              />
              {props.error ? <Aviso mensaje={props.error} /> : null}
            </View>

            <View style={estilos.secundarias}>
              <Boton alPresionar={props.irARegistro} etiqueta="Crear cuenta" />

              <Pressable
                accessibilityLabel="Servidor"
                accessibilityRole="button"
                accessibilityState={{ expanded: servidorAbierto }}
                onPress={() => setServidorAbierto((actual) => !actual)}
                style={estilos.plegador}>
                <Server color={color.plomo} size={medida.icono} strokeWidth={medida.trazoIcono} />
                <Text style={[tipo.nombre, estilos.apagado, estilos.plegadorTexto]}>Servidor</Text>
                <Plegador color={color.plomo} size={medida.icono} strokeWidth={medida.trazoIcono} />
              </Pressable>

              {servidorAbierto ? (
                <View style={estilos.servidor}>
                  <Campo
                    autoCapitalize="none"
                    autoCorrect={false}
                    etiqueta="Dirección del túnel"
                    inputMode="url"
                    keyboardType="url"
                    onChangeText={props.cambiarServidor}
                    value={props.servidor}
                  />
                  <Boton alPresionar={props.guardarServidor} chico etiqueta="Guardar dirección" />
                  {props.servidorGuardado ? (
                    <View style={estilos.guardado}>
                      <Check color={tono.exito.texto} size={medida.iconoChico} strokeWidth={medida.trazoIcono} />
                      <Text style={[tipo.etiqueta, estilos.guardadoTexto]}>Dirección guardada</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <Losa alPresionar={props.enviar} etiqueta="Entrar" ocupada={props.enviando && 'Entrando'} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  contenido: { flexGrow: 1 },
  cuerpo: { flexGrow: 1 },
  miraCapa: { ...StyleSheet.absoluteFill },
  columna: { paddingRight: medida.margen, paddingBottom: espacio.s5 },
  logo: { width: 150, height: 45, marginBottom: espacio.s6 },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  campos: { gap: espacio.s4, paddingTop: espacio.s5 },
  secundarias: { gap: espacio.s2, paddingTop: espacio.s5 },
  plegador: {
    minHeight: medida.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s2,
  },
  plegadorTexto: { flex: 1 },
  servidor: { gap: espacio.s3 },
  guardado: { flexDirection: 'row', alignItems: 'center', gap: espacio.s1 },
  guardadoTexto: { color: tono.exito.texto },
});
