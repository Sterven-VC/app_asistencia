import { config } from './config.js';
import { migrar } from './db/conexion.js';
import { crearApp } from './servidor.js';
import { cerrarDiasPendientes, programarCierre } from './tareas/cierre-dia.js';

await migrar();
const app = await crearApp();
await cerrarDiasPendientes();
programarCierre();
await app.listen({ port: config.PUERTO, host: '127.0.0.1' });
