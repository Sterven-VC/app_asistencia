import { Pause, UserX } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fechaLima, formatearFecha } from '@/utils/fechas';
import type { VistaAdminDetalleCuenta } from '../../contrato';
import { BloqueAccion, Boton, BotonDiscreto } from '../componentes/acciones';
import { Campo, CampoFecha, Opcion } from '../componentes/campos';
import { Aviso, Esqueleto, Placa, Placas, Vacio } from '../componentes/estados';
import { Hoja } from '../componentes/hoja';
import { Dato, Separador } from '../componentes/lista';
import { Marco, Regla, Riel, RielVolver } from '../componentes/marco';
import { alto, color, esp, margen, tipo } from '../tema';
import { estadoCuenta, nombreCompleto, textoRol } from '../textos';

const roles = ['operario', 'administrativo'] as const;
const fechaCompleta = /^\d{4}-\d{2}-\d{2}$/;

export function AdminDetalleCuenta(p: VistaAdminDetalleCuenta) {
  const [hoja, setHoja] = useState<'pausa' | 'desactivar' | null>(null);
  const seguro = useSafeAreaInsets();
  const estabaProcesando = useRef(false);
  const c = p.cuenta;

  useEffect(() => {
    if (estabaProcesando.current && !p.procesando && !p.error) setHoja(null);
    estabaProcesando.current = p.procesando;
  }, [p.error, p.procesando]);

  if (!c) {
    return (
      <Marco>
        <RielVolver volver={p.volver} />
        <Riel titulo="Cuenta" />
        <Regla />
        {p.cargando ? <Esqueleto filas={3} /> : <Vacio texto={p.error ?? 'No se encontró la cuenta'} />}
      </Marco>
    );
  }

  const pendiente = c.estado === 'pendiente';
  const hoy = fechaLima();
  const pausaValida = fechaCompleta.test(p.pausaDesde) && fechaCompleta.test(p.pausaHasta) && p.pausaDesde <= p.pausaHasta;
  const cerrar = () => { if (!p.procesando) setHoja(null); };

  return (
    <Marco>
      <RielVolver volver={p.volver} />
      <ScrollView contentContainerStyle={{ paddingBottom: esp[5] + seguro.bottom }} keyboardShouldPersistTaps="handled">
        <Riel titulo="Cuenta" />
        <Regla />
        <View style={estilos.bloque}>
          <Text accessibilityRole="header" style={estilos.nombre}>{nombreCompleto(c)}</Text>
          <Placas>
            <Placa estado={estadoCuenta[c.estado]} />
          </Placas>
          <Dato etiqueta="DNI" valor={c.dni} />
          <Dato etiqueta="Número de referencia" valor={c.numero_referencia} />
          {pendiente ? (
            <View accessibilityRole="radiogroup" style={estilos.opciones}>
              <Text style={estilos.seccion}>Rol</Text>
              {roles.map((rol) => <Opcion alPulsar={() => p.cambiarRol(rol)} elegida={p.rol === rol} key={rol} texto={textoRol[rol]} />)}
            </View>
          ) : <Dato etiqueta="Rol" valor={textoRol[c.rol]} />}
        </View>
        {p.error ? <Aviso texto={p.error} /> : null}
        {c.pausas.length > 0 ? (
          <>
            <Regla />
            <View style={estilos.bloque}>
              <Text accessibilityRole="header" style={estilos.seccion}>Pausas</Text>
              {c.pausas.map((pausa) => (
                <View key={pausa.id}>
                  <View style={estilos.pausa}>
                    <Text style={estilos.fecha}>{formatearFecha(pausa.desde)} al {formatearFecha(pausa.hasta)}</Text>
                    {c.estado === 'activa' && pausa.hasta >= hoy && !p.procesando ? (
                      <BotonDiscreto alPulsar={() => p.terminarPausa(pausa.id)} texto="Terminar" />
                    ) : null}
                  </View>
                  <Separador />
                </View>
              ))}
            </View>
          </>
        ) : null}
        {c.estado !== 'desactivada' ? (
          <View style={estilos.bloque}>
            {c.estado === 'activa' ? <Boton alPulsar={() => setHoja('pausa')} deshabilitado={p.procesando} icono={Pause} texto="Pausar cuenta" /> : null}
            <Boton alPulsar={() => setHoja('desactivar')} deshabilitado={p.procesando} icono={UserX} texto="Desactivar cuenta" variante="peligro" />
          </View>
        ) : null}
      </ScrollView>

      {pendiente ? <BloqueAccion alPulsar={p.aprobar} cargando={p.procesando && hoja === null} deshabilitado={!p.rol} pie texto="Aprobar cuenta" /> : null}
      <Hoja
        cerrar={cerrar}
        pie={<BloqueAccion alPulsar={p.pausar} cargando={p.procesando} compacto deshabilitado={!pausaValida} pie texto="Guardar pausa" />}
        titulo="Pausar cuenta"
        visible={hoja === 'pausa'}>
        <CampoFecha cambiar={p.cambiarPausaDesde} editable={!p.procesando} etiqueta="Desde" valor={p.pausaDesde} />
        <CampoFecha cambiar={p.cambiarPausaHasta} editable={!p.procesando} etiqueta="Hasta" valor={p.pausaHasta} />
        {p.error ? <Aviso texto={p.error} /> : null}
      </Hoja>
      <Hoja
        cerrar={cerrar}
        pie={<BloqueAccion alPulsar={p.desactivar} cargando={p.procesando} compacto deshabilitado={!p.motivo.trim() || c.estado === 'desactivada'} pie texto="Desactivar cuenta" tono="peligro" />}
        titulo="Desactivar cuenta"
        visible={hoja === 'desactivar'}>
        <Campo alto={alto.motivo} cambiar={p.cambiarMotivo} editable={!p.procesando} etiqueta="Motivo" multiline valor={p.motivo} />
        {p.error ? <Aviso texto={p.error} /> : null}
      </Hoja>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  bloque: { gap: esp[3], paddingHorizontal: margen, paddingVertical: esp[4] },
  nombre: { ...tipo.nombre, color: color.tinta },
  seccion: { ...tipo.cuerpoFuerte, color: color.tinta },
  opciones: { gap: esp[2] },
  pausa: { minHeight: alto.toque, flexDirection: 'row', alignItems: 'center', gap: esp[2] },
  fecha: { ...tipo.dato, color: color.tinta, flex: 1 },
});
