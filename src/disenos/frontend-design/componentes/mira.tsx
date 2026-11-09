import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { color, medida, tipo } from '../tema';

/** Convierte "07:58" en horas decimales. */
export function aHoras(texto: string): number | null {
  const partes = /(\d{1,2}):(\d{2})/.exec(texto);
  return partes ? Number(partes[1]) + Number(partes[2]) / 60 : null;
}

type Tramo = { desde: number; hasta: number };

type PropsMira = {
  ancho: number;
  alto: number;
  pxHora: number;
  /** Punto de anclaje: `horaBase` cae a `yBase` px del borde superior. */
  horaBase: number;
  yBase: number;
  /** Horas que se pintan en naranja. */
  tramo?: Tramo | null;
  cifras?: boolean;
};

const BANDAS = 5;
const modulo = (valor: number, base: number) => ((valor % base) + base) % base;

function trazar({ ancho, alto, pxHora, horaBase, yBase, tramo }: PropsMira) {
  const mitad = Math.round(ancho / 2);
  const lomo = Math.round(ancho * 0.16);
  const primera = Math.floor(horaBase - yBase / pxHora);
  const ultima = Math.ceil(horaBase + (alto - yBase) / pxHora);
  const horas: { hora: number; y: number; izquierda: boolean }[] = [];
  let normal = '';
  let marcado = '';

  for (let hora = primera; hora <= ultima; hora += 1) {
    const y = yBase + (hora - horaBase) * pxHora;
    const izquierda = modulo(hora, 2) === 0;
    horas.push({ hora, y, izquierda });

    for (let banda = 0; banda < BANDAS; banda += 1) {
      const arriba = Math.round(y + (banda * pxHora) / BANDAS);
      const abajo = Math.round(y + ((banda + 1) * pxHora) / BANDAS);
      if (abajo <= 0 || arriba >= alto) continue;

      const largo = banda % 2 === 0 ? mitad : lomo;
      const x = izquierda ? 0 : ancho - largo;
      const rectangulo = `M${x} ${arriba}h${largo}v${abajo - arriba}h${-largo}z`;
      const instante = hora + (banda + 0.5) / BANDAS;
      const pintada = tramo && instante >= tramo.desde && instante <= tramo.hasta;
      if (pintada) marcado += rectangulo;
      else normal += rectangulo;
    }
  }

  return { horas, normal, marcado };
}

/** La mira de horas: dientes en E que alternan de lado, con la cifra en el lado libre. */
export function Mira(props: PropsMira) {
  const { ancho, alto, pxHora, cifras = true } = props;
  const { horas, normal, marcado } = useMemo(
    () => trazar(props),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.ancho, props.alto, props.pxHora, props.horaBase, props.yBase, props.tramo?.desde, props.tramo?.hasta],
  );

  const mitad = ancho / 2;
  const tamano = Math.round(Math.min(ancho * 0.36, pxHora * 0.74, 24));
  const soloPares = pxHora < 19;

  return (
    <View
      aria-hidden
      style={[estilos.mira, { width: ancho, height: alto }]}>
      <Svg width={ancho} height={alto}>
        <Path d={normal} fill={color.grafito} />
        {marcado ? <Path d={marcado} fill={color.reticula} /> : null}
      </Svg>
      {cifras
        ? horas
            .filter(({ hora }) => !soloPares || modulo(hora, 2) === 0)
            .map(({ hora, y, izquierda }) => (
              <Text
                allowFontScaling={false}
                key={hora}
                style={[
                  tipo.cifraMira,
                  estilos.cifra,
                  {
                    fontSize: tamano,
                    lineHeight: tamano + 2,
                    top: y + (pxHora - tamano - 2) / 2,
                    left: izquierda ? mitad : 0,
                    width: mitad,
                  },
                ]}>
                {String(modulo(hora, 24)).padStart(2, '0')}
              </Text>
            ))
        : null}
    </View>
  );
}

function trazarAngosta(alto: number, empezarDerecha: boolean): string {
  const ancho = medida.miraAngosta;
  const banda = medida.dienteAngosto;
  const mitad = Math.round(ancho * 0.56);
  const lomo = Math.round(ancho * 0.2);
  let trazo = '';

  for (let y = 0, indice = 0; y < alto; y += banda, indice += 1) {
    const unidad = Math.floor(indice / BANDAS);
    const izquierda = (unidad % 2 === 0) !== empezarDerecha;
    const largo = (indice % BANDAS) % 2 === 0 ? mitad : lomo;
    const x = izquierda ? 0 : ancho - largo;
    const alturaBanda = Math.min(banda, alto - y);
    trazo += `M${x} ${y}h${largo}v${alturaBanda}h${-largo}z`;
  }

  return trazo;
}

/** Tramo angosto de mira. Recorre la altura de su bloque; cada bloque es un día. */
export function TramoMira({ empezarDerecha = false }: { empezarDerecha?: boolean }) {
  const [alto, setAlto] = useState(0);

  return (
    <View
      aria-hidden
      onLayout={(evento) => setAlto(Math.round(evento.nativeEvent.layout.height))}
      style={estilos.tramo}>
      {alto > 0 ? (
        <Svg width={medida.miraAngosta} height={alto}>
          <Path d={trazarAngosta(alto, empezarDerecha)} fill={color.grafito} />
        </Svg>
      ) : null}
    </View>
  );
}

/** Lo que se ve por el anteojo del nivel: hilo central y dos hilos estadimétricos. */
export function Reticula({ tamano, tinta }: { tamano: number; tinta: string }) {
  return (
    <View aria-hidden>
      <Svg
        fill="none"
        height={tamano}
        stroke={tinta}
        strokeLinecap="round"
        strokeWidth={2.5}
        viewBox="0 0 64 64"
        width={tamano}>
        <Circle cx={32} cy={32} r={29} />
        <Path d="M3 32h58M32 12v40M23 20h18M23 44h18" />
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  mira: { overflow: 'hidden', backgroundColor: color.papel },
  cifra: { position: 'absolute', textAlign: 'center', color: color.grafito },
  tramo: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: medida.miraAngosta,
  },
});
