import { Check, ChevronDown, MapPin, MapPinOff, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatearFecha, formatearHora, formatearMinutos } from '@/utils/fechas';
import type { VistaAdminDetalleMarcacion } from '../../contrato';
import { BloqueAccion, Boton } from '../componentes/acciones';
import { Campo, Opcion } from '../componentes/campos';
import { Aviso, Esqueleto, Placa, Placas, Vacio } from '../componentes/estados';
import { Hoja } from '../componentes/hoja';
import { Dato, ParDatos, Separador } from '../componentes/lista';
import { Marco, Regla, Riel, RielVolver } from '../componentes/marco';
import { alto, borde, color, esp, icono, margen, tipo } from '../tema';
import { estadoValidacion, observacion, textoClase, textoSinUbicacion, textoTipo, tipos } from '../textos';

/** La hora manda; la fecha va debajo, para que el par se compare de un vistazo. */
function Hora({ etiqueta, iso }: { etiqueta: string; iso: string }) {
  return (
    <View style={estilos.horaPar}>
      <Text style={estilos.meta}>{etiqueta}</Text>
      <Text style={estilos.horaMedia}>{formatearHora(iso)}</Text>
      <Text style={estilos.meta}>{formatearFecha(iso)}</Text>
    </View>
  );
}

export function AdminDetalleMarcacion(p: VistaAdminDetalleMarcacion) {
  const [hoja, setHoja] = useState<'proyecto' | 'rechazo' | null>(null);
  const seguro = useSafeAreaInsets();
  const m = p.marcacion;

  if (!m) {
    return (
      <Marco>
        <RielVolver volver={p.volver} />
        <Riel titulo="Marcación" />
        <Regla />
        {p.cargando ? <Esqueleto filas={3} /> : <Vacio texto={p.error ?? 'No se encontró la marcación'} />}
      </Marco>
    );
  }

  const proyecto = p.proyectos.find((opcion) => opcion.id === p.proyectoId);
  const faltaTipo = p.pideTipo && (!p.tipo || (p.tipo === 'proyecto' && !p.proyectoId));
  const tieneUbicacion = m.latitud !== null && m.longitud !== null;

  return (
    <Marco>
      <RielVolver volver={p.volver} />
      <ScrollView contentContainerStyle={{ paddingBottom: esp[5] + seguro.bottom }} keyboardShouldPersistTaps="handled">
        <Riel titulo={textoClase[m.clase]} />
        <Regla />
        <View style={estilos.bloque}>
          <Text style={estilos.persona}>{m.persona}</Text>
          <Text style={estilos.hora}>{formatearHora(m.hora_oficial)}</Text>
          <Text style={estilos.meta}>{formatearFecha(m.fecha_laboral)} · Hora oficial</Text>
          <Placas>
            <Placa estado={estadoValidacion[m.estado]} />
            {m.automatica ? <Placa estado={{ texto: 'Automática', tono: 'neutro', icono: Check }} /> : null}
            {m.sin_conexion ? <Placa estado={{ texto: 'Sin señal', tono: 'neutro', icono: WifiOff }} /> : null}
            {m.observaciones.map((codigo) => <Placa estado={observacion[codigo]} key={codigo} />)}
          </Placas>
        </View>
        {p.error ? <Aviso texto={p.error} /> : null}
        <Separador />
        <View style={estilos.bloque}>
          {m.clase === 'salida' ? (
            <View style={estilos.extraBloque}>
              <Text style={estilos.meta}>Tiempo extra</Text>
              <Text style={estilos.extra}>
                {m.minutos_extra > 0 ? `+${formatearMinutos(m.minutos_extra)}` : formatearMinutos(0)}
              </Text>
              {p.puedeValidar ? <Text style={estilos.meta}>Aprobar lo suma. Rechazar lo quita.</Text> : null}
            </View>
          ) : null}
          {m.sin_conexion ? (
            <>
              <ParDatos>
                <Hora etiqueta="Hora del teléfono" iso={m.hora_telefono} />
                <Hora etiqueta="Hora de recepción" iso={m.hora_recepcion} />
              </ParDatos>
              {m.desfase_segundos !== 0 ? <Dato etiqueta="Desfase" valor={`${m.desfase_segundos} s`} /> : null}
            </>
          ) : null}
          {tieneUbicacion ? (
            <>
              <Dato etiqueta="Coordenadas" valor={`${m.latitud}, ${m.longitud}`} />
              {m.precision_m !== null ? <Dato etiqueta="Precisión" valor={`${m.precision_m} m`} /> : null}
              <Boton alPulsar={p.abrirMapa} icono={MapPin} texto="Abrir mapa" />
            </>
          ) : (
            <View style={estilos.sinUbicacion}>
              <MapPinOff color={color.tinta} size={icono.base} strokeWidth={icono.trazo} />
              <Text style={estilos.nombre}>
                {m.motivo_sin_ubicacion ? textoSinUbicacion[m.motivo_sin_ubicacion] : 'Sin ubicación'}
              </Text>
            </View>
          )}
          {!p.puedeValidar && m.tipo ? <Dato etiqueta="Tipo" valor={m.proyecto ?? textoTipo[m.tipo]} /> : null}
          {m.motivo ? <Dato etiqueta="Motivo del rechazo" valor={m.motivo} /> : null}
        </View>
        {p.puedeValidar && p.pideTipo ? (
          <>
            <Regla />
            <View style={estilos.bloque}>
              <Text accessibilityRole="header" style={estilos.nombre}>Tipo</Text>
              <View accessibilityRole="radiogroup" style={estilos.opciones}>
                {tipos.map(({ valor, texto, icono: Icono }) => (
                  <Opcion alPulsar={() => p.cambiarTipo(valor)} elegida={p.tipo === valor} icono={Icono} key={valor} texto={texto} vertical />
                ))}
              </View>
              {p.tipo === 'proyecto' ? (
                <Boton alPulsar={() => setHoja('proyecto')} icono={ChevronDown} texto={proyecto?.nombre ?? 'Elegir proyecto'} />
              ) : null}
            </View>
          </>
        ) : null}
        {m.validaciones?.length ? (
          <>
            <Regla />
            <View style={estilos.bloque}>
              <Text accessibilityRole="header" style={estilos.nombre}>Historial de validación</Text>
              {m.validaciones.map((evento) => (
                <View key={evento.id} style={estilos.evento}>
                  <Text style={estilos.nombre}>{estadoValidacion[evento.decision].texto}{evento.tipo ? ` · ${textoTipo[evento.tipo]}` : ''}</Text>
                  <Text style={estilos.meta}>{evento.automatica ? 'Automática' : evento.autor ?? 'Admin'} · {formatearFecha(evento.creado_en)} · {formatearHora(evento.creado_en)}</Text>
                  {evento.motivo ? <Text style={estilos.meta}>{evento.motivo}</Text> : null}
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      {p.puedeValidar ? (
        <View style={[estilos.pie, { paddingBottom: seguro.bottom }]}>
          {!p.soloAsignarTipo ? (
            <Boton alPulsar={() => setHoja('rechazo')} deshabilitado={p.procesando} estilo={estilos.secundario} texto="Rechazar" variante="peligro" />
          ) : null}
          <BloqueAccion alPulsar={p.aprobar} cargando={p.procesando && hoja !== 'rechazo'} compacto deshabilitado={faltaTipo} estilo={estilos.principal} texto={p.soloAsignarTipo ? 'Asignar tipo' : 'Aprobar'} />
        </View>
      ) : null}

      <Hoja cerrar={() => setHoja(null)} titulo="Proyecto" visible={hoja === 'proyecto'}>
        {p.proyectos.length === 0 ? <Text style={estilos.meta}>No hay proyectos activos</Text> : null}
        {p.proyectos.map(({ id, nombre }) => (
          <Opcion alPulsar={() => { p.cambiarProyecto(id); setHoja(null); }} elegida={p.proyectoId === id} key={id} texto={nombre} />
        ))}
      </Hoja>
      <Hoja
        cerrar={() => { if (!p.procesando) setHoja(null); }}
        pie={<BloqueAccion alPulsar={p.rechazar} cargando={p.procesando} compacto deshabilitado={!p.motivo.trim()} pie texto={`Rechazar ${m.clase}`} tono="peligro" />}
        titulo={`Rechazar ${m.clase}`}
        visible={hoja === 'rechazo'}>
        <Text style={estilos.meta}>{m.clase === 'entrada' ? 'El día queda como falta.' : 'El tiempo extra se descarta y el día conserva su asistencia.'}</Text>
        <Campo alto={alto.motivo} cambiar={p.cambiarMotivo} editable={!p.procesando} etiqueta="Motivo" multiline valor={p.motivo} />
        {p.error ? <Aviso texto={p.error} /> : null}
      </Hoja>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: esp[3], paddingHorizontal: margen, paddingVertical: esp[4] },
  nombre: { ...tipo.cuerpoFuerte, color: color.tinta },
  persona: { ...tipo.hoja, color: color.tinta },
  hora: { ...tipo.horaCartel, color: color.tinta },
  horaPar: { gap: esp[1] },
  extraBloque: { gap: esp[1] },
  extra: { ...tipo.extra, color: color.tinta },
  horaMedia: { ...tipo.hora, color: color.tinta },
  sinUbicacion: { flexDirection: 'row', alignItems: 'center', gap: esp[2] },
  meta: { ...tipo.meta, color: color.tintaMedia },
  opciones: { flexDirection: 'row', gap: esp[2] },
  evento: { backgroundColor: color.fondoAlt, padding: esp[3], gap: esp[1] },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[2],
    borderTopWidth: borde.regla,
    borderTopColor: color.tinta,
  },
  secundario: { marginLeft: margen, flex: 1 },
  principal: { flex: 2 },
});
