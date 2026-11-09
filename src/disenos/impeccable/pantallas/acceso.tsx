import { ChevronDown, ChevronUp, HardHat, LogIn, LogOut, RefreshCw, Server, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VistaCuentaNoActiva, VistaIniciarSesion, VistaRegistro } from '../../contrato';
import { formatearFecha } from '@/utils/fechas';
import { Cartel, PalabrasCartel } from '../componentes/cartel';
import { Boton, Campo, GrupoOpciones, LineaEstado, Opcion, Pie } from '../componentes/controles';
import { Aviso } from '../componentes/estados';
import { Banda, base, Seccion } from '../componentes/estructura';
import { Senal, type ClaseSenal } from '../componentes/senal';
import { Logo, T } from '../componentes/texto';
import { color, espacio, medida, tono as coloresCartel, type Tono } from '../tema';

export function IniciarSesion(v: VistaIniciarSesion) {
  const margen = useSafeAreaInsets();
  const [servidorVisible, setServidorVisible] = useState(false);
  const Flecha = servidorVisible ? ChevronUp : ChevronDown;

  return (
    <KeyboardAvoidingView behavior="padding" style={base.pantalla}>
      <StatusBar barStyle="dark-content" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={base.lista}>
        <View style={[estilos.portada, { paddingTop: margen.top + espacio.xl }]}>
          <View style={estilos.logoLibre}>
            <Logo grande />
          </View>
          <T v="portada">Asistencia</T>
        </View>
        <Seccion>
          <Campo
            etiqueta="DNI o usuario admin"
            valor={v.identificador}
            alCambiar={v.cambiarIdentificador}
            mayusculas="none"
            corregir={false}
            largo={14}
            autocompletar="username"
          />
          <Campo
            etiqueta="Contraseña"
            valor={v.contrasena}
            alCambiar={v.cambiarContrasena}
            secreto
            mayusculas="none"
            autocompletar="current-password"
            corregir={false}
          />
          {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
          <Boton etiqueta="Crear cuenta" alPresionar={v.irARegistro} variante="contorno" />
        </Seccion>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Servidor"
          accessibilityState={{ expanded: servidorVisible }}
          android_ripple={{ color: color.ondaOscura }}
          onPress={() => setServidorVisible((visible) => !visible)}
          style={estilos.plegable}>
          <Server size={medida.iconoChico} color={color.tintaMedia} strokeWidth={medida.trazoIcono} />
          <T v="rotuloFuerte" c={color.tintaMedia} estilo={base.flexible}>
            Servidor
          </T>
          <Flecha size={medida.iconoChico} color={color.tintaMedia} strokeWidth={medida.trazoIcono} />
        </Pressable>
        {servidorVisible ? (
          <Seccion>
            <Campo
              etiqueta="Dirección del túnel"
              valor={v.servidor}
              alCambiar={v.cambiarServidor}
              teclado="url"
              mayusculas="none"
              corregir={false}
            />
            <Boton etiqueta="Guardar servidor" alPresionar={v.guardarServidor} variante="neutro" />
            {v.servidorGuardado ? <LineaEstado clase="ok" texto="Servidor guardado" /> : null}
          </Seccion>
        ) : null}
      </ScrollView>
      <Pie acciones={[{ etiqueta: 'Ingresar', alPresionar: v.enviar, cargando: v.enviando, icono: LogIn }]} />
    </KeyboardAvoidingView>
  );
}

export function Registro(v: VistaRegistro) {
  const nombres = [
    { campo: 'nombre_1', etiqueta: 'Primer nombre' },
    { campo: 'nombre_2', etiqueta: 'Segundo nombre (opcional)' },
    { campo: 'apellido_paterno', etiqueta: 'Apellido paterno' },
    { campo: 'apellido_materno', etiqueta: 'Apellido materno' },
  ] as const;

  if (v.registrado) {
    return (
      <View style={base.pantalla}>
        <Banda titulo="Crear cuenta" />
        <Cartel tono="listo" clave="registrado" estilo={base.flexible}>
          <Senal clase="ok" tam={medida.disco} sobreCampo />
          <View style={estilos.cartelPie}>
            <PalabrasCartel lineas={['Cuenta', 'solicitada']} tono="listo" />
            <T v="fuerte" c={coloresCartel.listo.texto}>
              Podrás marcar cuando una admin la apruebe.
            </T>
          </View>
        </Cartel>
        <Pie acciones={[{ etiqueta: 'Ir a iniciar sesión', alPresionar: v.irAInicio, icono: LogIn }]} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={base.pantalla}>
      <Banda titulo="Crear cuenta" volver={v.irAInicio} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <Seccion titulo="Identificación">
          <Campo
            etiqueta="DNI"
            valor={v.campos.dni}
            alCambiar={(x) => v.cambiar('dni', x)}
            error={v.errores.dni}
            teclado="number-pad"
            largo={8}
          />
          {nombres.map(({ campo, etiqueta }) => (
            <Campo
              key={campo}
              etiqueta={etiqueta}
              valor={v.campos[campo]}
              alCambiar={(x) => v.cambiar(campo, x)}
              error={v.errores[campo]}
              mayusculas="words"
            />
          ))}
          <Campo
            etiqueta="Número de referencia"
            valor={v.campos.numero_referencia}
            alCambiar={(x) => v.cambiar('numero_referencia', x)}
            error={v.errores.numero_referencia}
            teclado="phone-pad"
          />
        </Seccion>
        <Seccion titulo="Tipo de personal">
          <GrupoOpciones>
            <Opcion
              etiqueta="Operario"
              icono={HardHat}
              activa={v.campos.rol === 'operario'}
              alPresionar={() => v.cambiar('rol', 'operario')}
            />
            <Opcion
              etiqueta="Administrativo"
              icono={UserRound}
              activa={v.campos.rol === 'administrativo'}
              alPresionar={() => v.cambiar('rol', 'administrativo')}
            />
          </GrupoOpciones>
          {v.errores.rol ? <LineaEstado clase="aviso" texto={v.errores.rol} c={color.peligroTexto} /> : null}
        </Seccion>
        <Seccion titulo="Acceso">
          <Campo
            etiqueta="Contraseña"
            valor={v.campos.contrasena}
            alCambiar={(x) => v.cambiar('contrasena', x)}
            error={v.errores.contrasena}
            secreto
            mayusculas="none"
            autocompletar="new-password"
            corregir={false}
          />
          <Campo
            etiqueta="Repetir contraseña"
            valor={v.campos.confirmar}
            alCambiar={(x) => v.cambiar('confirmar', x)}
            error={v.errores.confirmar}
            secreto
            mayusculas="none"
            autocompletar="new-password"
            corregir={false}
          />
        </Seccion>
        {v.error ? <Aviso tono="peligro" mensaje={v.error} /> : null}
      </ScrollView>
      <Pie acciones={[{ etiqueta: 'Solicitar cuenta', alPresionar: v.enviar, cargando: v.enviando }]} />
    </KeyboardAvoidingView>
  );
}

const estadoCuenta: Record<
  VistaCuentaNoActiva['motivo'],
  { tono: Tono; senal: ClaseSenal; lineas: string[]; detalle: string }
> = {
  pendiente: {
    tono: 'espera',
    senal: 'espera',
    lineas: ['Cuenta', 'por aprobar'],
    detalle: 'Podrás marcar cuando una admin la apruebe.',
  },
  pausada: {
    tono: 'aviso',
    senal: 'aviso',
    lineas: ['Cuenta', 'en pausa'],
    detalle: 'Durante la pausa no puedes marcar.',
  },
  desactivada: {
    tono: 'peligro',
    senal: 'rechazo',
    lineas: ['Cuenta', 'desactivada'],
    detalle: 'Habla con administración para revisar tu acceso.',
  },
};

export function CuentaNoActiva(v: VistaCuentaNoActiva) {
  const margen = useSafeAreaInsets();
  const estado = estadoCuenta[v.motivo];
  const tinta = coloresCartel[estado.tono].texto;
  return (
    <View style={base.pantalla}>
      <StatusBar barStyle="dark-content" />
      <View style={[estilos.cabeza, { paddingTop: margen.top + espacio.s }]}>
        <Logo />
        <T v="titulo" lineas={1}>
          {v.nombre}
        </T>
      </View>
      <Cartel tono={estado.tono} clave={v.motivo} estilo={base.flexible}>
        <Senal clase={estado.senal} tam={medida.disco} sobreCampo={estado.tono !== 'aviso'} />
        <View style={estilos.cartelPie}>
          <PalabrasCartel lineas={estado.lineas} tono={estado.tono} />
          {v.hasta ? (
            <T v="seccion" c={tinta}>
              Hasta el {formatearFecha(v.hasta)}
            </T>
          ) : null}
          <T v="fuerte" c={tinta}>
            {estado.detalle}
          </T>
        </View>
      </Cartel>
      <Pie
        acciones={[
          { etiqueta: 'Salir', alPresionar: v.cerrarSesion, variante: 'neutro', icono: LogOut },
          {
            etiqueta: 'Actualizar',
            alPresionar: v.actualizar,
            cargando: v.actualizando,
            icono: RefreshCw,
            peso: medida.pesoAccion,
          },
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  portada: {
    gap: espacio.l,
    paddingHorizontal: espacio.l,
    paddingBottom: espacio.s,
  },
  logoLibre: { paddingRight: medida.zonaLibre },
  cabeza: {
    gap: espacio.m,
    paddingLeft: espacio.l,
    paddingRight: medida.zonaLibre,
    paddingBottom: espacio.l,
  },
  plegable: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.l,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  cartelPie: { flex: 1, justifyContent: 'flex-end', gap: espacio.m },
});
