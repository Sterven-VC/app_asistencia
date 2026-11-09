import { Building2, ChevronDown, ChevronUp, HardHat, MapPin, SlidersHorizontal, Stethoscope } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FiltrosMarcaciones, VistaAdminDetalleMarcacion, VistaAdminMarcaciones } from '../../contrato';
import { formatearFecha, formatearHora, formatearMinutos } from '@/utils/fechas';
import { Boton, Campo, GrupoOpciones, Interruptor, LineaEstado, Opcion, Pestanas, Pie, type AccionPie } from '../componentes/controles';
import { Cinta } from '../componentes/cartel';
import { Aviso, Esqueleto, Fallo, Vacio } from '../componentes/estados';
import { Banda, base, Dato, Fila, Seccion } from '../componentes/estructura';
import { SelectorFecha } from '../componentes/fecha';
import { Hoja } from '../componentes/hoja';
import { Selector } from '../componentes/selector';
import { Senal } from '../componentes/senal';
import { T } from '../componentes/texto';
import { estadoAdmin, formatearDesfase, nombreClase, nombreObservacion, nombreSinUbicacion, nombreTipo } from '../formato';
import { color, espacio, medida, radio } from '../tema';

const estilos = StyleSheet.create({
  filtros: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  contador: {
    minWidth: medida.icono,
    height: medida.icono,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xs,
    borderRadius: radio.total,
    backgroundColor: color.accion,
  },
  sinSenal: { backgroundColor: color.avisoFondo },
  sinSenalCuerpo: { gap: espacio.m, padding: espacio.l },
});

const estados: { valor: FiltrosMarcaciones['estado']; etiqueta: string }[] = [
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'aprobada', etiqueta: 'Aprobadas' },
  { valor: 'rechazada', etiqueta: 'Rechazadas' },
  { valor: 'todas', etiqueta: 'Todas' },
];

export function AdminMarcaciones(v: VistaAdminMarcaciones) {
  const { filtros } = v;
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const filtrosActivos = Number(Boolean(filtros.fecha)) + Number(Boolean(filtros.cuenta_id))
    + Number(filtros.observada) + Number(filtros.sin_tipo);
  return (
    <View style={base.pantalla}>
      <Banda titulo="Marcaciones" cuenta={v.items.length} />
      <Pestanas opciones={estados} valor={filtros.estado} alCambiar={(estado) => v.cambiarFiltros({ estado })} />
      <Pressable
        onPress={() => setFiltrosVisibles((visible) => !visible)}
        accessibilityRole="button"
        accessibilityState={{ expanded: filtrosVisibles }}
        accessibilityLabel={filtrosActivos ? `Filtros, ${filtrosActivos} activos` : 'Filtros'}
        android_ripple={{ color: color.ondaOscura }}
        style={estilos.filtros}>
        <SlidersHorizontal size={medida.icono} color={color.tinta} strokeWidth={medida.trazoIcono} />
        <T v="fuerte" estilo={base.flexible}>Filtros</T>
        {filtrosActivos > 0 ? (
          <View style={estilos.contador}>
            <T v="rotuloFuerte" c={color.blanco}>{filtrosActivos}</T>
          </View>
        ) : null}
        {filtrosVisibles ? (
          <ChevronUp size={medida.icono} color={color.tinta} strokeWidth={medida.trazoIcono} />
        ) : (
          <ChevronDown size={medida.icono} color={color.tinta} strokeWidth={medida.trazoIcono} />
        )}
      </Pressable>
      <FlatList
        data={v.items}
        keyExtractor={(item) => item.id}
        refreshing={v.cargando}
        onRefresh={v.recargar}
        contentContainerStyle={base.lista}
        ListHeaderComponent={filtrosVisibles ? (
          <Seccion>
            <SelectorFecha valor={filtros.fecha} alCambiar={(fecha) => v.cambiarFiltros({ fecha })} />
            <Selector titulo="Persona" opciones={[{ id: '', nombre: 'Todas las personas' }, ...v.personas]}
              elegida={filtros.cuenta_id} elegir={(id) => v.cambiarFiltros({ cuenta_id: id || null })}
              ayuda="Todas las personas" />
            <View style={base.filaDatos}>
              <T v="fuerte" estilo={base.flexible}>Observadas</T>
              <Interruptor etiqueta="Observadas" activo={filtros.observada}
                alCambiar={() => v.cambiarFiltros({ observada: !filtros.observada })} />
            </View>
            <View style={base.filaDatos}>
              <T v="fuerte" estilo={base.flexible}>Sin tipo</T>
              <Interruptor etiqueta="Sin tipo" activo={filtros.sin_tipo}
                alCambiar={() => v.cambiarFiltros({ sin_tipo: !filtros.sin_tipo })} />
            </View>
            <Boton etiqueta="Limpiar filtros" alPresionar={v.limpiarFiltros} variante="neutro" />
          </Seccion>
        ) : undefined}
        ListEmptyComponent={v.cargando ? <Esqueleto /> : v.error ? (
          <Fallo mensaje={v.error} reintentar={v.recargar} />
        ) : <Vacio titulo="Sin marcaciones para estos filtros" />}
        ListFooterComponent={v.error && v.items.length ? <Aviso tono="peligro" mensaje={v.error} /> : undefined}
        renderItem={({ item }) => {
          const estado = estadoAdmin[item.estado];
          return (
            <Fila alPresionar={() => v.abrir(item.id)}>
              <Senal clase={estado.senal} />
              <View style={[base.flexible, base.grupoTexto]}>
                <T v="fuerte">{item.persona}</T>
                <T v="rotulo" c={color.tintaMedia}>{nombreClase[item.clase]} · {formatearFecha(item.fecha_laboral)}</T>
                <T v="rotuloFuerte">{estado.nombre}{item.tipo ? ` · ${nombreTipo[item.tipo]}` : ''}</T>
                {item.clase === 'salida' && item.minutos_extra > 0 ? (
                  <T v="rotulo">{formatearMinutos(item.minutos_extra)} extra</T>
                ) : null}
                {item.sin_conexion ? <LineaEstado clase="aviso" texto="Marcada sin señal" /> : null}
                {item.observaciones.map((obs) => <LineaEstado key={obs} clase="aviso" texto={nombreObservacion[obs]} />)}
              </View>
              <T v="hora">{formatearHora(item.hora_oficial)}</T>
            </Fila>
          );
        }}
      />
    </View>
  );
}

const opcionesTipo = [
  { valor: 'proyecto', icono: HardHat },
  { valor: 'oficina', icono: Building2 },
  { valor: 'cita_medica', icono: Stethoscope },
] as const;

export function AdminDetalleMarcacion(v: VistaAdminDetalleMarcacion) {
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const margen = useSafeAreaInsets();
  const m = v.marcacion;
  if (!m) return (
    <View style={base.pantalla}>
      <Banda titulo="Marcación" volver={v.volver} />
      {v.cargando ? <Esqueleto filas={3} /> : <Fallo mensaje={v.error ?? 'No se encontró la marcación'} volver={v.volver} />}
    </View>
  );

  const estado = estadoAdmin[m.estado];
  const tieneUbicacion = m.latitud !== null && m.longitud !== null;
  const acciones: AccionPie[] = [];
  if (v.puedeValidar) {
    if (!v.soloAsignarTipo) acciones.push({
      etiqueta: 'Rechazar', alPresionar: () => setConfirmarRechazo(true), variante: 'neutro', deshabilitado: v.procesando,
    });
    acciones.push({
      etiqueta: v.soloAsignarTipo ? 'Asignar tipo' : 'Aprobar', alPresionar: v.aprobar,
      cargando: v.procesando, deshabilitado: v.pideTipo && (!v.tipo || (v.tipo === 'proyecto' && !v.proyectoId)),
    });
  }

  return (
    <View style={base.pantalla}>
      <Banda titulo={m.persona} detalle={`${nombreClase[m.clase]} · ${formatearFecha(m.fecha_laboral)}`} volver={v.volver} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: acciones.length ? espacio.l : margen.bottom }}>
        <Seccion>
          <T v="horaMayor">{formatearHora(m.hora_oficial)}</T>
          <LineaEstado clase={estado.senal} texto={estado.nombre} />
          {m.automatica ? <T v="rotulo">Aprobación automática</T> : null}
          {m.tipo ? <T v="fuerte">{m.proyecto ?? nombreTipo[m.tipo]}</T> : null}
          {m.motivo ? <T>{m.motivo}</T> : null}
          {m.observaciones
            .filter((obs) => obs !== 'sin_ubicacion')
            .map((obs) => <LineaEstado key={obs} clase="aviso" texto={nombreObservacion[obs]} />)}
          {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
        </Seccion>
        {m.sin_conexion ? (
          <View style={estilos.sinSenal}>
            <Cinta />
            <View style={estilos.sinSenalCuerpo}>
              <LineaEstado clase="aviso" texto="Marcada sin señal" />
              <View style={base.filaDatos}>
                <Dato etiqueta="Hora del teléfono" valor={formatearHora(m.hora_telefono)} />
                <Dato etiqueta="Recepción" valor={formatearHora(m.hora_recepcion)} />
              </View>
              {m.desfase_segundos ? (
                <T v="rotulo">Desfase del reloj: {formatearDesfase(m.desfase_segundos)}</T>
              ) : null}
            </View>
          </View>
        ) : null}
        <Seccion titulo="Ubicación">
          {tieneUbicacion ? (
            <>
              <T v="dato">{m.latitud}, {m.longitud}</T>
              {m.precision_m !== null ? <T v="rotulo" c={color.tintaMedia}>Precisión ±{m.precision_m} m</T> : null}
              <Boton etiqueta="Ver en mapa" alPresionar={v.abrirMapa} variante="contorno" icono={MapPin} />
            </>
          ) : (
            <LineaEstado
              clase="aviso"
              texto={`Sin ubicación${m.motivo_sin_ubicacion ? ` · ${nombreSinUbicacion[m.motivo_sin_ubicacion]}` : ''}`}
            />
          )}
        </Seccion>
        {m.clase === 'salida' ? (
          <Seccion titulo="Tiempo extra">
            <T v="lectura">{formatearMinutos(m.minutos_extra)}</T>
            {v.puedeValidar ? (
              <T c={color.tintaMedia}>Aprobar la salida lo cuenta. Rechazarla lo quita y no genera falta.</T>
            ) : null}
          </Seccion>
        ) : null}
        {v.puedeValidar && v.pideTipo ? (
          <Seccion titulo="Tipo de asistencia">
            <GrupoOpciones>
              {opcionesTipo.map(({ valor, icono }) => (
                <Opcion key={valor} etiqueta={nombreTipo[valor]} icono={icono} activa={v.tipo === valor}
                  alPresionar={() => v.cambiarTipo(valor)} />
              ))}
            </GrupoOpciones>
            {v.tipo === 'proyecto' ? <Selector titulo="Proyecto" opciones={v.proyectos} elegida={v.proyectoId}
              elegir={v.cambiarProyecto} ayuda="Elegir proyecto" /> : null}
          </Seccion>
        ) : null}
        {m.validaciones?.length ? (
          <Seccion titulo="Historial de validaciones">
            {m.validaciones.map((registro) => (
              <View key={registro.id} style={base.grupoTexto}>
                <T v="fuerte">{registro.tipo ? nombreTipo[registro.tipo] : registro.automatica ? 'Aprobación automática' : estado.nombre}</T>
                <T v="rotulo" c={color.tintaMedia}>{registro.autor ?? 'Sistema'} · {formatearFecha(registro.creado_en)} · {formatearHora(registro.creado_en)}</T>
                {registro.motivo ? <T>{registro.motivo}</T> : null}
              </View>
            ))}
          </Seccion>
        ) : null}
      </ScrollView>
      {acciones.length ? <Pie acciones={acciones} /> : null}
      <Hoja visible={confirmarRechazo} titulo={`Rechazar ${m.clase}`} alCerrar={() => setConfirmarRechazo(false)}
        pie={<Pie acciones={[
          { etiqueta: 'Cancelar', alPresionar: () => setConfirmarRechazo(false), variante: 'neutro' },
          { etiqueta: 'Rechazar', alPresionar: () => { v.rechazar(); setConfirmarRechazo(false); }, variante: 'peligro', deshabilitado: !v.motivo.trim(), cargando: v.procesando },
        ]} />}>
        <Seccion>
          <T>{m.clase === 'entrada' ? 'El día se registrará como falta.' : 'El tiempo extra se descarta y la asistencia se conserva.'}</T>
          <Campo etiqueta="Motivo" valor={v.motivo} alCambiar={v.cambiarMotivo} multilinea />
        </Seccion>
      </Hoja>
    </View>
  );
}
