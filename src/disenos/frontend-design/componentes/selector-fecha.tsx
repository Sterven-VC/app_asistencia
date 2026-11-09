import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fechaLima, formatearFecha } from '@/utils/fechas';
import { espacio } from '../tema';
import { conMayuscula } from '../textos';
import { Opcion } from './campos';
import { Campo } from './campos';
import { Boton } from './estructura';
import { Hoja } from './hoja';

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_RECIENTES = 7;
const FORMATO = /^\d{4}-\d{2}-\d{2}$/;

function etiquetaDia(fecha: string, diasAtras: number): string {
  if (diasAtras === 0) return 'Hoy';
  if (diasAtras === 1) return 'Ayer';
  return conMayuscula(formatearFecha(fecha));
}

type Props = {
  visible: boolean;
  cerrar(): void;
  fecha: string | null;
  cambiar(valor: string | null): void;
};

export function SelectorFecha({ visible, cerrar, fecha, cambiar }: Props) {
  const [otra, setOtra] = useState('');
  const dias = Array.from({ length: DIAS_RECIENTES }, (_, indice) => ({
    fecha: fechaLima(new Date(Date.now() - indice * DIA_MS)),
    indice,
  }));

  const elegir = (valor: string | null) => {
    cambiar(valor);
    setOtra('');
    cerrar();
  };

  return (
    <Hoja cerrar={cerrar} titulo="Fecha" visible={visible}>
      <Opcion alPresionar={() => elegir(null)} elegida={fecha === null} etiqueta="Todas las fechas" />
      {dias.map((dia) => (
        <Opcion
          alPresionar={() => elegir(dia.fecha)}
          elegida={fecha === dia.fecha}
          etiqueta={etiquetaDia(dia.fecha, dia.indice)}
          key={dia.fecha}
        />
      ))}
      <View style={estilos.otra}>
        <Campo
          autoCorrect={false}
          etiqueta="Otra fecha"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          onChangeText={setOtra}
          placeholder="AAAA-MM-DD"
          value={otra}
        />
        <Boton
          alPresionar={() => elegir(otra)}
          deshabilitado={!FORMATO.test(otra)}
          etiqueta="Usar esta fecha"
        />
      </View>
    </Hoja>
  );
}

const estilos = StyleSheet.create({
  otra: { gap: espacio.s2, paddingTop: espacio.s3 },
});
