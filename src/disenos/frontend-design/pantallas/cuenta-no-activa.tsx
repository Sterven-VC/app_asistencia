import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatearFecha } from '@/utils/fechas';
import type { VistaCuentaNoActiva } from '../../contrato';
import { Boton, Losa } from '../componentes/estructura';
import { Mira } from '../componentes/mira';
import { color, espacio, medida, tipo } from '../tema';
import { conMayuscula } from '../textos';

const logo = require('@/assets/images/logo-time-telemetry.png');

const textos = {
  pendiente: {
    titulo: 'Falta aprobar tu cuenta',
    detalle: 'Una admin debe revisarla. Podrás marcar cuando esté aprobada.',
  },
  pausada: {
    titulo: 'Tu cuenta está en pausa',
    detalle: 'No puedes marcar y tampoco se registran faltas.',
  },
  desactivada: {
    titulo: 'Tu cuenta está desactivada',
    detalle: 'Habla con administración para volver a marcar. Tu historial se conserva.',
  },
};

export function CuentaNoActiva({ motivo, nombre, hasta, actualizar, actualizando, cerrarSesion }: VistaCuentaNoActiva) {
  const margen = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [alto, setAlto] = useState(0);
  const anchoMira = width < 360 ? 40 : medida.miraMedia;
  const texto = textos[motivo];

  return (
    <View style={estilos.raiz}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View
          onLayout={(evento) => setAlto(Math.round(evento.nativeEvent.layout.height))}
          style={estilos.cuerpo}>
          {alto > 0 ? (
            <View style={estilos.miraCapa}>
              <Mira alto={alto} ancho={anchoMira} cifras={false} horaBase={0} pxHora={60} yBase={0} />
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
            <Text numberOfLines={1} style={[tipo.nombre, estilos.apagado]}>
              {nombre}
            </Text>
            <Text accessibilityRole="header" style={[tipo.marca, estilos.tinta]}>
              {texto.titulo}
            </Text>
            {motivo === 'pausada' && hasta ? (
              <View style={estilos.hasta}>
                <Text style={[tipo.etiqueta, estilos.apagado]}>Hasta</Text>
                <Text style={[tipo.lectura, estilos.tinta]}>{conMayuscula(formatearFecha(hasta))}</Text>
              </View>
            ) : null}
            <Text style={[tipo.cuerpo, estilos.apagado]}>{texto.detalle}</Text>
            <View style={estilos.salir}>
              <Boton alPresionar={cerrarSesion} etiqueta="Cerrar sesión" />
            </View>
          </View>
        </View>
        <Losa
          alPresionar={actualizar}
          etiqueta="Actualizar estado"
          ocupada={actualizando && 'Actualizando'}
        />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  contenido: { flexGrow: 1 },
  cuerpo: { flexGrow: 1 },
  miraCapa: { ...StyleSheet.absoluteFill },
  columna: { paddingRight: medida.margen, paddingBottom: espacio.s5, gap: espacio.s2 },
  logo: { width: 150, height: 45, marginBottom: espacio.s6 },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  hasta: { gap: espacio.s1, paddingVertical: espacio.s2 },
  salir: { paddingTop: espacio.s4 },
});
