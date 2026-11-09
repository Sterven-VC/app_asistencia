import { FlatList, StyleSheet, Text } from 'react-native';

import type { VistaAdminCuentas } from '../../contrato';
import { Segmentos } from '../componentes/campos';
import { Placa, Placas } from '../componentes/estados';
import { EstadoLista, Fila, Separador } from '../componentes/lista';
import { Marco, Riel } from '../componentes/marco';
import { color, esp, tipo } from '../tema';
import { estadoCuenta, nombreCompleto, textoRol } from '../textos';

const filtros: { valor: VistaAdminCuentas['filtro']; texto: string }[] = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'pendiente', texto: 'Pendientes' },
  { valor: 'activa', texto: 'Activas' },
  { valor: 'desactivada', texto: 'Desactivadas' },
];

export function AdminCuentas(p: VistaAdminCuentas) {
  return (
    <Marco>
      <Riel titulo="Cuentas" dato={p.cargando ? undefined : p.items.length} />
      <Segmentos cambiar={p.cambiarFiltro} opciones={filtros} valor={p.filtro} />
      <EstadoLista
        cargando={p.cargando}
        error={p.error}
        recargar={p.recargar}
        textoVacio="No hay cuentas con este estado"
        vacia={p.items.length === 0}>
        <FlatList
          contentContainerStyle={estilos.lista}
          data={p.items}
          ItemSeparatorComponent={Separador}
          keyExtractor={(cuenta) => cuenta.id}
          onRefresh={p.recargar}
          refreshing={p.cargando}
          renderItem={({ item: cuenta }) => {
            const nombre = nombreCompleto(cuenta);
            const estado = estadoCuenta[cuenta.estado];
            return (
              <Fila
                alPulsar={() => p.abrir(cuenta.id)}
                espera={cuenta.estado === 'pendiente'}
                etiqueta={`${nombre}, ${estado.texto}`}>
                <Text style={estilos.nombre}>{nombre}</Text>
                <Text style={estilos.dato}>{cuenta.dni} · {textoRol[cuenta.rol]}</Text>
                <Placas>
                  <Placa estado={estado} />
                </Placas>
              </Fila>
            );
          }}
        />
      </EstadoLista>
    </Marco>
  );
}

const estilos = StyleSheet.create({
  lista: { paddingBottom: esp[5] },
  nombre: { ...tipo.cuerpoFuerte, color: color.tinta },
  dato: { ...tipo.dato, color: color.tintaMedia },
});
