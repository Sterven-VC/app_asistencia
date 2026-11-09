import { Barlow_500Medium } from '@expo-google-fonts/barlow/500Medium';
import { Barlow_600SemiBold } from '@expo-google-fonts/barlow/600SemiBold';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';

import type { Diseno } from '../contrato';
import { BarraNavegacion } from './barra';
import { CuentaNoActiva, IniciarSesion, Registro } from './pantallas/acceso';
import { Historial, Marcar } from './pantallas/asistencia';
import { AdminCuentas, AdminDetalleCuenta } from './pantallas/cuentas';
import { AdminFaltas } from './pantallas/faltas';
import { AdminProyectos } from './pantallas/proyectos';
import { AdminDetalleMarcacion, AdminMarcaciones } from './pantallas/validacion';

export const diseno: Diseno = {
  id: 'impeccable',
  nombre: 'Impeccable',
  fuentes: { Barlow_500Medium, Barlow_600SemiBold, BarlowCondensed_600SemiBold },
  BarraNavegacion,
  pantallas: {
    iniciarSesion: IniciarSesion,
    registro: Registro,
    cuentaNoActiva: CuentaNoActiva,
    marcar: Marcar,
    historial: Historial,
    adminMarcaciones: AdminMarcaciones,
    adminDetalleMarcacion: AdminDetalleMarcacion,
    adminCuentas: AdminCuentas,
    adminDetalleCuenta: AdminDetalleCuenta,
    adminProyectos: AdminProyectos,
    adminFaltas: AdminFaltas,
  },
};
