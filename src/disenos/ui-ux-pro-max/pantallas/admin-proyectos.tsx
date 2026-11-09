import { Check, CircleMinus, FolderPlus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { VistaAdminProyectos } from '../../contrato';
import { BloqueAccion, Boton } from '../componentes/acciones';
import { Campo } from '../componentes/campos';
import { Aviso, Placa } from '../componentes/estados';
import { Hoja } from '../componentes/hoja';
import { EstadoLista, Separador } from '../componentes/lista';
import { Marco, Regla, Riel } from '../componentes/marco';
import { color, esp, margen, tipo } from '../tema';

export function AdminProyectos(p: VistaAdminProyectos) {
  const [nuevo, setNuevo] = useState(false);
  const estabaCreando = useRef(false);

  useEffect(() => {
    if (estabaCreando.current && !p.creando && !p.nombre) setNuevo(false);
    estabaCreando.current = p.creando;
  }, [p.creando, p.nombre]);

  return (
    <Marco>
      <Riel titulo="Proyectos" dato={p.cargando ? undefined : p.items.length} />
      <Regla />
      <EstadoLista
        cargando={p.cargando}
        error={p.error}
        recargar={p.recargar}
        textoVacio="Aún no hay proyectos"
        vacia={p.items.length === 0}>
        <FlatList
          contentContainerStyle={estilos.lista}
          data={p.items}
          ItemSeparatorComponent={Separador}
          keyExtractor={(proyecto) => proyecto.id}
          onRefresh={p.recargar}
          refreshing={p.cargando}
          renderItem={({ item: proyecto }) => (
            <View style={estilos.fila}>
              <View style={estilos.datos}>
                <Text style={estilos.nombre}>{proyecto.nombre}</Text>
                <Placa estado={proyecto.activo
                  ? { texto: 'Activo', tono: 'exito', icono: Check }
                  : { texto: 'Inactivo', tono: 'neutro', icono: CircleMinus }} />
              </View>
              <Boton alPulsar={() => p.alternarActivo(proyecto.id)} deshabilitado={p.creando} estilo={estilos.alternar} texto={proyecto.activo ? 'Desactivar' : 'Activar'} />
            </View>
          )}
        />
      </EstadoLista>

      <BloqueAccion alPulsar={() => setNuevo(true)} icono={FolderPlus} texto="Crear proyecto" />
      <Hoja
        cerrar={() => { if (!p.creando) setNuevo(false); }}
        pie={<BloqueAccion alPulsar={p.crear} cargando={p.creando} compacto deshabilitado={!p.nombre.trim()} pie texto="Guardar proyecto" />}
        titulo="Nuevo proyecto"
        visible={nuevo}>
        <Campo cambiar={p.cambiarNombre} editable={!p.creando} etiqueta="Nombre del proyecto" valor={p.nombre} />
        {p.error ? <Aviso texto={p.error} /> : null}
      </Hoja>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  lista: { paddingBottom: esp[5] },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: esp[3], padding: margen },
  datos: { flex: 1, minWidth: 0, gap: esp[1] },
  nombre: { ...tipo.cuerpoFuerte, color: color.tinta },
  alternar: { paddingHorizontal: esp[2] },
});
