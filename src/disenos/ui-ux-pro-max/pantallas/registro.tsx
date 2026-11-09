import { HardHat, Monitor } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { VistaRegistro } from '../../contrato';
import { BloqueAccion } from '../componentes/acciones';
import { Campo, Opcion } from '../componentes/campos';
import { Aviso } from '../componentes/estados';
import { Marco, Riel, RielVolver } from '../componentes/marco';
import { ajustarCartel, CARTEL_PORTADA, cartel, color, esp, margen, tipo } from '../tema';

export function Registro(p: VistaRegistro) {
  const { width } = useWindowDimensions();
  const c = p.campos;

  if (p.registrado) {
    const palabra = 'En revisión';
    return (
      <Marco>
        <View style={estilos.hecho}>
          <Text
            accessibilityRole="header"
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[cartel(ajustarCartel(palabra, width - margen * 2, CARTEL_PORTADA)), estilos.tinta]}>
            {palabra}
          </Text>
          <Text style={estilos.nota}>Una admin debe aprobar tu cuenta antes de que puedas marcar.</Text>
        </View>
        <BloqueAccion alPulsar={p.irAInicio} pie texto="Ir a inicio" />
      </Marco>
    );
  }

  return (
    <Marco>
      <RielVolver volver={p.irAInicio} />
      <Riel titulo="Tus datos" />
      <ScrollView contentContainerStyle={estilos.cuerpo} keyboardShouldPersistTaps="handled">
        <Campo
          cambiar={(v) => p.cambiar('dni', v)}
          dato
          error={p.errores.dni}
          etiqueta="DNI"
          keyboardType="number-pad"
          maxLength={8}
          valor={c.dni}
        />
        <Campo
          autoCapitalize="words"
          cambiar={(v) => p.cambiar('nombre_1', v)}
          error={p.errores.nombre_1}
          etiqueta="Primer nombre"
          valor={c.nombre_1}
        />
        <Campo
          autoCapitalize="words"
          cambiar={(v) => p.cambiar('nombre_2', v)}
          error={p.errores.nombre_2}
          etiqueta="Segundo nombre (opcional)"
          valor={c.nombre_2}
        />
        <Campo
          autoCapitalize="words"
          cambiar={(v) => p.cambiar('apellido_paterno', v)}
          error={p.errores.apellido_paterno}
          etiqueta="Apellido paterno"
          valor={c.apellido_paterno}
        />
        <Campo
          autoCapitalize="words"
          cambiar={(v) => p.cambiar('apellido_materno', v)}
          error={p.errores.apellido_materno}
          etiqueta="Apellido materno"
          valor={c.apellido_materno}
        />
        <Campo
          cambiar={(v) => p.cambiar('numero_referencia', v)}
          dato
          error={p.errores.numero_referencia}
          etiqueta="Número de referencia"
          keyboardType="phone-pad"
          valor={c.numero_referencia}
        />

        <View accessibilityRole="radiogroup" style={estilos.grupo}>
          <Text style={estilos.etiqueta}>Dónde trabajas</Text>
          <View style={estilos.opciones}>
            <Opcion
              alPulsar={() => p.cambiar('rol', 'operario')}
              elegida={c.rol === 'operario'}
              icono={HardHat}
              texto="Operario"
              vertical
            />
            <Opcion
              alPulsar={() => p.cambiar('rol', 'administrativo')}
              elegida={c.rol === 'administrativo'}
              icono={Monitor}
              texto="Administrativo"
              vertical
            />
          </View>
          {p.errores.rol ? <Text style={estilos.error}>{p.errores.rol}</Text> : null}
        </View>

        <Campo
          autoCapitalize="none"
          autoComplete="new-password"
          cambiar={(v) => p.cambiar('contrasena', v)}
          error={p.errores.contrasena}
          etiqueta="Contraseña"
          secreto
          valor={c.contrasena}
        />
        <Campo
          autoCapitalize="none"
          autoComplete="new-password"
          cambiar={(v) => p.cambiar('confirmar', v)}
          error={p.errores.confirmar}
          etiqueta="Repite la contraseña"
          secreto
          valor={c.confirmar}
        />
      </ScrollView>

      {p.error ? <Aviso texto={p.error} /> : null}
      <BloqueAccion alPulsar={p.enviar} cargando={p.enviando} pie texto="Crear cuenta" />
    </Marco>
  );
}

const estilos = StyleSheet.create({
  tinta: { color: color.tinta },
  hecho: { flex: 1, justifyContent: 'flex-end', gap: esp[3], padding: margen },
  nota: { ...tipo.cuerpo, color: color.tintaMedia },
  cuerpo: { gap: esp[4], paddingHorizontal: margen, paddingTop: esp[3], paddingBottom: esp[5] },
  grupo: { gap: esp[2] },
  etiqueta: { ...tipo.etiqueta, color: color.tinta },
  opciones: { flexDirection: 'row', gap: esp[2] },
  error: { ...tipo.etiqueta, color: color.peligro },
});
