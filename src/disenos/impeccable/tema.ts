import type { TextStyle } from 'react-native';

/**
 * Señalética de obra. Los campos planos llevan el mensaje y la forma de la señal
 * dice el estado. Todo color y medida de esta propuesta sale de aquí.
 */

export const color = {
  accion: '#DB3A14',
  acento: '#EF6535',

  tinta: '#1D2023',
  tintaMedia: '#4A5157',
  blanco: '#FFFFFF',
  placa: '#EDEFEE',
  filete: '#D2D6D5',
  fileteFuerte: '#868D92',

  banda: '#2E3338',
  bandaTexto: '#C9CFD4',

  listo: '#1B5E20',
  listoFondo: '#E6F2E7',
  aviso: '#E8A33D',
  avisoFondo: '#FDF1DC',
  avisoTexto: '#6B4800',
  peligro: '#C62828',
  peligroFondo: '#FCEAE5',
  peligroTexto: '#A81E1A',
  espera: '#3C4A57',
  esperaFondo: '#E9EDF1',

  velo: 'rgba(0, 0, 0, 0.5)',
  presion: 'rgba(0, 0, 0, 0.1)',
  ondaClara: 'rgba(255, 255, 255, 0.2)',
  ondaOscura: 'rgba(29, 32, 35, 0.12)',
  pasoApagado: 'rgba(255, 255, 255, 0.34)',
} as const;

export type Tono = 'accion' | 'listo' | 'aviso' | 'peligro' | 'espera';

export const tono: Record<Tono, { fondo: string; texto: string }> = {
  accion: { fondo: color.accion, texto: color.blanco },
  listo: { fondo: color.listo, texto: color.blanco },
  aviso: { fondo: color.aviso, texto: color.tinta },
  peligro: { fondo: color.peligro, texto: color.blanco },
  espera: { fondo: color.espera, texto: color.blanco },
};

export const fuente = {
  medio: 'Barlow_500Medium',
  semi: 'Barlow_600SemiBold',
  angosta: 'BarlowCondensed_600SemiBold',
} as const;

const cifras: TextStyle['fontVariant'] = ['tabular-nums'];

/** Rampa fija. Ningún texto usa otro tamaño, salvo el cartel, que se ajusta a su palabra. */
export const texto = {
  horaMayor: { fontFamily: fuente.semi, fontSize: 68, lineHeight: 72, fontVariant: cifras },
  lectura: { fontFamily: fuente.semi, fontSize: 46, lineHeight: 50, fontVariant: cifras },
  hora: { fontFamily: fuente.semi, fontSize: 30, lineHeight: 34, fontVariant: cifras },
  portada: { fontFamily: fuente.semi, fontSize: 52, lineHeight: 56 },
  titulo: { fontFamily: fuente.semi, fontSize: 28, lineHeight: 32 },
  seccion: { fontFamily: fuente.semi, fontSize: 22, lineHeight: 28 },
  boton: { fontFamily: fuente.semi, fontSize: 20, lineHeight: 24 },
  fuerte: { fontFamily: fuente.semi, fontSize: 18, lineHeight: 24 },
  cuerpo: { fontFamily: fuente.medio, fontSize: 17, lineHeight: 24 },
  dato: { fontFamily: fuente.semi, fontSize: 22, lineHeight: 28, fontVariant: cifras },
  rotulo: { fontFamily: fuente.medio, fontSize: 15, lineHeight: 20 },
  rotuloFuerte: { fontFamily: fuente.semi, fontSize: 15, lineHeight: 20 },
  pestana: { fontFamily: fuente.angosta, fontSize: 18, lineHeight: 22 },
  nav: { fontFamily: fuente.angosta, fontSize: 14, lineHeight: 16 },
  navAncha: { fontFamily: fuente.semi, fontSize: 18, lineHeight: 22 },
} satisfies Record<string, TextStyle>;

export type VarianteTexto = keyof typeof texto;

export const espacio = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radio = {
  placa: 6,
  filo: 14,
  total: 999,
} as const;

export const medida = {
  toque: 48,
  control: 56,
  campo: 60,
  pie: 80,
  banda: 64,
  barra: 66,
  barraAncha: 60,
  /** Cuadro superior derecho reservado al botón global, más su margen. */
  zonaLibre: 64,
  filoMargen: 10,
  filoGrosor: 3,
  filete: 1,
  rayaCampo: 3,
  rayaPestana: 4,
  logoAlto: 40,
  logoAncho: 133,
  logoGrandeAlto: 60,
  logoGrandeAncho: 200,
  cartelMinimo: 280,
  cartelTopeLetra: 88,
  cartelRelleno: 24,
  cartelInterlinea: 0.98,
  /** Ancho medio de una letra en proporción al cuerpo, para ajustar la palabra del cartel. */
  cartelAnchoLetra: 0.54,
  disco: 72,
  discoIcono: 40,
  pasoAlto: 8,
  cintaAlto: 8,
  cintaPaso: 16,
  senal: 30,
  senalChica: 20,
  icono: 24,
  iconoChico: 20,
  iconoMini: 16,
  iconoVacio: 44,
  trazoIcono: 2,
  trazoCartel: 2.6,
  columnaHora: 92,
  opcionAlto: 64,
  /** Ancho desde el que dos lecturas van lado a lado. */
  datoBase: 150,
  interruptorAncho: 56,
  interruptorAlto: 32,
  interruptorBola: 24,
  esqueletoTexto: 16,
  esqueletoTitulo: 20,
  hojaTope: 0.86,
  areaTexto: 104,
  pesoAccion: 2,
} as const;

export const tiempo = {
  corto: 180,
  medio: 260,
  hoja: 300,
  pulso: 620,
} as const;

/** Lo que entra frena al llegar. */
export const curvaEntrada = [0.2, 0.8, 0.2, 1] as const;
/** Lo que sale acelera. */
export const curvaSalida = [0.4, 0, 1, 1] as const;
