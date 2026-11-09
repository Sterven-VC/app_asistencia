import { Plus } from 'lucide-react-native';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';

import type { VistaAdminProyectos } from '../../contrato';
import { Boton, Campo, Interruptor, LineaEstado } from '../componentes/controles';
import { Aviso, Esqueleto, Vacio } from '../componentes/estados';
import { Banda, base, Fila, Seccion } from '../componentes/estructura';
import { T } from '../componentes/texto';

export function AdminProyectos(v: VistaAdminProyectos) {
  return (
    <KeyboardAvoidingView behavior="padding" style={base.pantalla}>
      <Banda titulo="Proyectos" cuenta={v.items.length} />
      <FlatList
        data={v.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={base.lista}
        keyboardShouldPersistTaps="handled"
        onRefresh={v.recargar}
        refreshing={v.cargando}
        ListHeaderComponent={(
          <Seccion>
            <Campo etiqueta="Nombre del proyecto" valor={v.nombre} alCambiar={v.cambiarNombre} />
            <Boton etiqueta="Agregar proyecto" alPresionar={v.crear} cargando={v.creando} deshabilitado={!v.nombre.trim()} icono={Plus} />
            {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
          </Seccion>
        )}
        ListEmptyComponent={v.cargando ? <Esqueleto filas={3} /> : !v.error ? <Vacio titulo="Aún no hay proyectos" /> : undefined}
        renderItem={({ item }) => (
          <Fila>
            <View style={[base.flexible, base.grupoTexto]}>
              <T v="fuerte">{item.nombre}</T>
              <LineaEstado clase={item.activo ? 'ok' : 'apagado'} texto={item.activo ? 'Activo' : 'Inactivo'} />
            </View>
            <Interruptor etiqueta={`${item.activo ? 'Desactivar' : 'Activar'} ${item.nombre}`} activo={item.activo}
              alCambiar={() => v.alternarActivo(item.id)} deshabilitado={v.creando} />
          </Fila>
        )}
      />
    </KeyboardAvoidingView>
  );
}
