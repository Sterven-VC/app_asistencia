import { Barlow_500Medium } from '@expo-google-fonts/barlow/500Medium';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { Easing, type TextStyle } from 'react-native';

/**
 * "La mira": el día se lee como una mira topográfica.
 * Tinta grafito sobre papel blanco, el máximo contraste al sol.
 * El naranja solo aparece donde se actúa o donde hay una lectura.
 */

export const fuentes: Record<string, number> = {
  Barlow_500Medium,
  Barlow_600SemiBold,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
};

const familia = {
  texto: 'Barlow_500Medium',
  textoFuerte: 'Barlow_600SemiBold',
  rotulo: 'BarlowCondensed_600SemiBold',
  lectura: 'BarlowCondensed_700Bold',
} as const;

export const color = {
  papel: '#FFFFFF',
  hormigon: '#ECEEF0',
  hormigonFuerte: '#CDD2D6',
  grafito: '#2E3338',
  plomo: '#565D64',
  accion: '#DB3A14',
  reticula: '#EF6535',
  tinte: '#FDF0E8',
  sobreAccion: '#FFFFFF',
  presion: 'rgba(0, 0, 0, 0.12)',
  presionClara: 'rgba(46, 51, 56, 0.08)',
  velo: 'rgba(20, 24, 27, 0.55)',
  senal: '#E8A33D',
} as const;

export type TonoEstado = 'exito' | 'aviso' | 'peligro' | 'espera' | 'neutro' | 'accion';

export const tono: Record<TonoEstado, { texto: string; fondo: string; borde: string }> = {
  exito: { texto: '#1B5E20', fondo: '#E8F5E9', borde: '#2E7D32' },
  aviso: { texto: '#8A5D00', fondo: '#FDF4E6', borde: '#E8A33D' },
  peligro: { texto: '#B3261E', fondo: '#FCEAE5', borde: '#C62828' },
  espera: { texto: '#3C4A57', fondo: '#EEF1F4', borde: '#3C4A57' },
  neutro: { texto: '#565D64', fondo: '#FFFFFF', borde: '#CDD2D6' },
  accion: { texto: '#2E3338', fondo: '#FDF0E8', borde: '#EF6535' },
};

export const espacio = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 24, s6: 32, s7: 48 } as const;

export const medida = {
  margen: 16,
  toque: 48,
  control: 56,
  /** Cuadro superior derecho que ocupa el botón de cambio de diseño, con su aire. */
  esquinaLibre: 64,
  miraAncha: 64,
  miraMedia: 52,
  miraAngosta: 22,
  /** Altura de cada diente de la mira angosta. */
  dienteAngosto: 8,
  losa: 76,
  /** Ancho de la columna de horas en listas: cabe 00:00 a 34 px. */
  columnaHora: 84,
  losaMarcar: 164,
  losaMarcarCompacta: 112,
  bandaEstado: 48,
  linea: 2,
  lineaFuerte: 3,
  tapaActiva: 4,
  radio: 4,
  icono: 20,
  iconoChico: 16,
  trazoIcono: 2.25,
} as const;

export const movimiento = {
  corta: 180,
  media: 260,
  hoja: 300,
  barrido: 900,
  entrada: Easing.bezier(0.2, 0.8, 0.2, 1),
  salida: Easing.bezier(0.4, 0, 1, 1),
} as const;

const cifras: TextStyle = { fontVariant: ['tabular-nums'] };

export const tipo = {
  accion: { fontFamily: familia.lectura, fontSize: 60, lineHeight: 60 },
  accionCompacta: { fontFamily: familia.lectura, fontSize: 44, lineHeight: 46 },
  lecturaGigante: { fontFamily: familia.lectura, fontSize: 76, lineHeight: 78, ...cifras },
  lectura: { fontFamily: familia.lectura, fontSize: 46, lineHeight: 48, ...cifras },
  lecturaAngosta: { fontFamily: familia.lectura, fontSize: 38, lineHeight: 44, ...cifras },
  marca: { fontFamily: familia.lectura, fontSize: 56, lineHeight: 58 },
  titulo: { fontFamily: familia.lectura, fontSize: 36, lineHeight: 40 },
  hora: { fontFamily: familia.lectura, fontSize: 34, lineHeight: 38, ...cifras },
  losa: { fontFamily: familia.lectura, fontSize: 30, lineHeight: 34 },
  seccion: { fontFamily: familia.lectura, fontSize: 24, lineHeight: 28 },
  nombre: { fontFamily: familia.rotulo, fontSize: 22, lineHeight: 26 },
  rotulo: { fontFamily: familia.rotulo, fontSize: 19, lineHeight: 22 },
  sello: { fontFamily: familia.rotulo, fontSize: 16, lineHeight: 19 },
  nav: { fontFamily: familia.rotulo, fontSize: 14, lineHeight: 16 },
  cifraMira: { fontFamily: familia.lectura, ...cifras },
  cuerpo: { fontFamily: familia.texto, fontSize: 17, lineHeight: 24 },
  fuerte: { fontFamily: familia.textoFuerte, fontSize: 17, lineHeight: 24 },
  apoyo: { fontFamily: familia.texto, fontSize: 15, lineHeight: 21 },
  etiqueta: { fontFamily: familia.textoFuerte, fontSize: 15, lineHeight: 18 },
  campo: { fontFamily: familia.texto, fontSize: 18, lineHeight: 24 },
} as const satisfies Record<string, TextStyle>;
