import * as Haptics from 'expo-haptics';
import { LogOut, Wifi, WifiOff } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { FlatList, Platform, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VistaHistorial, VistaMarcar } from '../../contrato';
import { formatearFecha, formatearHora, formatearMinutos } from '@/utils/fechas';
import { Cartel, Cinta, PalabrasCartel, Pasos } from '../componentes/cartel';
import { LineaEstado } from '../componentes/controles';
import { Aviso, Esqueleto, Fallo, Vacio } from '../componentes/estados';
import { Banda, base, Fila } from '../componentes/estructura';
import { Senal, type ClaseSenal } from '../componentes/senal';
import { Logo, T } from '../componentes/texto';
import { contar, estadoPropio, nombreClase, nombreObservacion, nombreTipo } from '../formato';
import { color, espacio, medida, tono as coloresCartel, type Tono } from '../tema';

type Letrero = {
  tono: Tono;
  clave: string;
  senal: ClaseSenal;
  lineas: string[];
  detalle?: string;
};

/** Qué dice el letrero según la acción, el paso y lo que falta enviar. */
function letrero(v: VistaMarcar): Letrero {
  if (v.paso === 'ubicando') {
    return { tono: 'espera', clave: 'ubicando', senal: 'espera', lineas: ['Ubicando'], detalle: 'Paso 1 de 2 · Buscando tu ubicación' };
  }
  if (v.paso === 'guardando') {
    return { tono: 'espera', clave: 'guardando', senal: 'espera', lineas: ['Guardando'], detalle: 'Paso 2 de 2 · Guardando en el teléfono' };
  }
  if (v.accion === 'completo' && v.pendientesEnvio > 0) {
    return {
      tono: 'aviso',
      clave: 'en-telefono',
      senal: 'aviso',
      lineas: ['Guardada', 'en el teléfono'],
      detalle: v.conectado ? 'Se está enviando.' : 'Se enviará sola cuando vuelva la señal.',
    };
  }
  if (v.accion === 'completo') {
    return { tono: 'listo', clave: 'listo', senal: 'ok', lineas: ['Listo', 'por hoy'] };
  }
  return { tono: 'accion', clave: v.accion, senal: 'hacer', lineas: ['Marcar', v.accion] };
}

function vibrar(tipo: 'toque' | 'listo') {
  if (Platform.OS === 'web') return;
  const promesa =
    tipo === 'toque'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  promesa.catch(() => undefined);
}

export function Marcar(v: VistaMarcar) {
  const margen = useSafeAreaInsets();
  const cartel = letrero(v);
  const accionable = v.paso === 'inactivo' && v.accion !== 'completo';
  const marcasVistas = useRef(v.marcasHoy.length);

  useEffect(() => {
    if (v.marcasHoy.length > marcasVistas.current) vibrar('listo');
    marcasVistas.current = v.marcasHoy.length;
  }, [v.marcasHoy.length]);

  return (
    <View style={base.pantalla}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={base.lista} bounces={false}>
        <View style={[estilos.cabeza, { paddingTop: margen.top + espacio.s }]}>
          <Logo />
        </View>
        <View style={estilos.persona}>
          <View style={base.flexible}>
            <T v="titulo" lineas={1}>
              {v.nombre}
            </T>
            <T v="rotulo" c={color.tintaMedia} lineas={1}>
              {v.fecha}
            </T>
          </View>
          <Pressable
            onPress={v.cerrarSesion}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            android_ripple={{ color: color.ondaOscura }}
            style={estilos.salir}>
            <LogOut size={medida.iconoChico} color={color.tintaMedia} strokeWidth={medida.trazoIcono} />
            <T v="rotuloFuerte" c={color.tintaMedia}>
              Salir
            </T>
          </Pressable>
        </View>
        <Conexion conectado={v.conectado} pendientes={v.pendientesEnvio} />
        {v.marcasHoy.map((marca) => (
          <View key={marca.id} style={estilos.marca}>
            <View style={[base.flexible, base.grupoTexto]}>
              <T v="fuerte">{nombreClase[marca.clase]}</T>
              <LineaEstado
                clase={marca.enviada ? 'ok' : 'espera'}
                texto={marca.enviada ? 'Enviada' : 'En el teléfono'}
              />
              {marca.sinUbicacion ? <LineaEstado clase="aviso" texto="Sin ubicación" /> : null}
            </View>
            <T v="lectura">{marca.hora}</T>
          </View>
        ))}
        {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
        <Cartel
          tono={cartel.tono}
          clave={cartel.clave}
          etiqueta={[...cartel.lineas, cartel.detalle].filter(Boolean).join('. ')}
          alPresionar={
            accionable
              ? () => {
                  vibrar('toque');
                  v.marcar();
                }
              : undefined
          }
          estilo={estilos.cartel}>
          <Senal clase={cartel.senal} tam={medida.disco} sobreCampo={cartel.tono !== 'aviso'} />
          <View style={estilos.cartelPie}>
            {v.paso !== 'inactivo' ? <Pasos actual={v.paso === 'ubicando' ? 1 : 2} /> : null}
            <PalabrasCartel lineas={cartel.lineas} tono={cartel.tono} />
            {cartel.detalle ? (
              <T v="fuerte" c={coloresCartel[cartel.tono].texto}>
                {cartel.detalle}
              </T>
            ) : null}
          </View>
        </Cartel>
      </ScrollView>
    </View>
  );
}

/** Siempre visible: si hay señal y cuántas marcaciones esperan en el teléfono. */
function Conexion({ conectado, pendientes }: { conectado: boolean; pendientes: number }) {
  const tinta = color.tinta;
  const Icono = conectado ? Wifi : WifiOff;
  const cola = pendientes > 0 ? contar(pendientes, 'por enviar', 'por enviar') : 'Todo enviado';
  return (
    <View accessibilityRole="summary" style={!conectado && estilos.sinSenal}>
      <View style={[estilos.conexion, conectado && estilos.conSenal]}>
        <Icono size={medida.icono} color={tinta} strokeWidth={medida.trazoCartel} />
        <T v="fuerte" c={tinta} estilo={base.flexible} lineas={1}>
          {conectado ? 'Con señal' : 'Sin señal'}
        </T>
        <Senal clase={pendientes > 0 ? 'espera' : 'ok'} tam={medida.senalChica} />
        <T v="fuerte" c={tinta} lineas={1}>
          {cola}
        </T>
      </View>
      {!conectado ? <Cinta /> : null}
    </View>
  );
}

export function Historial(v: VistaHistorial) {
  return (
    <View style={base.pantalla}>
      <Banda titulo="Historial" />
      {v.cargando && !v.items.length ? <Esqueleto /> : (
        <FlatList
          data={v.items}
          keyExtractor={(item) => `${item.item}-${item.id}`}
          refreshing={v.cargando}
          onRefresh={v.recargar}
          contentContainerStyle={base.lista}
          ListHeaderComponent={v.error && v.items.length ? <Aviso tono="aviso" mensaje={v.error} /> : undefined}
          ListEmptyComponent={v.error ? <Fallo mensaje={v.error} reintentar={v.recargar} /> : <Vacio titulo="Aún no hay marcaciones" />}
          renderItem={({ item }) => {
            if (item.item === 'falta') {
              return (
                <Fila>
                  <Senal clase={item.anulada ? 'ok' : 'rechazo'} />
                  <View style={[base.flexible, base.grupoTexto]}>
                    <T v="fuerte">{item.anulada ? 'Falta anulada' : 'Falta'}</T>
                    <T v="rotulo" c={color.tintaMedia}>{formatearFecha(item.fecha)}</T>
                    {item.motivo ? <T>{item.motivo}</T> : null}
                  </View>
                </Fila>
              );
            }
            const estado = item.envio === 'sin_enviar' ? { senal: 'espera' as const, nombre: 'En el teléfono' } : estadoPropio[item.estado];
            return (
              <Fila>
                <Senal clase={estado.senal} />
                <View style={[base.flexible, base.grupoTexto]}>
                  <T v="fuerte">{nombreClase[item.clase]}</T>
                  <T v="rotulo" c={color.tintaMedia}>{formatearFecha(item.fecha)} · {estado.nombre}</T>
                  {item.tipo ? <T>{item.proyecto ?? nombreTipo[item.tipo]}</T> : null}
                  {item.minutos_extra > 0 ? <T>{formatearMinutos(item.minutos_extra)} extra</T> : null}
                  {item.motivo ? <T>{item.motivo}</T> : null}
                  {item.observaciones.map((obs) => <LineaEstado key={obs} clase="aviso" texto={nombreObservacion[obs]} />)}
                </View>
                <T v="hora">{formatearHora(item.hora)}</T>
              </Fila>
            );
          }}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cabeza: {
    paddingLeft: espacio.l,
    paddingRight: medida.zonaLibre,
    paddingBottom: espacio.s,
  },
  persona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingLeft: espacio.l,
    paddingBottom: espacio.m,
  },
  salir: {
    minHeight: medida.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.xs,
    paddingHorizontal: espacio.l,
  },
  conexion: {
    minHeight: medida.toque,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.l,
  },
  conSenal: {
    backgroundColor: color.placa,
  },
  sinSenal: { backgroundColor: color.aviso },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    paddingVertical: espacio.m,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  cartel: { flex: 1, minHeight: medida.cartelMinimo },
  cartelPie: { flex: 1, justifyContent: 'flex-end', gap: espacio.m },
});
