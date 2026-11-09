import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  type LucideIcon,
  TriangleAlert,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { fechaLima, formatearFecha } from '@/utils/fechas';
import { alto, ancho, borde, color, esp, icono, tipo } from '../tema';

type PropsCampo = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> & {
  etiqueta: string;
  valor: string;
  cambiar(valor: string): void;
  error?: string;
  /** Usa la letra de datos: DNI, teléfono, fecha, dirección. */
  dato?: boolean;
  secreto?: boolean;
  alto?: number;
};

export function Campo({
  etiqueta,
  valor,
  cambiar,
  error,
  dato = false,
  secreto = false,
  alto: altoCampo,
  ...resto
}: PropsCampo) {
  const [foco, setFoco] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <View
        style={[
          estilos.control,
          foco && estilos.controlFoco,
          error ? estilos.controlError : null,
          altoCampo ? { minHeight: altoCampo } : null,
        ]}>
        <TextInput
          accessibilityLabel={etiqueta}
          onBlur={() => setFoco(false)}
          onChangeText={cambiar}
          onFocus={() => setFoco(true)}
          placeholderTextColor={color.tintaSuave}
          secureTextEntry={secreto && !visible}
          selectionColor={color.marca}
          style={[
            dato ? tipo.entradaDato : tipo.entrada,
            estilos.entrada,
            altoCampo ? estilos.entradaAlta : null,
          ]}
          textAlignVertical={altoCampo ? 'top' : 'center'}
          value={valor}
          {...resto}
        />
        {secreto ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((v) => !v)}
            style={estilos.ojo}>
            {visible ? (
              <EyeOff color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
            ) : (
              <Eye color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View accessibilityLiveRegion="polite" style={estilos.error}>
          <TriangleAlert color={color.peligro} size={icono.chico} strokeWidth={icono.trazoCartel} />
          <Text style={estilos.textoError}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function enmascararFecha(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

/** Fecha AAAA-MM-DD escrita solo con números: el guion lo pone el campo. */
export function CampoFecha({
  etiqueta,
  valor,
  cambiar,
  editable,
}: {
  etiqueta: string;
  valor: string;
  cambiar(valor: string): void;
  editable?: boolean;
}) {
  return (
    <Campo
      cambiar={(texto) => cambiar(enmascararFecha(texto))}
      dato
      editable={editable}
      etiqueta={etiqueta}
      keyboardType="number-pad"
      maxLength={10}
      placeholder="AAAA-MM-DD"
      valor={valor}
    />
  );
}

function moverDia(fecha: string, dias: number): string {
  const base = new Date(`${fecha}T12:00:00-05:00`);
  base.setUTCDate(base.getUTCDate() + dias);
  return fechaLima(base);
}

/** Recorrer los días de uno en uno: la admin revisa hoy y ayer, casi nunca más atrás. */
export function SelectorDia({
  fecha,
  cambiar,
}: {
  fecha: string | null;
  cambiar(valor: string | null): void;
}) {
  const hoy = fechaLima();
  const base = fecha ?? hoy;
  const enHoy = base >= hoy;

  return (
    <View style={estilos.dia}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Día anterior"
        onPress={() => cambiar(moverDia(base, -1))}
        style={({ pressed }) => [estilos.diaFlecha, pressed && estilos.diaPresionado]}>
        <ChevronLeft color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
      </Pressable>
      <View accessibilityLiveRegion="polite" style={estilos.diaCentro}>
        <Text numberOfLines={1} style={estilos.diaTexto}>
          {fecha ? formatearFecha(fecha) : 'Todas'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Día siguiente"
        accessibilityState={{ disabled: enHoy }}
        disabled={enHoy}
        onPress={() => cambiar(moverDia(base, 1))}
        style={({ pressed }) => [
          estilos.diaFlecha,
          enHoy && estilos.diaInactivo,
          pressed && estilos.diaPresionado,
        ]}>
        <ChevronRight color={color.tinta} size={icono.medio} strokeWidth={icono.trazo} />
      </Pressable>
      {/* Una sola celda alterna: sin fecha lleva a hoy; con fecha vuelve a todas. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={fecha ? 'Ver todas las fechas' : 'Ver hoy'}
        onPress={() => cambiar(fecha ? null : hoy)}
        style={({ pressed }) => [estilos.diaTodas, pressed && estilos.diaPresionado]}>
        <Text style={[tipo.placa, { color: color.tinta }]}>{fecha ? 'Todas' : 'Hoy'}</Text>
      </Pressable>
    </View>
  );
}

/** Opción grande. Elegida se invierte a tinta y además lleva check. */
export function Opcion({
  texto,
  elegida,
  alPulsar,
  icono: Icono,
  vertical = false,
  estilo,
}: {
  texto: string;
  elegida: boolean;
  alPulsar(): void;
  icono?: LucideIcon;
  vertical?: boolean;
  estilo?: StyleProp<ViewStyle>;
}) {
  const tinta = elegida ? color.sobreColor : color.tinta;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={texto}
      accessibilityState={{ selected: elegida, checked: elegida }}
      onPress={alPulsar}
      style={({ pressed }) => [
        vertical ? estilos.opcionVertical : estilos.opcion,
        elegida && estilos.opcionElegida,
        pressed && !elegida && estilos.opcionPresionada,
        estilo,
      ]}>
      {Icono ? <Icono color={tinta} size={icono.medio} strokeWidth={icono.trazo} /> : null}
      <Text
        numberOfLines={vertical ? 1 : 2}
        style={[vertical ? tipo.placa : tipo.cuerpoFuerte, estilos.opcionTexto, { color: tinta }]}>
        {texto}
      </Text>
      {elegida && !vertical ? (
        <Check color={tinta} size={icono.medio} strokeWidth={icono.trazoCartel} />
      ) : null}
    </Pressable>
  );
}

/** Casilla de filtro: la marca dibuja el estado, no solo el color. */
export function Casilla({
  texto,
  marcada,
  cambiar,
}: {
  texto: string;
  marcada: boolean;
  cambiar(valor: boolean): void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={texto}
      accessibilityState={{ checked: marcada }}
      onPress={() => cambiar(!marcada)}
      style={estilos.casilla}>
      <View style={[estilos.caja, marcada && estilos.cajaMarcada]}>
        {marcada ? (
          <Check color={color.sobreColor} size={icono.base} strokeWidth={icono.trazoCartel} />
        ) : null}
      </View>
      <Text style={[tipo.cuerpoFuerte, estilos.casillaTexto]}>{texto}</Text>
    </Pressable>
  );
}

/** Filtro de borde a borde. Cada celda crece según su rótulo para entrar en 320 px. */
export function Segmentos<T extends string>({
  opciones,
  valor,
  cambiar,
}: {
  opciones: { valor: T; texto: string }[];
  valor: T;
  cambiar(valor: T): void;
}) {
  return (
    <View accessibilityRole="tablist" style={estilos.segmentos}>
      {opciones.map((opcion, i) => {
        const activa = opcion.valor === valor;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={opcion.texto}
            accessibilityState={{ selected: activa }}
            key={opcion.valor}
            onPress={() => cambiar(opcion.valor)}
            style={[
              estilos.segmento,
              { flexGrow: opcion.texto.length + 1 },
              i > 0 && estilos.segmentoRegla,
              activa && estilos.segmentoActivo,
            ]}>
            <Text
              numberOfLines={1}
              style={[tipo.placa, { color: activa ? color.sobreColor : color.tinta }]}>
              {opcion.texto}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: esp[2] },
  etiqueta: { ...tipo.etiqueta, color: color.tinta },
  control: {
    minHeight: alto.control,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: borde.regla,
    borderColor: color.tinta,
    backgroundColor: color.fondo,
  },
  controlFoco: { borderColor: color.marca },
  controlError: { borderColor: color.peligro },
  entrada: {
    flex: 1,
    minHeight: alto.control - borde.regla * 2,
    minWidth: 0,
    paddingHorizontal: esp[3],
    color: color.tinta,
    outlineWidth: 0,
  },
  entradaAlta: { paddingVertical: esp[3], alignSelf: 'stretch' },
  ojo: {
    width: ancho.toque,
    height: alto.toque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { flexDirection: 'row', alignItems: 'center', gap: esp[1] },
  textoError: { ...tipo.etiqueta, color: color.peligro, flex: 1 },
  dia: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: borde.regla,
    borderColor: color.tinta,
    minHeight: alto.control,
  },
  diaFlecha: { width: ancho.toque, alignItems: 'center', justifyContent: 'center' },
  diaInactivo: { opacity: 0.35 },
  diaPresionado: { backgroundColor: color.presionClara },
  diaCentro: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center' },
  diaTexto: { ...tipo.datoFuerte, color: color.tinta },
  diaTodas: {
    width: ancho.celdaTodas,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: borde.regla,
    borderLeftColor: color.tinta,
  },
  opcion: {
    minHeight: alto.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[3],
    paddingHorizontal: esp[3],
    borderWidth: borde.regla,
    borderColor: color.tinta,
    backgroundColor: color.fondo,
  },
  opcionVertical: {
    flex: 1,
    minWidth: 0,
    minHeight: alto.tipo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: esp[1],
    paddingHorizontal: esp[1],
    borderWidth: borde.regla,
    borderColor: color.tinta,
    backgroundColor: color.fondo,
  },
  opcionElegida: { backgroundColor: color.tinta },
  opcionPresionada: { backgroundColor: color.fondoAlt },
  opcionTexto: { flexShrink: 1 },
  casilla: {
    minHeight: alto.control,
    flexDirection: 'row',
    alignItems: 'center',
    gap: esp[3],
  },
  caja: {
    width: esp[5] + esp[1],
    height: esp[5] + esp[1],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borde.regla,
    borderColor: color.tinta,
  },
  cajaMarcada: { backgroundColor: color.tinta },
  casillaTexto: { color: color.tinta, flexShrink: 1 },
  segmentos: {
    flexDirection: 'row',
    borderTopWidth: borde.regla,
    borderBottomWidth: borde.regla,
    borderColor: color.tinta,
  },
  segmento: {
    flexBasis: 0,
    minHeight: alto.toque,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: esp[1],
  },
  segmentoRegla: { borderLeftWidth: borde.fino, borderLeftColor: color.tinta },
  segmentoActivo: { backgroundColor: color.tinta },
});
