import { Check, ChevronRight, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { Falta } from '@/tipos';
import { fechaLima, formatearFecha, formatearHora } from '@/utils/fechas';
import type { VistaAdminFaltas } from '../../contrato';
import { Campo, Filtro, Opcion } from '../componentes/campos';
import { EstadoError, EstadoVacio, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Boton, Cabecera, Losa } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { agruparPorDia, GrupoDia } from '../componentes/lista-dias';
import { Sello } from '../componentes/sello';
import { SelectorFecha } from '../componentes/selector-fecha';
import { color, espacio, medida, tipo } from '../tema';
import { conMayuscula, plural, textoOrigenFalta } from '../textos';

const fechaCompleta = /^\d{4}-\d{2}-\d{2}$/;
const textoDecision = (esFalta: boolean) => esFalta ? 'Falta' : 'Sin falta';

function Fila({ falta, elegir }: { falta: Falta; elegir(falta: Falta): void }) {
  const esFalta = falta.es_falta ?? !falta.anulada;
  return (
    <Pressable
      accessibilityHint="Abre la corrección"
      accessibilityLabel={`${falta.persona}, ${textoDecision(esFalta)}, ${textoOrigenFalta[falta.origen]}`}
      accessibilityRole="button"
      onPress={() => elegir(falta)}
      style={({ pressed }) => [estilos.fila, pressed && estilos.filaPresionada]}>
      <View style={estilos.detalle}>
        <Text numberOfLines={1} style={[tipo.nombre, estilos.tinta]}>
          {falta.persona}
        </Text>
        <Text numberOfLines={1} style={[tipo.apoyo, estilos.apagado]}>
          {textoOrigenFalta[falta.origen]}
        </Text>
        <Sello icono={esFalta ? X : Check} texto={textoDecision(esFalta)} tinta={esFalta ? 'peligro' : 'exito'} />
        {falta.motivo_anulacion ? (
          <Text style={[tipo.apoyo, estilos.apagado]}>{falta.motivo_anulacion}</Text>
        ) : null}
        {falta.correcciones?.map((evento) => (
          <View key={evento.id} style={estilos.evento}>
            <Text style={[tipo.rotulo, estilos.tinta]}>{textoDecision(evento.es_falta_anterior)} → {textoDecision(evento.es_falta_nuevo)}</Text>
            <Text style={[tipo.cuerpo, estilos.tinta]}>{evento.motivo}</Text>
            <Text style={[tipo.apoyo, estilos.apagado]}>{`${evento.autor}, ${formatearFecha(evento.creado_en)}, ${formatearHora(evento.creado_en)}`}</Text>
          </View>
        ))}
      </View>
      <ChevronRight color={color.plomo} size={22} strokeWidth={medida.trazoIcono} />
    </Pressable>
  );
}

export function AdminFaltas(props: VistaAdminFaltas) {
  const { items, cargando, error, recargar, fecha, cambiarFecha, motivo, cambiarMotivo } = props;
  const [elegirFecha, setElegirFecha] = useState(false);
  const [hoja, setHoja] = useState<'correccion' | 'persona' | null>(null);
  const estabaProcesando = useRef(false);

  useEffect(() => {
    if (estabaProcesando.current && !props.procesando && !motivo) setHoja(null);
    estabaProcesando.current = props.procesando;
  }, [motivo, props.procesando]);

  const grupos = agruparPorDia(items, (item) => item.fecha);
  const sinDatos = items.length === 0;
  const vigentes = items.filter((item) => item.es_falta ?? !item.anulada).length;
  const persona = props.cuentas.find(({ id }) => id === props.cuentaId);
  const listo = Boolean(props.cuentaId && motivo.trim() && fechaCompleta.test(props.fechaCorreccion) && props.fechaCorreccion <= fechaLima());
  const abrir = (falta: Falta) => {
    props.seleccionarFalta(falta);
    setHoja('correccion');
  };

  return (
    <View style={estilos.raiz}>
      <Cabecera
        detalle={
          cargando ? null : (
            <Text style={[tipo.fuerte, estilos.apagado]}>{plural(vigentes, 'vigente', 'vigentes')}</Text>
          )
        }
        titulo="Faltas"
      />
      <View style={estilos.filtro}>
        <Filtro
          activo={fecha !== null}
          alPresionar={() => setElegirFecha(true)}
          desplegable
          etiqueta={fecha ? conMayuscula(formatearFecha(fecha)) : 'Fecha'}
        />
      </View>

      {sinDatos && cargando ? (
        <FilasEsqueleto conHora={false} />
      ) : sinDatos && error ? (
        <EstadoError mensaje={error} reintentar={recargar} />
      ) : (
        <FlatList
          ListEmptyComponent={<EstadoVacio titulo="No hay faltas" />}
          ListHeaderComponent={error ? <Aviso banda mensaje={error} /> : undefined}
          contentContainerStyle={estilos.lista}
          data={grupos}
          keyExtractor={(grupo) => grupo.fecha}
          refreshControl={
            <RefreshControl colors={[color.accion]} onRefresh={recargar} refreshing={cargando} />
          }
          renderItem={({ item: grupo, index }) => (
            <GrupoDia fecha={grupo.fecha} indice={index}>
              {grupo.items.map((item) => (
                <Fila elegir={abrir} falta={item} key={item.id} />
              ))}
            </GrupoDia>
          )}
        />
      )}

      <Losa alPie={false} alPresionar={() => setHoja('correccion')} etiqueta="Corregir día" />

      <SelectorFecha
        cambiar={cambiarFecha}
        cerrar={() => setElegirFecha(false)}
        fecha={fecha}
        visible={elegirFecha}
      />

      <Hoja
        cerrar={() => { if (!props.procesando) setHoja(hoja === 'persona' ? 'correccion' : null); }}
        pie={hoja === 'correccion' ? (
          <>
            <Losa
              alPie={false}
              alPresionar={() => props.corregir(true)}
              deshabilitada={!listo}
              etiqueta="Registrar falta"
              ocupada={props.procesando && 'Guardando'}
            />
            <Boton
              alPresionar={() => props.corregir(false)}
              deshabilitado={!listo || props.procesando}
              etiqueta="Quitar falta"
            />
          </>
        ) : undefined}
        titulo={hoja === 'persona' ? 'Persona' : 'Corregir día'}
        visible={hoja !== null}>
        {hoja === 'persona' ? (
          props.cuentas.length > 0 ? props.cuentas.map(({ id, nombre }) => (
            <Opcion
              alPresionar={() => { props.cambiarCuenta(id); setHoja('correccion'); }}
              elegida={props.cuentaId === id}
              etiqueta={nombre}
              key={id}
            />
          )) : <Text style={[tipo.apoyo, estilos.apagado]}>No hay cuentas disponibles</Text>
        ) : (
          <>
            <Boton alPresionar={() => setHoja('persona')} deshabilitado={props.procesando} etiqueta={persona?.nombre ?? 'Elegir persona'} />
            <Campo autoCorrect={false} editable={!props.procesando} etiqueta="Fecha del día" maxLength={10} onChangeText={props.cambiarFechaCorreccion} placeholder="AAAA-MM-DD" value={props.fechaCorreccion} />
            <Campo editable={!props.procesando} etiqueta="Motivo" multiline onChangeText={cambiarMotivo} value={motivo} />
            {error ? <Aviso mensaje={error} /> : null}
          </>
        )}
      </Hoja>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  filtro: { flexDirection: 'row', paddingHorizontal: medida.margen, paddingTop: espacio.s3 },
  lista: { paddingTop: espacio.s3, paddingBottom: espacio.s6 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    minHeight: 64,
    paddingVertical: espacio.s2,
  },
  filaPresionada: { backgroundColor: color.hormigon },
  detalle: { flex: 1, minWidth: 0, gap: espacio.s1 },
  evento: { borderLeftColor: color.hormigonFuerte, borderLeftWidth: medida.linea, marginTop: espacio.s2, paddingLeft: espacio.s3, gap: espacio.s1 },
});
