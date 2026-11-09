import { Archivo_500Medium } from '@expo-google-fonts/archivo/500Medium';
import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_900Black } from '@expo-google-fonts/archivo/900Black';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import type { TextStyle } from 'react-native';

/**
 * Tokens de la propuesta UI/UX Pro Max.
 * Exaggerated Minimalism + Swiss: tinta sobre blanco, un solo acento, cero radios, cero sombras.
 * Toda relación de contraste está medida sobre `fondo`, salvo que se indique otra.
 */

export const fuentes: Record<string, number> = {
  Archivo_500Medium,
  Archivo_700Bold,
  Archivo_900Black,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
};

export const familia = {
  texto: 'Archivo_500Medium',
  fuerte: 'Archivo_700Bold',
  cartel: 'Archivo_900Black',
  dato: 'JetBrainsMono_500Medium',
  datoFuerte: 'JetBrainsMono_700Bold',
} as const;

export const color = {
  /** Tinta de alto contraste para texto principal y reglas fuertes. */
  tinta: '#2E3338',
  /** Texto secundario. */
  tintaMedia: '#494949',
  /** Metadatos. Contraste 5.33:1 sobre blanco. */
  tintaSuave: '#6B6B6B',
  /** Solo reglas de apoyo, nunca texto. */
  linea: '#C4C4C4',
  fondo: '#FFFFFF',
  fondoAlt: '#F9F9F9',

  /** Acento: barras, foco y estado activo. 3.2:1, nunca texto chico. */
  marca: '#EF6535',
  /** Fondo de la acción principal. Blanco encima da 4.54:1. */
  marcaFuerte: '#DB3A14',
  sobreColor: '#FFFFFF',

  /** Placas de estado sólidas: se leen mejor al sol que un fondo pálido. */
  exito: '#1B5E20',
  /** La tinta encima da 8.5:1. */
  aviso: '#E8A33D',
  peligro: '#B3261E',
  espera: '#3C4A57',

  /** Capa de presión sobre un bloque de color. */
  presion: 'rgba(46, 51, 56, 0.16)',
  presionClara: 'rgba(46, 51, 56, 0.06)',
  velo: 'rgba(46, 51, 56, 0.64)',
  transparente: 'transparent',
} as const;

export const esp = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
} as const;

/** Margen lateral de toda pantalla. */
export const margen = 16;

export const alto = {
  toque: 48,
  control: 56,
  riel: 56,
  rielLogo: 64,
  placa: 28,
  celda: 52,
  celdaAncha: 64,
  bloque: 72,
  /** Altura mínima del bloque de marcar: lo que un pulgar con guante alcanza sin apuntar. */
  bloqueMarcar: 176,
  tipo: 76,
  motivo: 112,
  logo: 40,
  esqueletoLinea: 14,
  esqueletoPlaca: 22,
} as const;

export const ancho = {
  logo: 133,
  toque: 48,
  /** Cuadro superior derecho reservado para el botón global (56 px) y su aire. */
  zonaLibre: 64,
  esqueletoHora: 72,
  esqueletoPlaca: 96,
  celdaTodas: 76,
} as const;

export const borde = {
  fino: 1,
  regla: 2,
  acento: 4,
  barra: 6,
} as const;

export const icono = {
  chico: 16,
  base: 20,
  medio: 24,
  grande: 32,
  cartel: 40,
  trazo: 2,
  trazoCartel: 2.4,
} as const;

export const movimiento = {
  corta: 180,
  hoja: 280,
  pulso: 700,
  opacidadPulso: 0.45,
  presionBoton: 0.98,
} as const;

export const hoja = {
  /** Fracción de pantalla que puede ocupar una hoja. */
  altoMaximo: '86%',
} as const;

/** Por debajo de este ancho se recorta el aire y el cartel, no la letra del cuerpo. */
export const anchoAngosto = 360;

export const tipo = {
  titulo: { fontFamily: familia.cartel, fontSize: 40, lineHeight: 46, letterSpacing: -1.6 },
  tituloChico: { fontFamily: familia.cartel, fontSize: 34, lineHeight: 40, letterSpacing: -1.3 },
  nombre: { fontFamily: familia.cartel, fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  hoja: { fontFamily: familia.cartel, fontSize: 26, lineHeight: 30, letterSpacing: -0.7 },
  bloque: { fontFamily: familia.cartel, fontSize: 24, lineHeight: 28, letterSpacing: -0.5 },
  antetitulo: { fontFamily: familia.cartel, fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  seccion: { fontFamily: familia.fuerte, fontSize: 17, lineHeight: 22 },
  cuerpo: { fontFamily: familia.texto, fontSize: 17, lineHeight: 24 },
  cuerpoFuerte: { fontFamily: familia.fuerte, fontSize: 17, lineHeight: 24 },
  etiqueta: { fontFamily: familia.fuerte, fontSize: 15, lineHeight: 20 },
  meta: { fontFamily: familia.texto, fontSize: 15, lineHeight: 20 },
  placa: { fontFamily: familia.fuerte, fontSize: 14, lineHeight: 18 },
  boton: { fontFamily: familia.fuerte, fontSize: 17, lineHeight: 22 },
  entrada: { fontFamily: familia.texto, fontSize: 17 },
  entradaDato: { fontFamily: familia.dato, fontSize: 17 },
  dato: { fontFamily: familia.dato, fontSize: 15, lineHeight: 20 },
  datoFuerte: { fontFamily: familia.datoFuerte, fontSize: 17, lineHeight: 22 },
  conteo: { fontFamily: familia.datoFuerte, fontSize: 24, lineHeight: 30 },
  horaFila: { fontFamily: familia.datoFuerte, fontSize: 24, lineHeight: 28, letterSpacing: -0.6 },
  hora: { fontFamily: familia.datoFuerte, fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
  extra: { fontFamily: familia.datoFuerte, fontSize: 40, lineHeight: 46, letterSpacing: -1.4 },
  horaCartel: { fontFamily: familia.datoFuerte, fontSize: 72, lineHeight: 78, letterSpacing: -3 },
  cero: { fontFamily: familia.datoFuerte, fontSize: 96, lineHeight: 104, letterSpacing: -4 },
} as const satisfies Record<string, TextStyle>;

/** Letra de cartel: pesa 900 y se aprieta como pide el estilo. */
export function cartel(tamano: number): TextStyle {
  return {
    fontFamily: familia.cartel,
    fontSize: tamano,
    lineHeight: Math.round(tamano * 1.06),
    letterSpacing: -tamano * 0.04,
  };
}

/** Archivo Black mide hasta 0.64 em por letra con el tracking ya restado: se calcula con el peor caso. */
const EM_POR_LETRA = 0.64;

/** Mayor tamaño con el que una palabra entra en una línea del ancho disponible. */
export function ajustarCartel(palabra: string, disponible: number, maximo: number): number {
  return Math.min(maximo, Math.floor(disponible / (Math.max(palabra.length, 1) * EM_POR_LETRA)));
}

export const CARTEL_MARCAR = 96;
export const CARTEL_PORTADA = 64;
export const CARTEL_NOMBRE = 44;
