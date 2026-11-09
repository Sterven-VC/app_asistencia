import { ChevronRight, Pause } from 'lucide-react-native';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { Cuenta, EstadoCuenta } from '@/tipos';
import { fechaLima, formatearFecha } from '@/utils/fechas';
import type { VistaAdminCuentas } from '../../contrato';
import { Segmentado } from '../componentes/campos';
import { EstadoError, EstadoVacio, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Cabecera } from '../componentes/estructura';
import { Sello, Sellos } from '../componentes/sello';
import { color, espacio, medida, tipo } from '../tema';
import { plural, selloCuenta, textoRol } from '../textos';

const opciones: { valor: EstadoCuenta | 'todas'; etiqueta: string }[] = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'activa', etiqueta: 'Activas' },
  { valor: 'desactivada', etiqueta: 'Inactivas' },
];

function pausaVigente(cuenta: Cuenta) {
  const hoy = fechaLima();
  return cuenta.pausas.find((pausa) => pausa.desde <= hoy && hoy <= pausa.hasta);
}

function Fila({ cuenta, abrir }: { cuenta: Cuenta; abrir(id: string): void }) {
  const nombre = `${cuenta.nombre_1} ${cuenta.apellido_paterno} ${cuenta.apellido_materno}`;
  const estado = selloCuenta[cuenta.estado];
  const pausa = pausaVigente(cuenta);

  return (
    <Pressable
      accessibilityHint="Abre la cuenta"
      accessibilityLabel={`${nombre}, ${estado.texto}`}
      accessibilityRole="button"
      onPress={() => abrir(cuenta.id)}
      style={({ pressed }) => [estilos.fila, pressed && estilos.filaPresionada]}>
      <View style={estilos.detalle}>
        <Text numberOfLines={2} style={[tipo.nombre, estilos.tinta]}>
          {nombre}
        </Text>
        <Text numberOfLines={1} style={[tipo.apoyo, estilos.apagado, estilos.cifras]}>
          {`${cuenta.dni}, ${textoRol[cuenta.rol].toLowerCase()}`}
        </Text>
        <Sellos>
          <Sello icono={estado.icono} texto={estado.texto} tinta={estado.tono} />
          {pausa ? (
            <Sello icono={Pause} texto={`Pausa hasta ${formatearFecha(pausa.hasta)}`} tinta="aviso" />
          ) : null}
        </Sellos>
      </View>
      <ChevronRight color={color.plomo} size={22} strokeWidth={medida.trazoIcono} />
    </Pressable>
  );
}

export function AdminCuentas({ filtro, cambiarFiltro, items, cargando, error, recargar, abrir }: VistaAdminCuentas) {
  const sinDatos = items.length === 0;

  return (
    <View style={estilos.raiz}>
      <Cabecera
        detalle={
          cargando ? null : (
            <Text style={[tipo.fuerte, estilos.apagado]}>{plural(items.length, 'cuenta', 'cuentas')}</Text>
          )
        }
        titulo="Cuentas"
      />
      <View style={estilos.filtro}>
        <Segmentado cambiar={cambiarFiltro} etiqueta="Estado" opciones={opciones} valor={filtro} />
      </View>

      {sinDatos && cargando ? (
        <FilasEsqueleto conHora={false} />
      ) : sinDatos && error ? (
        <EstadoError mensaje={error} reintentar={recargar} />
      ) : (
        <FlatList
          ItemSeparatorComponent={Separador}
          ListEmptyComponent={<EstadoVacio titulo="No hay cuentas" />}
          ListHeaderComponent={error ? <Aviso banda mensaje={error} /> : undefined}
          contentContainerStyle={estilos.lista}
          data={items}
          keyExtractor={(cuenta) => cuenta.id}
          refreshControl={
            <RefreshControl colors={[color.accion]} onRefresh={recargar} refreshing={cargando} />
          }
          renderItem={({ item }) => <Fila abrir={abrir} cuenta={item} />}
        />
      )}
    </View>
  );
}

function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  cifras: { fontVariant: ['tabular-nums'] },
  filtro: { paddingHorizontal: medida.margen, paddingTop: espacio.s3 },
  lista: { paddingTop: espacio.s2, paddingBottom: espacio.s6 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    minHeight: 72,
    paddingVertical: espacio.s3,
    paddingHorizontal: medida.margen,
  },
  filaPresionada: { backgroundColor: color.hormigon },
  detalle: { flex: 1, minWidth: 0, gap: espacio.s1 },
  separador: { height: medida.linea, backgroundColor: color.hormigon, marginLeft: medida.margen },
});
