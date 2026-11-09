import {
  Building2,
  Check,
  ChevronDown,
  HardHat,
  type LucideIcon,
  MapPin,
  MapPinOff,
  Stethoscope,
  WifiOff,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Marcacion, TipoAsistencia } from '@/tipos';
import { formatearFecha, formatearHora, formatearMinutos } from '@/utils/fechas';
import type { VistaAdminDetalleMarcacion } from '../../contrato';
import { Campo, Opcion } from '../componentes/campos';
import { EstadoError, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Boton, Cabecera, Dato, Losa, Seccion } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { aHoras, Mira } from '../componentes/mira';
import { Sello, Sellos } from '../componentes/sello';
import { color, espacio, medida, tipo, tono } from '../tema';
import {
  conMayuscula,
  selloValidacion,
  textoClase,
  textoObservacion,
  textoSinUbicacion,
  textoTipo,
} from '../textos';

const ALTO_LECTURA = 132;
const PX_HORA = 44;

const tipos: { valor: TipoAsistencia; icono: LucideIcon }[] = [
  { valor: 'proyecto', icono: HardHat },
  { valor: 'oficina', icono: Building2 },
  { valor: 'cita_medica', icono: Stethoscope },
];

function LecturaHora({ marcacion }: { marcacion: Marcacion }) {
  const hora = formatearHora(marcacion.hora_oficial);
  const decimal = aHoras(hora) ?? 12;

  return (
    <View style={estilos.lectura}>
      <Mira
        alto={ALTO_LECTURA}
        ancho={medida.miraMedia}
        horaBase={decimal}
        pxHora={PX_HORA}
        yBase={ALTO_LECTURA / 2}
      />
      <View style={estilos.borde} />
      <View style={estilos.hilo} />
      <View style={estilos.lecturaValor}>
        <Text maxFontSizeMultiplier={1.1} style={[tipo.lecturaGigante, estilos.tinta]}>
          {hora}
        </Text>
        <Text style={[tipo.nombre, estilos.tinta]}>
          {`${textoClase[marcacion.clase]}, ${formatearFecha(marcacion.fecha_laboral)}`}
        </Text>
      </View>
    </View>
  );
}

function Ubicacion({ marcacion, abrirMapa }: { marcacion: Marcacion; abrirMapa(): void }) {
  if (marcacion.latitud === null || marcacion.longitud === null) {
    return (
      <Aviso
        icono={MapPinOff}
        mensaje={
          marcacion.motivo_sin_ubicacion
            ? textoSinUbicacion[marcacion.motivo_sin_ubicacion]
            : 'Sin ubicación'
        }
        tinta="aviso"
      />
    );
  }

  return (
    <View style={estilos.ubicacion}>
      <View style={estilos.ubicacionTexto}>
        <Text style={[tipo.nombre, estilos.tinta, estilos.cifras]}>
          {`${marcacion.latitud}, ${marcacion.longitud}`}
        </Text>
        {marcacion.precision_m !== null ? (
          <Text style={[tipo.apoyo, estilos.apagado]}>{`Precisión de ${marcacion.precision_m} m`}</Text>
        ) : null}
      </View>
      <Boton alPresionar={abrirMapa} chico etiqueta="Ver mapa" icono={MapPin} />
    </View>
  );
}

export function AdminDetalleMarcacion(props: VistaAdminDetalleMarcacion) {
  const margen = useSafeAreaInsets();
  const [hoja, setHoja] = useState<'proyecto' | 'rechazo' | null>(null);
  const { marcacion, cargando, error, volver, pideTipo, puedeValidar, soloAsignarTipo, procesando } = props;

  if (!marcacion) {
    return (
      <View style={estilos.raiz}>
        <Cabecera titulo="Marcación" volver={volver} />
        {cargando ? (
          <FilasEsqueleto filas={3} />
        ) : (
          <EstadoError mensaje={error ?? 'No se encontró la marcación'} />
        )}
      </View>
    );
  }

  const editable = puedeValidar || soloAsignarTipo;
  const estado = selloValidacion[marcacion.estado];
  const proyectosVisibles = props.proyectos.filter(
    (proyecto) => proyecto.activo || proyecto.id === props.proyectoId,
  );
  const proyecto = props.proyectos.find((opcion) => opcion.id === props.proyectoId);

  const falta =
    pideTipo && !props.tipo
      ? 'Elige el tipo'
      : pideTipo && props.tipo === 'proyecto' && !props.proyectoId
        ? 'Elige el proyecto'
        : null;

  return (
    <View style={estilos.raiz}>
      <Cabecera lineas={2} titulo={marcacion.persona} volver={volver} />
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <LecturaHora marcacion={marcacion} />

        <View style={estilos.bloques}>
          <Sellos>
            <Sello icono={estado.icono} texto={estado.texto} tinta={estado.tono} />
            {marcacion.sin_conexion ? <Sello icono={WifiOff} texto="Sin señal" tinta="neutro" /> : null}
            {marcacion.automatica ? <Sello icono={Check} texto="Automática" tinta="neutro" /> : null}
            {marcacion.observaciones.map((codigo) => (
              <Sello
                icono={codigo === 'sin_ubicacion' ? MapPinOff : undefined}
                key={codigo}
                texto={textoObservacion[codigo]}
                tinta="aviso"
              />
            ))}
          </Sellos>

          {error ? <Aviso mensaje={error} /> : null}

          <View style={estilos.datos}>
            <Dato etiqueta="Teléfono" valor={formatearHora(marcacion.hora_telefono)} />
            <Dato etiqueta="Recepción" valor={formatearHora(marcacion.hora_recepcion)} />
            {marcacion.desfase_segundos !== 0 ? (
              <Dato etiqueta="Desfase" valor={`${marcacion.desfase_segundos} s`} />
            ) : null}
          </View>

          <Ubicacion abrirMapa={props.abrirMapa} marcacion={marcacion} />

          {marcacion.clase === 'salida' ? (
            <View style={estilos.datos}>
              <Dato
                etiqueta="Tiempo extra"
                valor={marcacion.minutos_extra > 0 ? formatearMinutos(marcacion.minutos_extra) : '0 min'}
              />
            </View>
          ) : null}

          {pideTipo && editable ? (
            <Seccion titulo="Tipo">
              <View accessibilityRole="radiogroup" style={estilos.tipos}>
                {tipos.map(({ valor, icono }) => (
                  <Opcion
                    alPresionar={() => props.cambiarTipo(valor)}
                    elegida={props.tipo === valor}
                    etiqueta={textoTipo[valor]}
                    icono={icono}
                    key={valor}
                  />
                ))}
              </View>
              {props.tipo === 'proyecto' ? (
                <Pressable
                  accessibilityLabel={proyecto ? `Proyecto: ${proyecto.nombre}` : 'Elegir proyecto'}
                  accessibilityRole="button"
                  onPress={() => setHoja('proyecto')}
                  style={[estilos.elegir, !proyecto && estilos.elegirVacio]}>
                  <Text numberOfLines={1} style={[tipo.nombre, estilos.elegirTexto]}>
                    {proyecto ? proyecto.nombre : 'Elegir proyecto'}
                  </Text>
                  <ChevronDown color={color.grafito} size={22} strokeWidth={medida.trazoIcono} />
                </Pressable>
              ) : null}
            </Seccion>
          ) : null}

          {!editable ? (
            <View style={estilos.resuelta}>
              {marcacion.tipo ? (
                <Text style={[tipo.nombre, estilos.tinta]}>
                  {marcacion.proyecto ?? textoTipo[marcacion.tipo]}
                </Text>
              ) : null}
              {marcacion.motivo ? (
                <Text style={[tipo.cuerpo, estilos.motivo]}>{marcacion.motivo}</Text>
              ) : null}
            </View>
          ) : null}

          {marcacion.validaciones?.length ? (
            <Seccion titulo="Historial de validación">
              {marcacion.validaciones.map((evento) => (
                <View key={evento.id} style={estilos.evento}>
                  <Text style={[tipo.nombre, estilos.tinta]}>
                    {selloValidacion[evento.decision].texto}{evento.tipo ? `, ${textoTipo[evento.tipo].toLowerCase()}` : ''}
                  </Text>
                  <Text style={[tipo.apoyo, estilos.apagado]}>
                    {`${evento.automatica ? 'Automática' : evento.autor ?? 'Admin'}, ${formatearFecha(evento.creado_en)}, ${formatearHora(evento.creado_en)}`}
                  </Text>
                  {evento.motivo ? <Text style={[tipo.cuerpo, estilos.tinta]}>{evento.motivo}</Text> : null}
                </View>
              ))}
            </Seccion>
          ) : null}
        </View>
      </ScrollView>

      {editable ? (
        <View style={[estilos.acciones, { paddingBottom: margen.bottom }]}>
          {!soloAsignarTipo ? (
            <Pressable
              accessibilityLabel="Rechazar"
              accessibilityRole="button"
              disabled={procesando}
              onPress={() => setHoja('rechazo')}
              style={({ pressed }) => [estilos.rechazar, pressed && estilos.presionClara]}>
              <Text style={[tipo.losa, estilos.rechazarTexto]}>Rechazar</Text>
            </Pressable>
          ) : null}
          <View style={estilos.aprobar}>
            <Losa
              alPie={false}
              alPresionar={props.aprobar}
              deshabilitada={falta !== null}
              etiqueta={falta ?? (soloAsignarTipo ? 'Asignar tipo' : 'Aprobar')}
              ocupada={procesando && 'Guardando'}
            />
          </View>
        </View>
      ) : null}

      <Hoja cerrar={() => setHoja(null)} titulo="Proyecto" visible={hoja === 'proyecto'}>
        {proyectosVisibles.length === 0 ? (
          <Text style={[tipo.apoyo, estilos.apagado]}>No hay proyectos activos</Text>
        ) : null}
        {proyectosVisibles.map((opcion) => (
          <Opcion
            alPresionar={() => {
              props.cambiarProyecto(opcion.id);
              setHoja(null);
            }}
            elegida={opcion.id === props.proyectoId}
            etiqueta={opcion.nombre}
            icono={HardHat}
            key={opcion.id}
          />
        ))}
      </Hoja>

      <Hoja
        cerrar={() => { if (!procesando) setHoja(null); }}
        pie={
          <>
            <Losa
              alPie={false}
              alPresionar={props.rechazar}
              deshabilitada={props.motivo.trim().length === 0}
              etiqueta={`Rechazar ${marcacion.clase}`}
              ocupada={procesando && 'Rechazando'}
              tinta="peligro"
            />
            <Boton alPresionar={() => setHoja(null)} deshabilitado={procesando} etiqueta="Cancelar" />
          </>
        }
        titulo={`Rechazar ${marcacion.clase}`}
        visible={hoja === 'rechazo'}>
        <Text style={[tipo.cuerpo, estilos.tinta]}>
          {marcacion.clase === 'entrada'
            ? `${conMayuscula(formatearFecha(marcacion.fecha_laboral))} queda como falta.`
            : 'El tiempo extra se descarta y el día conserva su asistencia.'}
        </Text>
        <Campo
          editable={!procesando}
          etiqueta="Motivo"
          multiline
          onChangeText={props.cambiarMotivo}
          value={props.motivo}
        />
        {error ? <Aviso mensaje={error} /> : null}
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  contenido: { paddingBottom: espacio.s5 },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  cifras: { fontVariant: ['tabular-nums'] },
  lectura: { height: ALTO_LECTURA, flexDirection: 'row' },
  borde: {
    position: 'absolute',
    left: medida.miraMedia,
    top: 0,
    bottom: 0,
    width: medida.linea,
    backgroundColor: color.grafito,
  },
  hilo: {
    position: 'absolute',
    left: 0,
    top: ALTO_LECTURA / 2 - 1.5,
    width: medida.miraMedia + 12,
    height: medida.lineaFuerte,
    backgroundColor: color.reticula,
  },
  lecturaValor: { flex: 1, minWidth: 0, justifyContent: 'center', paddingLeft: espacio.s5 },
  bloques: { padding: medida.margen, gap: espacio.s4 },
  datos: { flexDirection: 'row', gap: espacio.s3 },
  ubicacion: { flexDirection: 'row', alignItems: 'center', gap: espacio.s3 },
  ubicacionTexto: { flex: 1, minWidth: 0 },
  tipos: { gap: espacio.s2 },
  elegir: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s2,
    paddingHorizontal: espacio.s3,
    backgroundColor: color.papel,
    borderColor: color.grafito,
    borderWidth: medida.linea,
    borderRadius: medida.radio,
  },
  elegirVacio: { borderColor: color.reticula },
  elegirTexto: { flex: 1, minWidth: 0, color: color.grafito },
  resuelta: { gap: espacio.s1 },
  evento: { borderLeftColor: color.hormigonFuerte, borderLeftWidth: medida.linea, paddingLeft: espacio.s3, gap: espacio.s1 },
  motivo: { color: tono.peligro.texto },
  acciones: {
    flexDirection: 'row',
    backgroundColor: color.papel,
    borderTopColor: color.grafito,
    borderTopWidth: medida.linea,
  },
  rechazar: {
    flex: 2,
    minHeight: medida.losa,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechazarTexto: { color: tono.peligro.texto },
  presionClara: { backgroundColor: color.presionClara },
  aprobar: { flex: 3 },
});
