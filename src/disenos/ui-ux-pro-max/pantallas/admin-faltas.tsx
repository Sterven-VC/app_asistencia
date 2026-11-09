import { Check, ChevronDown, ClipboardPen, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Falta } from '@/tipos';
import { fechaLima, formatearFecha, formatearHora } from '@/utils/fechas';
import type { VistaAdminFaltas } from '../../contrato';
import { BloqueAccion, Boton } from '../componentes/acciones';
import { Campo, CampoFecha, Opcion, SelectorDia } from '../componentes/campos';
import { Aviso, Placa } from '../componentes/estados';
import { Hoja } from '../componentes/hoja';
import { EstadoLista, Fila, Separador } from '../componentes/lista';
import { Marco, Riel } from '../componentes/marco';
import { alto, color, esp, margen, tipo } from '../tema';
import { textoOrigenFalta } from '../textos';

const fechaCompleta = /^\d{4}-\d{2}-\d{2}$/;
const textoDecision = (esFalta: boolean) => esFalta ? 'Falta' : 'Sin falta';

function FilaFalta({ falta, corregir }: { falta: Falta; corregir(falta: Falta): void }) {
  const esFalta = falta.es_falta ?? !falta.anulada;
  return (
    <Fila alPulsar={() => corregir(falta)} etiqueta={`${falta.persona}, ${formatearFecha(falta.fecha)}, ${textoDecision(esFalta)}`}>
      <Text style={estilos.fecha}>{formatearFecha(falta.fecha)}</Text>
      <Text style={estilos.nombre}>{falta.persona}</Text>
      <Text style={estilos.meta}>{textoOrigenFalta[falta.origen]}</Text>
      <Placa estado={esFalta
        ? { texto: 'Falta', tono: 'peligro', icono: X }
        : { texto: 'Sin falta', tono: 'exito', icono: Check }} />
      {falta.motivo_anulacion ? <Text style={estilos.meta}>{falta.motivo_anulacion}</Text> : null}
      {falta.correcciones?.map((evento) => (
        <View key={evento.id} style={estilos.evento}>
          <Text style={estilos.nombre}>{textoDecision(evento.es_falta_anterior)} → {textoDecision(evento.es_falta_nuevo)}</Text>
          <Text style={estilos.meta}>{evento.motivo}</Text>
          <Text style={estilos.meta}>{evento.autor} · {formatearFecha(evento.creado_en)} · {formatearHora(evento.creado_en)}</Text>
        </View>
      ))}
    </Fila>
  );
}

export function AdminFaltas(p: VistaAdminFaltas) {
  const [hoja, setHoja] = useState<'corregir' | 'persona' | null>(null);
  const seguro = useSafeAreaInsets();
  const estabaProcesando = useRef(false);
  const nombre = p.cuentas.find((cuenta) => cuenta.id === p.cuentaId)?.nombre;
  const listo = Boolean(
    p.cuentaId && fechaCompleta.test(p.fechaCorreccion) && p.fechaCorreccion <= fechaLima() && p.motivo.trim(),
  );

  useEffect(() => {
    if (estabaProcesando.current && !p.procesando && !p.motivo) setHoja(null);
    estabaProcesando.current = p.procesando;
  }, [p.motivo, p.procesando]);

  const corregirFila = (falta: Falta) => {
    p.seleccionarFalta(falta);
    setHoja('corregir');
  };

  return (
    <Marco>
      <Riel titulo="Faltas" />
      <View style={estilos.filtro}>
        <SelectorDia cambiar={p.cambiarFecha} fecha={p.fecha} />
      </View>
      <Separador />
      <EstadoLista
        cargando={p.cargando}
        error={p.error}
        recargar={p.recargar}
        textoVacio="No hay faltas en este periodo"
        vacia={p.items.length === 0}>
        <FlatList
          contentContainerStyle={estilos.lista}
          data={p.items}
          ItemSeparatorComponent={Separador}
          keyExtractor={(falta) => falta.id}
          onRefresh={p.recargar}
          refreshing={p.cargando}
          renderItem={({ item }) => <FilaFalta corregir={corregirFila} falta={item} />}
        />
      </EstadoLista>
      <BloqueAccion alPulsar={() => setHoja('corregir')} icono={ClipboardPen} texto="Corregir día" />

      <Hoja
        cerrar={() => { if (!p.procesando) setHoja(hoja === 'persona' ? 'corregir' : null); }}
        pie={hoja === 'corregir' ? (
          <View style={[estilos.acciones, { paddingBottom: esp[2] + seguro.bottom }]}>
            <Boton alPulsar={() => p.corregir(false)} deshabilitado={!listo || p.procesando} estilo={estilos.accion} texto="Quitar falta" />
            <BloqueAccion alPulsar={() => p.corregir(true)} cargando={p.procesando} compacto deshabilitado={!listo} estilo={estilos.accion} texto="Registrar falta" />
          </View>
        ) : undefined}
        titulo={hoja === 'persona' ? 'Persona' : 'Corregir día'}
        visible={hoja !== null}>
        {hoja === 'persona' ? (
          p.cuentas.length > 0 ? p.cuentas.map(({ id, nombre: persona }) => (
            <Opcion alPulsar={() => { p.cambiarCuenta(id); setHoja('corregir'); }} elegida={p.cuentaId === id} key={id} texto={persona} />
          )) : <Text style={estilos.meta}>No hay cuentas disponibles</Text>
        ) : (
          <>
            <Boton alPulsar={() => setHoja('persona')} deshabilitado={p.procesando} icono={ChevronDown} texto={nombre ?? 'Elegir persona'} />
            <CampoFecha cambiar={p.cambiarFechaCorreccion} editable={!p.procesando} etiqueta="Fecha del día" valor={p.fechaCorreccion} />
            <Campo alto={alto.motivo} cambiar={p.cambiarMotivo} editable={!p.procesando} etiqueta="Motivo" multiline valor={p.motivo} />
            {p.error ? <Aviso texto={p.error} /> : null}
          </>
        )}
      </Hoja>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  filtro: { paddingHorizontal: margen, paddingVertical: esp[2] },
  lista: { paddingBottom: esp[5] },
  fecha: { ...tipo.dato, color: color.tinta },
  nombre: { ...tipo.cuerpoFuerte, color: color.tinta },
  meta: { ...tipo.meta, color: color.tintaMedia },
  evento: { backgroundColor: color.fondoAlt, padding: esp[3], gap: esp[1] },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: esp[2], paddingHorizontal: margen, paddingTop: esp[2] },
  accion: { flex: 1 },
});
