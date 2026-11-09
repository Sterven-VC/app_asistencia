import { Check, Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, espacio, medida, radio, texto } from '../tema';
import { Senal } from './senal';
import { T } from './texto';

type VarianteBoton = 'primario' | 'neutro' | 'peligro' | 'contorno';

const aspecto: Record<VarianteBoton, { fondo: string; texto: string; borde?: string }> = {
  primario: { fondo: color.accion, texto: color.blanco },
  neutro: { fondo: color.placa, texto: color.tinta },
  peligro: { fondo: color.peligro, texto: color.blanco },
  contorno: { fondo: color.blanco, texto: color.tinta, borde: color.fileteFuerte },
};

type PropsBoton = {
  etiqueta: string;
  alPresionar(): void;
  variante?: VarianteBoton;
  icono?: LucideIcon;
  cargando?: boolean;
  deshabilitado?: boolean;
};

export function Boton({
  etiqueta,
  alPresionar,
  variante = 'primario',
  icono: Icono,
  cargando = false,
  deshabilitado = false,
}: PropsBoton) {
  const a = aspecto[variante];
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      onPress={alPresionar}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      android_ripple={{ color: a.texto === color.blanco ? color.ondaClara : color.ondaOscura }}
      style={[
        estilos.boton,
        { backgroundColor: a.fondo },
        a.borde ? { borderColor: a.borde, borderWidth: 2 * medida.filete } : null,
        deshabilitado && estilos.deshabilitado,
      ]}>
      {({ pressed }) => (
        <>
          {cargando ? (
            <ActivityIndicator color={a.texto} />
          ) : Icono ? (
            <Icono size={medida.icono} color={a.texto} strokeWidth={medida.trazoIcono} />
          ) : null}
          <T v="boton" c={a.texto} lineas={1}>
            {etiqueta}
          </T>
          {pressed ? <View pointerEvents="none" style={estilos.presion} /> : null}
        </>
      )}
    </Pressable>
  );
}

export type AccionPie = {
  etiqueta: string;
  alPresionar(): void;
  variante?: 'primario' | 'neutro' | 'peligro';
  icono?: LucideIcon;
  cargando?: boolean;
  deshabilitado?: boolean;
  /** Cuánto del ancho toma frente a la otra acción. */
  peso?: number;
};

/**
 * La acción de la pantalla es un campo a sangre al pie, al alcance del pulgar.
 * Sigue el mismo principio que el letrero de Marcar.
 */
export function Pie({ acciones }: { acciones: AccionPie[] }) {
  const margen = useSafeAreaInsets();
  return (
    <View style={estilos.pie}>
      {acciones.map((accion) => {
        const a = aspecto[accion.variante ?? 'primario'];
        const inactivo = accion.deshabilitado || accion.cargando;
        const Icono = accion.icono;
        return (
          <Pressable
            key={accion.etiqueta}
            onPress={accion.alPresionar}
            disabled={inactivo}
            accessibilityRole="button"
            accessibilityLabel={accion.etiqueta}
            accessibilityState={{ disabled: !!inactivo, busy: !!accion.cargando }}
            android_ripple={{
              color: a.texto === color.blanco ? color.ondaClara : color.ondaOscura,
            }}
            style={[
              estilos.pieCampo,
              {
                flex: accion.peso ?? 1,
                backgroundColor: a.fondo,
                paddingBottom: margen.bottom,
                minHeight: medida.pie + margen.bottom,
              },
              accion.deshabilitado && estilos.deshabilitado,
            ]}>
            {({ pressed }) => (
              <>
                {accion.cargando ? (
                  <ActivityIndicator color={a.texto} />
                ) : Icono ? (
                  <Icono size={medida.icono} color={a.texto} strokeWidth={medida.trazoCartel} />
                ) : null}
                <T v="seccion" c={a.texto} lineas={1}>
                  {accion.etiqueta}
                </T>
                {pressed ? <View pointerEvents="none" style={estilos.presion} /> : null}
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

type PropsCampo = {
  etiqueta: string;
  valor: string;
  alCambiar(valor: string): void;
  error?: string;
  secreto?: boolean;
  teclado?: KeyboardTypeOptions;
  largo?: number;
  multilinea?: boolean;
  mayusculas?: TextInputProps['autoCapitalize'];
  sugerencia?: string;
  autocompletar?: TextInputProps['autoComplete'];
  corregir?: boolean;
};

export function Campo({
  etiqueta,
  valor,
  alCambiar,
  error,
  secreto = false,
  teclado,
  largo,
  multilinea = false,
  mayusculas = 'sentences',
  sugerencia,
  autocompletar,
  corregir = true,
}: PropsCampo) {
  const [enfocado, setEnfocado] = useState(false);
  const [visible, setVisible] = useState(false);
  const raya = error ? color.peligro : enfocado ? color.accion : color.tinta;

  return (
    <View style={estilos.campo}>
      <T v="rotuloFuerte">{etiqueta}</T>
      <View
        style={[
          estilos.control,
          multilinea && estilos.controlAlto,
          { borderBottomColor: raya },
          error ? { backgroundColor: color.peligroFondo } : null,
        ]}>
        <TextInput
          value={valor}
          onChangeText={alCambiar}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          secureTextEntry={secreto && !visible}
          keyboardType={teclado}
          maxLength={largo}
          multiline={multilinea}
          autoCapitalize={mayusculas}
          autoCorrect={corregir}
          autoComplete={autocompletar}
          placeholder={sugerencia}
          placeholderTextColor={color.tintaMedia}
          selectionColor={color.acento}
          cursorColor={color.accion}
          accessibilityLabel={etiqueta}
          textAlignVertical={multilinea ? 'top' : 'center'}
          maxFontSizeMultiplier={1.4}
          style={[estilos.entrada, multilinea && estilos.entradaAlta]}
        />
        {secreto ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={estilos.ojo}>
            {visible ? (
              <EyeOff size={medida.icono} color={color.tintaMedia} strokeWidth={medida.trazoIcono} />
            ) : (
              <Eye size={medida.icono} color={color.tintaMedia} strokeWidth={medida.trazoIcono} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <LineaEstado clase="aviso" texto={error} c={color.peligroTexto} /> : null}
    </View>
  );
}

/** Señal chica con su texto. El estado nunca va solo en color. */
export function LineaEstado({
  clase,
  texto: contenido,
  c = color.tinta,
}: {
  clase: React.ComponentProps<typeof Senal>['clase'];
  texto: string;
  c?: string;
}) {
  return (
    <View style={estilos.linea}>
      <Senal clase={clase} tam={medida.senalChica} />
      <View style={estilos.flexible}>
        <T v="rotuloFuerte" c={c}>
          {contenido}
        </T>
      </View>
    </View>
  );
}

type PropsOpcion = {
  etiqueta: string;
  icono: LucideIcon;
  activa: boolean;
  alPresionar(): void;
};

/** Opción excluyente. La elegida se vuelve letrero y lleva su marca. */
export function Opcion({ etiqueta, icono: Icono, activa, alPresionar }: PropsOpcion) {
  const tinta = activa ? color.blanco : color.tinta;
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="radio"
      accessibilityLabel={etiqueta}
      accessibilityState={{ selected: activa, checked: activa }}
      android_ripple={{ color: activa ? color.ondaClara : color.ondaOscura }}
      style={[estilos.opcion, activa && estilos.opcionActiva]}>
      <Icono size={medida.icono} color={tinta} strokeWidth={medida.trazoIcono} />
      <T v="fuerte" c={tinta} lineas={2} estilo={estilos.flexible}>
        {etiqueta}
      </T>
      {activa ? (
        <Check size={medida.icono} color={tinta} strokeWidth={medida.trazoCartel} />
      ) : null}
    </Pressable>
  );
}

export function GrupoOpciones({ children }: { children: ReactNode }) {
  return (
    <View accessibilityRole="radiogroup" style={estilos.grupo}>
      {children}
    </View>
  );
}

type PropsPestanas<V extends string> = {
  opciones: { valor: V; etiqueta: string }[];
  valor: V;
  alCambiar(valor: V): void;
};

export function Pestanas<V extends string>({ opciones, valor, alCambiar }: PropsPestanas<V>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      style={estilos.pestanas}
      contentContainerStyle={estilos.pestanasFila}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            key={opcion.valor}
            onPress={() => alCambiar(opcion.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activa }}
            android_ripple={{ color: color.ondaOscura }}
            style={estilos.pestana}>
            <T v="pestana" c={activa ? color.tinta : color.tintaMedia}>
              {opcion.etiqueta}
            </T>
            <View style={[estilos.pestanaRaya, activa && estilos.pestanaRayaActiva]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

type PropsInterruptor = {
  etiqueta: string;
  activo: boolean;
  alCambiar(): void;
  deshabilitado?: boolean;
};

export function Interruptor({ etiqueta, activo, alCambiar, deshabilitado = false }: PropsInterruptor) {
  return (
    <Pressable
      onPress={alCambiar}
      disabled={deshabilitado}
      accessibilityRole="switch"
      accessibilityLabel={etiqueta}
      accessibilityState={{ checked: activo, disabled: deshabilitado }}
      style={[estilos.interruptorToque, deshabilitado && estilos.deshabilitado]}>
      <View style={[estilos.interruptor, activo && estilos.interruptorActivo]}>
        <View style={[estilos.bola, activo && estilos.bolaActiva]}>
          {activo ? (
            <Check size={medida.iconoMini} color={color.accion} strokeWidth={medida.trazoCartel} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  flexible: { flex: 1, minWidth: 0 },
  boton: {
    minHeight: medida.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.l,
    borderRadius: radio.placa,
    overflow: 'hidden',
  },
  deshabilitado: { opacity: 0.6 },
  presion: { ...StyleSheet.absoluteFill, backgroundColor: color.presion },
  pie: { flexDirection: 'row' },
  pieCampo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.m,
    overflow: 'hidden',
  },
  campo: { gap: espacio.s },
  control: {
    minHeight: medida.campo,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.placa,
    borderTopLeftRadius: radio.placa,
    borderTopRightRadius: radio.placa,
    borderBottomWidth: medida.rayaCampo,
  },
  controlAlto: { minHeight: medida.areaTexto, alignItems: 'stretch' },
  entrada: {
    ...texto.fuerte,
    flex: 1,
    minWidth: 0,
    minHeight: medida.campo,
    paddingHorizontal: espacio.l,
    color: color.tinta,
  },
  entradaAlta: { minHeight: medida.areaTexto, paddingTop: espacio.m },
  ojo: {
    width: medida.control,
    minHeight: medida.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linea: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  grupo: { gap: espacio.s },
  opcion: {
    minHeight: medida.opcionAlto,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
    paddingHorizontal: espacio.l,
    backgroundColor: color.placa,
    borderRadius: radio.placa,
    overflow: 'hidden',
  },
  opcionActiva: { backgroundColor: color.accion },
  pestanas: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: color.blanco,
    borderBottomWidth: medida.filete,
    borderBottomColor: color.filete,
  },
  pestanasFila: { flexGrow: 1 },
  pestana: {
    flexGrow: 1,
    minHeight: medida.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.m,
  },
  pestanaRaya: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: medida.rayaPestana,
  },
  pestanaRayaActiva: { backgroundColor: color.accion },
  interruptorToque: {
    minWidth: medida.control,
    minHeight: medida.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interruptor: {
    width: medida.interruptorAncho,
    height: medida.interruptorAlto,
    justifyContent: 'center',
    paddingHorizontal: espacio.xs,
    borderRadius: radio.total,
    backgroundColor: color.fileteFuerte,
  },
  interruptorActivo: { backgroundColor: color.accion, alignItems: 'flex-end' },
  bola: {
    width: medida.interruptorBola,
    height: medida.interruptorBola,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.total,
    backgroundColor: color.blanco,
  },
  bolaActiva: {},
});
