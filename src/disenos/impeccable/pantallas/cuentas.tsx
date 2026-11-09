import { HardHat, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VistaAdminCuentas, VistaAdminDetalleCuenta } from '../../contrato';
import type { Cuenta } from '@/tipos';
import { fechaLima } from '@/utils/fechas';
import { Boton, Campo, GrupoOpciones, LineaEstado, Opcion, Pestanas, Pie } from '../componentes/controles';
import { Aviso, Esqueleto, Fallo, Vacio } from '../componentes/estados';
import { Banda, base, Dato, Fila, Seccion } from '../componentes/estructura';
import { Hoja } from '../componentes/hoja';
import { Senal } from '../componentes/senal';
import { T } from '../componentes/texto';
import { mascaraFecha, nombreCuenta, nombreRol, pausaVigente } from '../formato';
import { color } from '../tema';

const filtros: { valor: VistaAdminCuentas['filtro']; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'activa', etiqueta: 'Activas' },
  { valor: 'desactivada', etiqueta: 'Desactivadas' },
];

function estadoCuenta(cuenta: Cuenta) {
  if (cuenta.estado === 'pendiente') return { senal: 'hacer', nombre: 'Por aprobar' } as const;
  if (cuenta.estado === 'desactivada') return { senal: 'rechazo', nombre: 'Desactivada' } as const;
  return pausaVigente(cuenta)
    ? { senal: 'aviso', nombre: 'En pausa' } as const
    : { senal: 'ok', nombre: 'Activa' } as const;
}

export function AdminCuentas(v: VistaAdminCuentas) {
  return (
    <View style={base.pantalla}>
      <Banda titulo="Cuentas" cuenta={v.items.length} />
      <Pestanas opciones={filtros} valor={v.filtro} alCambiar={v.cambiarFiltro} />
      <FlatList
        data={v.items}
        keyExtractor={(cuenta) => cuenta.id}
        onRefresh={v.recargar}
        refreshing={v.cargando}
        contentContainerStyle={base.lista}
        ListEmptyComponent={v.cargando ? <Esqueleto /> : v.error ? (
          <Fallo mensaje={v.error} reintentar={v.recargar} />
        ) : <Vacio titulo="No hay cuentas para este filtro" />}
        ListHeaderComponent={v.error && v.items.length ? <Aviso tono="peligro" mensaje={v.error} /> : undefined}
        renderItem={({ item }) => {
          const estado = estadoCuenta(item);
          return (
            <Fila alPresionar={() => v.abrir(item.id)}>
              <Senal clase={estado.senal} />
              <View style={[base.flexible, base.grupoTexto]}>
                <T v="fuerte">{nombreCuenta(item)}</T>
                <T v="rotulo" c={color.tintaMedia}>{nombreRol[item.rol]} · {item.dni}</T>
                <T v="rotuloFuerte">{estado.nombre}</T>
              </View>
            </Fila>
          );
        }}
      />
    </View>
  );
}

export function AdminDetalleCuenta(v: VistaAdminDetalleCuenta) {
  const margen = useSafeAreaInsets();
  const [confirmar, setConfirmar] = useState(false);
  const cuenta = v.cuenta;

  useEffect(() => {
    if (cuenta?.estado === 'desactivada') setConfirmar(false);
  }, [cuenta?.estado]);

  if (!cuenta) return (
    <View style={base.pantalla}>
      <Banda titulo="Cuenta" volver={v.volver} />
      {v.cargando ? <Esqueleto filas={3} /> : <Fallo mensaje={v.error ?? 'No se encontró la cuenta'} volver={v.volver} />}
    </View>
  );

  const pendiente = cuenta.estado === 'pendiente';
  const activa = cuenta.estado === 'activa';
  const estado = estadoCuenta(cuenta);
  return (
    <KeyboardAvoidingView behavior="padding" style={base.pantalla}>
      <Banda titulo={nombreCuenta(cuenta)} detalle={nombreRol[cuenta.rol]} volver={v.volver} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: pendiente ? 0 : margen.bottom }}>
        <Seccion>
          <LineaEstado clase={estado.senal} texto={estado.nombre} />
          <View style={base.filaDatos}>
            <Dato etiqueta="DNI" valor={cuenta.dni} />
            <Dato etiqueta="Referencia" valor={cuenta.numero_referencia} />
          </View>
          {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
        </Seccion>
        {pendiente ? (
          <Seccion titulo="Confirmar tipo de personal">
            <GrupoOpciones>
              <Opcion etiqueta="Operario" icono={HardHat} activa={v.rol === 'operario'} alPresionar={() => v.cambiarRol('operario')} />
              <Opcion etiqueta="Administrativo" icono={UserRound} activa={v.rol === 'administrativo'}
                alPresionar={() => v.cambiarRol('administrativo')} />
            </GrupoOpciones>
          </Seccion>
        ) : null}
        {activa ? (
          <Seccion titulo="Pausar cuenta">
            <Campo etiqueta="Desde (AAAA-MM-DD)" valor={v.pausaDesde} alCambiar={(x) => v.cambiarPausaDesde(mascaraFecha(x))} teclado="number-pad" />
            <Campo etiqueta="Hasta (AAAA-MM-DD)" valor={v.pausaHasta} alCambiar={(x) => v.cambiarPausaHasta(mascaraFecha(x))} teclado="number-pad" />
            <Boton etiqueta="Pausar cuenta" alPresionar={v.pausar} cargando={v.procesando}
              deshabilitado={v.pausaDesde.length !== 10 || v.pausaHasta.length !== 10 || v.pausaDesde > v.pausaHasta} />
          </Seccion>
        ) : null}
        {cuenta.pausas.length ? (
          <Seccion titulo="Pausas registradas">
            {cuenta.pausas.map((pausa) => (
              <View key={pausa.id} style={base.grupoTexto}>
                <T v="fuerte">{pausa.desde} al {pausa.hasta}</T>
                {activa && pausa.hasta >= fechaLima() ? <Boton etiqueta="Terminar pausa" variante="contorno"
                  alPresionar={() => v.terminarPausa(pausa.id)} deshabilitado={v.procesando} /> : null}
              </View>
            ))}
          </Seccion>
        ) : null}
        {pendiente || activa ? (
          <Seccion>
            <Boton etiqueta="Desactivar cuenta" alPresionar={() => setConfirmar(true)} variante="contorno" deshabilitado={v.procesando} />
          </Seccion>
        ) : null}
      </ScrollView>
      {pendiente ? <Pie acciones={[{
        etiqueta: 'Aprobar cuenta', alPresionar: v.aprobar, deshabilitado: !v.rol, cargando: v.procesando,
      }]} /> : null}
      <Hoja visible={confirmar} titulo="Desactivar cuenta" alCerrar={() => { if (!v.procesando) setConfirmar(false); }}
        pie={<Pie acciones={[
          { etiqueta: 'Cancelar', alPresionar: () => setConfirmar(false), deshabilitado: v.procesando, variante: 'neutro' },
          { etiqueta: 'Desactivar', variante: 'peligro', deshabilitado: !v.motivo.trim(), cargando: v.procesando,
            alPresionar: v.desactivar },
        ]} />}>
        <Seccion>
          <T>La persona perderá el acceso. Sus marcaciones se conservarán.</T>
          <Campo etiqueta="Motivo" valor={v.motivo} alCambiar={v.cambiarMotivo} multilinea />
          {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
        </Seccion>
      </Hoja>
    </KeyboardAvoidingView>
  );
}
