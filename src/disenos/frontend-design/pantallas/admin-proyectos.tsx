import { Check, Pause } from 'lucide-react-native';
import { FlatList, KeyboardAvoidingView, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { Proyecto } from '@/tipos';
import type { VistaAdminProyectos } from '../../contrato';
import { Campo } from '../componentes/campos';
import { EstadoError, EstadoVacio, FilasEsqueleto } from '../componentes/estados';
import { Aviso, Boton, Cabecera } from '../componentes/estructura';
import { Sello } from '../componentes/sello';
import { color, espacio, medida, tipo } from '../tema';

function Fila({ proyecto, alternar }: { proyecto: Proyecto; alternar(id: string): void }) {
  return (
    <View style={estilos.fila}>
      <View style={estilos.detalle}>
        <Text
          numberOfLines={2}
          style={[tipo.nombre, proyecto.activo ? estilos.tinta : estilos.apagado]}>
          {proyecto.nombre}
        </Text>
        <Sello
          icono={proyecto.activo ? Check : Pause}
          texto={proyecto.activo ? 'Activo' : 'Inactivo'}
          tinta={proyecto.activo ? 'exito' : 'neutro'}
        />
      </View>
      <Boton
        alPresionar={() => alternar(proyecto.id)}
        chico
        etiqueta={proyecto.activo ? 'Desactivar' : 'Activar'}
      />
    </View>
  );
}

export function AdminProyectos(props: VistaAdminProyectos) {
  const { items, cargando, error, recargar, nombre, cambiarNombre, crear, creando, alternarActivo } = props;
  const sinDatos = items.length === 0;

  return (
    <KeyboardAvoidingView behavior="padding" style={estilos.raiz}>
      <Cabecera titulo="Proyectos" />
      <View style={estilos.alta}>
        <View style={estilos.altaCampo}>
          <Campo
            autoCapitalize="sentences"
            etiqueta="Nuevo proyecto"
            onChangeText={cambiarNombre}
            onSubmitEditing={crear}
            returnKeyType="done"
            value={nombre}
          />
        </View>
        <Boton
          alPresionar={crear}
          deshabilitado={nombre.trim().length === 0}
          etiqueta="Crear"
          ocupado={creando}
        />
      </View>

      {sinDatos && cargando ? (
        <FilasEsqueleto conHora={false} />
      ) : sinDatos && error ? (
        <EstadoError mensaje={error} reintentar={recargar} />
      ) : (
        <FlatList
          ItemSeparatorComponent={Separador}
          ListEmptyComponent={
            <EstadoVacio detalle="Crea el primero para asignarlo a una marcación." titulo="Sin proyectos" />
          }
          ListHeaderComponent={error ? <Aviso banda mensaje={error} /> : undefined}
          contentContainerStyle={estilos.lista}
          data={items}
          keyExtractor={(proyecto) => proyecto.id}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl colors={[color.accion]} onRefresh={recargar} refreshing={cargando} />
          }
          renderItem={({ item }) => <Fila alternar={alternarActivo} proyecto={item} />}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  alta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espacio.s2,
    padding: medida.margen,
  },
  altaCampo: { flex: 1, minWidth: 0 },
  lista: { paddingBottom: espacio.s6 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s3,
    paddingVertical: espacio.s3,
    paddingHorizontal: medida.margen,
  },
  detalle: { flex: 1, minWidth: 0, gap: espacio.s1 },
  separador: { height: medida.linea, backgroundColor: color.hormigon, marginLeft: medida.margen },
});
