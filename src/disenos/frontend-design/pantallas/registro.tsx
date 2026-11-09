import { Check } from 'lucide-react-native';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CamposRegistro, VistaRegistro } from '../../contrato';
import { Campo, Segmentado } from '../componentes/campos';
import { Aviso, Cabecera, Losa } from '../componentes/estructura';
import { color, espacio, medida, tipo, tono } from '../tema';
import { textoRol } from '../textos';

const opcionesRol = [
  { valor: 'operario' as const, etiqueta: textoRol.operario },
  { valor: 'administrativo' as const, etiqueta: textoRol.administrativo },
];

const ayudaRol = {
  operario: 'Marcas solo tu entrada.',
  administrativo: 'Marcas tu entrada y tu salida.',
};

export function Registro({ campos, cambiar, errores, error, enviar, enviando, registrado, irAInicio }: VistaRegistro) {
  if (registrado) {
    return (
      <View style={estilos.raiz}>
        <Cabecera titulo="Cuenta creada" />
        <View style={estilos.hecho}>
          <Check color={tono.exito.texto} size={40} strokeWidth={2.75} />
          <Text style={[tipo.seccion, estilos.tinta]}>Una admin debe aprobarla</Text>
          <Text style={[tipo.cuerpo, estilos.apagado]}>Podrás marcar cuando esté aprobada.</Text>
        </View>
        <Losa alPresionar={irAInicio} etiqueta="Ir a iniciar sesión" />
      </View>
    );
  }

  const texto = (campo: Exclude<keyof CamposRegistro, 'rol'>) => ({
    onChangeText: (valor: string) => cambiar(campo, valor),
    value: campos[campo],
    error: errores[campo],
  });

  return (
    <KeyboardAvoidingView behavior="padding" style={estilos.raiz}>
      <Cabecera titulo="Crear cuenta" volver={irAInicio} />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled">
        <View style={estilos.campos}>
          <Campo
            {...texto('dni')}
            etiqueta="DNI"
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={8}
          />
          <Campo {...texto('nombre_1')} autoCapitalize="words" etiqueta="Primer nombre" />
          <Campo {...texto('nombre_2')} autoCapitalize="words" etiqueta="Segundo nombre" opcional />
          <Campo {...texto('apellido_paterno')} autoCapitalize="words" etiqueta="Apellido paterno" />
          <Campo {...texto('apellido_materno')} autoCapitalize="words" etiqueta="Apellido materno" />
          <Campo
            {...texto('numero_referencia')}
            etiqueta="Número de referencia"
            inputMode="tel"
            keyboardType="phone-pad"
          />

          <View style={estilos.grupo}>
            <Text style={[tipo.etiqueta, estilos.tinta]}>Rol</Text>
            <Segmentado
              cambiar={(valor) => cambiar('rol', valor)}
              etiqueta="Rol"
              opciones={opcionesRol}
              valor={campos.rol}
            />
            {errores.rol ? (
              <Text style={[tipo.etiqueta, estilos.error]}>{errores.rol}</Text>
            ) : campos.rol ? (
              <Text style={[tipo.apoyo, estilos.apagado]}>{ayudaRol[campos.rol]}</Text>
            ) : null}
          </View>

          <Campo
            {...texto('contrasena')}
            autoCapitalize="none"
            autoComplete="new-password"
            etiqueta="Contraseña"
            secureTextEntry
          />
          <Campo
            {...texto('confirmar')}
            autoCapitalize="none"
            autoComplete="new-password"
            etiqueta="Repite la contraseña"
            secureTextEntry
          />
          {error ? <Aviso mensaje={error} /> : null}
        </View>

        <Losa alPresionar={enviar} etiqueta="Crear cuenta" ocupada={enviando && 'Creando cuenta'} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: color.papel },
  contenido: { flexGrow: 1, justifyContent: 'space-between' },
  campos: { padding: medida.margen, paddingBottom: espacio.s6, gap: espacio.s5 },
  grupo: { gap: espacio.s2 },
  tinta: { color: color.grafito },
  apagado: { color: color.plomo },
  error: { color: tono.peligro.texto },
  hecho: { flex: 1, padding: medida.margen, paddingTop: espacio.s6, gap: espacio.s2 },
});
