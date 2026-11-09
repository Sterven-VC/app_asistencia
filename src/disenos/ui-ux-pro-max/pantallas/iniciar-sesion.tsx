import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { VistaIniciarSesion } from '../../contrato';
import { BloqueAccion, Boton, BotonDiscreto } from '../componentes/acciones';
import { Campo } from '../componentes/campos';
import { Aviso, Placa } from '../componentes/estados';
import { Marco, RielLogo } from '../componentes/marco';
import {
  ajustarCartel,
  alto,
  CARTEL_PORTADA,
  cartel,
  color,
  esp,
  icono,
  margen,
  tipo,
} from '../tema';

const PALABRA = 'Asistencia';

export function IniciarSesion(p: VistaIniciarSesion) {
  const { width } = useWindowDimensions();
  const [servidorAbierto, setServidorAbierto] = useState(false);
  const Flecha = servidorAbierto ? ChevronUp : ChevronDown;

  return (
    <Marco>
      <RielLogo />
      <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
        <Text
          accessibilityRole="header"
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[cartel(ajustarCartel(PALABRA, width - margen * 2, CARTEL_PORTADA)), estilos.cartel]}>
          {PALABRA}
        </Text>

        <View style={estilos.campos}>
          <Campo
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect={false}
            cambiar={p.cambiarIdentificador}
            dato
            etiqueta="DNI o usuario admin"
            maxLength={14}
            returnKeyType="next"
            valor={p.identificador}
          />
          <Campo
            autoCapitalize="none"
            autoComplete="current-password"
            cambiar={p.cambiarContrasena}
            etiqueta="Contraseña"
            onSubmitEditing={p.enviar}
            returnKeyType="go"
            secreto
            valor={p.contrasena}
          />
        </View>

        <View style={estilos.enlaces}>
          <BotonDiscreto alPulsar={p.irARegistro} texto="Crear cuenta" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Servidor"
            accessibilityState={{ expanded: servidorAbierto }}
            onPress={() => setServidorAbierto((v) => !v)}
            style={estilos.plegable}>
            <Text style={estilos.plegableTexto}>Servidor</Text>
            <Flecha color={color.tintaMedia} size={icono.base} strokeWidth={icono.trazo} />
          </Pressable>
        </View>

        {servidorAbierto ? (
          <View style={estilos.servidor}>
            <Campo
              autoCapitalize="none"
              autoCorrect={false}
              cambiar={p.cambiarServidor}
              dato
              etiqueta="Dirección del túnel"
              keyboardType="url"
              valor={p.servidor}
            />
            <Boton alPulsar={p.guardarServidor} texto="Guardar servidor" />
            {p.servidorGuardado ? (
              <Placa estado={{ texto: 'Guardado', tono: 'exito', icono: Check }} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {p.error ? <Aviso texto={p.error} /> : null}
      <BloqueAccion alPulsar={p.enviar} cargando={p.enviando} pie texto="Ingresar" />
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuerpo: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: esp[5],
    paddingHorizontal: margen,
    paddingTop: esp[5],
    paddingBottom: esp[3],
  },
  cartel: { color: color.tinta },
  campos: { gap: esp[4] },
  enlaces: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  plegable: {
    minHeight: alto.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[1],
    paddingHorizontal: esp[2],
  },
  plegableTexto: { ...tipo.etiqueta, color: color.tintaMedia },
  servidor: { gap: esp[3] },
});
