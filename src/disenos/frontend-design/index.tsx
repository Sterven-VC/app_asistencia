import type { Diseno } from '../contrato';
import { BarraNavegacion } from './componentes/barra';
import { AdminCuentas } from './pantallas/admin-cuentas';
import { AdminDetalleCuenta } from './pantallas/admin-detalle-cuenta';
import { AdminDetalleMarcacion } from './pantallas/admin-detalle-marcacion';
import { AdminFaltas } from './pantallas/admin-faltas';
import { AdminMarcaciones } from './pantallas/admin-marcaciones';
import { AdminProyectos } from './pantallas/admin-proyectos';
import { CuentaNoActiva } from './pantallas/cuenta-no-activa';
import { Historial } from './pantallas/historial';
import { IniciarSesion } from './pantallas/iniciar-sesion';
import { Marcar } from './pantallas/marcar';
import { Registro } from './pantallas/registro';
import { fuentes } from './tema';

export const diseno: Diseno = {
  id: 'frontend-design',
  nombre: 'Frontend Design',
  fuentes,
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
  BarraNavegacion,
};
