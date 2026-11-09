import { Pause, Phone, UserX } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fechaLima, formatearFecha } from '@/utils/fechas';
import type { VistaAdminDetalleCuenta } from '../../contrato';
import { Campo, Segmentado } from '../componentes/campos';
import { EstadoError, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Boton, Cabecera, Dato, Losa, Seccion } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { Sello, Sellos } from '../componentes/sello';
import { color, espacio, medida, tipo, tono } from '../tema';
import { selloCuenta, textoRol } from '../textos';

const opcionesRol = [
  { valor: 'operario' as const, etiqueta: textoRol.operario },
  { valor: 'administrativo' as const, etiqueta: textoRol.administrativo },
];

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export function AdminDetalleCuenta(props: VistaAdminDetalleCuenta) {
  const { cuenta, cargando, error, volver, procesando } = props;
  const [hoja, setHoja] = useState<'pausa' | 'desactivar' | null>(null);
  const estabaProcesando = useRef(false);

  useEffect(() => {
    if (estabaProcesando.current && !procesando && !error) setHoja(null);
    estabaProcesando.current = procesando;
  }, [error, procesando]);

  if (!cuenta) {
    return (
      <View style={estilos.raiz}>
        <Cabecera titulo="Cuenta" volver={volver} />
        {cargando ? (
          <FilasEsqueleto conHora={false} filas={3} />
        ) : (
          <EstadoError mensaje={error ?? 'No se encontró la cuenta'} />
        )}
      </View>
    );
  }

  const nombres = [cuenta.nombre_1, cuenta.nombre_2, cuenta.apellido_paterno, cuenta.apellido_materno]
    .filter(Boolean)
    .join(' ');
  const estado = selloCuenta[cuenta.estado];
  const pendiente = cuenta.estado === 'pendiente';
  const activa = cuenta.estado === 'activa';
  const pausaLista = FECHA.test(props.pausaDesde) && FECHA.test(props.pausaHasta) && props.pausaDesde <= props.pausaHasta;
  const hoy = fechaLima();

  return (
    <KeyboardAvoidingView behavior="padding" style={estilos.raiz}>
      <Cabecera lineas={2} titulo={nombres} volver={volver} />
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Sellos>
          <Sello icono={estado.icono} texto={estado.texto} tinta={estado.tono} />
        </Sellos>

        {error ? <Text style={[tipo.fuerte, estilos.error]}>{error}</Text> : null}

        <View style={estilos.datos}>
          <Dato etiqueta="DNI" valor={cuenta.dni} />
          {!pendiente ? <Dato etiqueta="Rol" valor={textoRol[cuenta.rol]} /> : null}
        </View>

        <View style={estilos.telefono}>
          <Phone color={color.plomo} size={medida.icono} strokeWidth={medida.trazoIcono} />
          <Text style={[tipo.nombre, estilos.tinta, estilos.cifras]}>{cuenta.numero_referencia}</Text>
        </View>

        {pendiente ? (
          <Seccion titulo="Rol">
            <Segmentado
              cambiar={props.cambiarRol}
              etiqueta="Rol"
              opciones={opcionesRol}
              valor={props.rol}
            />
          </Seccion>
        ) : null}

        {cuenta.pausas.length > 0 ? (
          <Seccion titulo="Pausas">
            {cuenta.pausas.map((pausa) => (
              <View key={pausa.id} style={estilos.pausa}>
                <Text style={[tipo.nombre, estilos.tinta, estilos.pausaTexto]}>
                  {`${formatearFecha(pausa.desde)} al ${formatearFecha(pausa.hasta)}`}
                </Text>
                {activa && pausa.hasta >= hoy ? (
                  <Boton
                    alPresionar={() => props.terminarPausa(pausa.id)}
                    chico
                    deshabilitado={procesando}
                    etiqueta="Terminar"
                  />
                ) : null}
              </View>
            ))}
          </Seccion>
        ) : null}

        {pendiente || activa ? (
          <View style={estilos.acciones}>
            {activa ? (
              <Boton alPresionar={() => setHoja('pausa')} etiqueta="Pausar cuenta" icono={Pause} />
            ) : null}
            <Boton
              alPresionar={() => setHoja('desactivar')}
              etiqueta="Desactivar cuenta"
              icono={UserX}
              peligro
            />
          </View>
        ) : null}
      </ScrollView>

      {pendiente ? (
        <Losa
          alPresionar={props.aprobar}
          deshabilitada={props.rol === null}
          etiqueta={props.rol === null ? 'Elige el rol' : 'Aprobar cuenta'}
          ocupada={procesando && 'Aprobando'}
        />
      ) : null}

      <Hoja
        cerrar={() => { if (!procesando) setHoja(null); }}
        pie={
          <>
            <Losa
              alPie={false}
              alPresionar={props.pausar}
              deshabilitada={!pausaLista}
              etiqueta="Pausar cuenta"
              ocupada={procesando && 'Pausando'}
            />
            <Boton alPresionar={() => setHoja(null)} deshabilitado={procesando} etiqueta="Cancelar" />
          </>
        }
        titulo="Pausar cuenta"
        visible={hoja === 'pausa'}>
        <Text style={[tipo.cuerpo, estilos.tinta]}>En esas fechas no marca ni genera faltas.</Text>
        <Campo
          autoCorrect={false}
          editable={!procesando}
          etiqueta="Desde"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          onChangeText={props.cambiarPausaDesde}
          placeholder="AAAA-MM-DD"
          value={props.pausaDesde}
        />
        <Campo
          autoCorrect={false}
          editable={!procesando}
          etiqueta="Hasta"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          onChangeText={props.cambiarPausaHasta}
          placeholder="AAAA-MM-DD"
          value={props.pausaHasta}
        />
        {error ? <Aviso mensaje={error} /> : null}
      </Hoja>

      <Hoja
        cerrar={() => { if (!procesando) setHoja(null); }}
        pie={
          <>
            <Losa
              alPie={false}
              alPresionar={props.desactivar}
              deshabilitada={props.motivo.trim().length === 0}
              etiqueta="Desactivar cuenta"
              ocupada={procesando && 'Desactivando'}
              tinta="peligro"
            />
            <Boton alPresionar={() => setHoja(null)} deshabilitado={procesando} etiqueta="Cancelar" />
          </>
        }
        titulo="Desactivar cuenta"
        visible={hoja === 'desactivar'}>
        <Text style={[tipo.cuerpo, estilos.tinta]}>
          Deja de marcar y de generar faltas. Su historial se conserva.
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
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  contenido: { padding: medida.margen, paddingBottom: espacio.s6, gap: espacio.s4 },
  tinta: { color: color.grafito },
  cifras: { fontVariant: ['tabular-nums'] },
  error: { color: tono.peligro.texto },
  datos: { flexDirection: 'row', gap: espacio.s3 },
  telefono: { flexDirection: 'row', alignItems: 'center', gap: espacio.s2 },
  pausa: { flexDirection: 'row', alignItems: 'center', gap: espacio.s3 },
  pausaTexto: { flex: 1, minWidth: 0 },
  acciones: { gap: espacio.s2, paddingTop: espacio.s2 },
});
