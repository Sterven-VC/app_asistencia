import { Ban, Hourglass, type LucideIcon, Pause, RotateCw } from 'lucide-react-native';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { formatearFecha } from '@/utils/fechas';
import type { VistaCuentaNoActiva } from '../../contrato';
import { BloqueAccion, BotonDiscreto } from '../componentes/acciones';
import { Marco, RielLogo } from '../componentes/marco';
import {
  ajustarCartel,
  CARTEL_PORTADA,
  cartel,
  color,
  esp,
  icono,
  margen,
  tipo,
} from '../tema';

const estados: Record<VistaCuentaNoActiva['motivo'], { palabra: string; icono: LucideIcon }> = {
  pendiente: { palabra: 'En revisión', icono: Hourglass },
  pausada: { palabra: 'En pausa', icono: Pause },
  desactivada: { palabra: 'Desactivada', icono: Ban },
};

function detalle({ motivo, nombre, hasta }: VistaCuentaNoActiva): string {
  if (motivo === 'pendiente') return `${nombre}, una admin debe aprobar tu cuenta.`;
  if (motivo === 'desactivada') return `${nombre}, habla con administración para reactivarla.`;
  return hasta
    ? `${nombre}, tu pausa termina el ${formatearFecha(hasta).replace(/\.$/, '')}.`
    : `${nombre}, habla con administración para saber hasta cuándo.`;
}

export function CuentaNoActiva(p: VistaCuentaNoActiva) {
  const { width } = useWindowDimensions();
  const { palabra, icono: Icono } = estados[p.motivo];

  return (
    <Marco>
      <RielLogo />
      <View style={estilos.cuerpo}>
        <Icono color={color.tinta} size={icono.cartel} strokeWidth={icono.trazoCartel} />
        <Text
          accessibilityRole="header"
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[cartel(ajustarCartel(palabra, width - margen * 2, CARTEL_PORTADA)), estilos.tinta]}>
          {palabra}
        </Text>
        <Text style={estilos.detalle}>{detalle(p)}</Text>
        <BotonDiscreto alPulsar={p.cerrarSesion} estilo={estilos.cerrar} texto="Cerrar sesión" />
      </View>
      <BloqueAccion
        alPulsar={p.actualizar}
        cargando={p.actualizando}
        icono={RotateCw}
        pie
        texto="Actualizar"
      />
    </Marco>
  );
}

const estilos = StyleSheet.create({
  cuerpo: { flex: 1, justifyContent: 'flex-end', gap: esp[2], padding: margen },
  tinta: { color: color.tinta },
  detalle: { ...tipo.cuerpo, color: color.tintaMedia },
  cerrar: { alignSelf: 'flex-start', marginLeft: -esp[2], marginTop: esp[3] },
});
