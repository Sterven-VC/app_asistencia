---
description: "Lista de tareas de Asistencia TMT, primera versión"
---

# Tareas: Asistencia TMT, primera versión

**Entrada**: documentos de diseño en `specs/001-asistencia-v1/`

**Requisitos previos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/api.md](contracts/api.md)

**Pruebas**: se incluyen para las reglas críticas, a pedido del usuario. Deben escribirse primero y fallar antes de implementar.

**Organización**: las tareas se agrupan por historia para implementarlas y probarlas por separado.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede hacer en paralelo porque usa otros archivos y no depende de tareas pendientes.
- **[US#]**: historia de `spec.md` a la que pertenece.

## Rutas

- App Expo: `src/` en la raíz del proyecto.
- API: `api/src/`, con pruebas en `api/tests/`.

## Fase 1: Preparación

**Propósito**: crear los dos proyectos y su configuración.

- [X] T001 Crear la app con `npx create-expo-app@latest` en una carpeta temporal y mover sus archivos a la raíz, sin sobrescribir `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `docs/`, `specs/`, `.claude/`, `.agents/`, `.codex/` ni `.specify/`, dejando las rutas en `src/app/`
- [X] T002 Instalar con `npx expo install` las dependencias de la app listadas en `specs/001-asistencia-v1/plan.md` y actualizar `package.json`
- [X] T003 Configurar en `app.config.ts` el nombre Asistencia TMT, el paquete Android `com.timetelemetry.asistencia`, solo los permisos de ubicación en primer plano `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION`, y el plugin `expo-build-properties` con `usesCleartextTraffic` activo solo si `PERMITIR_HTTP` vale `1`
- [X] T004 [P] Crear `eas.json` con el perfil `preview`, `android.buildType` en `apk` y `PERMITIR_HTTP` en `1`, y `.easignore` para no subir credenciales ni la base local
- [X] T005 [P] Crear `.env.example` en la raíz con `EXPO_PUBLIC_API_URL`
- [X] T006 [P] Confirmar que el logo está en `assets/images/logo-time-telemetry.png`
- [X] T007 Crear `api/package.json` y `api/tsconfig.json` con TypeScript, Fastify 5, Zod 4, Drizzle ORM, `pg`, `argon2`, `croner` y Vitest, con los scripts `dev`, `test`, `db:migrar` y `db:admin-inicial`
- [X] T008 [P] Crear `api/.env.example` con `DATABASE_URL`, `DATABASE_URL_TEST`, `PUERTO` y las variables de la admin inicial, sin valores reales
- [X] T009 [P] Configurar Vitest con la base `asistencia_tmt_test` en `api/vitest.config.ts`

---

## Fase 2: Base común

**Propósito**: lo que todas las historias necesitan.

**Importante**: ninguna historia comienza antes de terminar esta fase.

### Pruebas

- [X] T010 [P] Escribir la prueba que confirma que PostgreSQL rechaza `UPDATE` y `DELETE` en `marcaciones`, `validaciones`, `correcciones`, `faltas`, `anulaciones_falta`, `observaciones` y `eventos_cuenta` en `api/tests/inmutabilidad.test.ts`
- [X] T011 [P] Escribir la prueba de inicio de sesión con DNI y contraseña, sesión vencida, sesión revocada y cuenta pendiente en `api/tests/sesion.test.ts`

### API

- [X] T012 Crear la configuración validada con Zod en `api/src/config.ts`
- [X] T013 Definir todas las tablas de `data-model.md` en `api/src/db/esquema.ts`, incluidas estas reglas: `dni` char(8) "Obligatorio, único, solo dígitos", índice único en `(cuenta_id, fecha_laboral, clase)` cuando `es_repetida` es falso, y `unique (cuenta_id, fecha, origen)`
- [X] T014 Crear la migración de triggers de inmutabilidad y la vista `marcaciones_vigentes` en `api/src/db/migraciones/`
- [X] T015 Crear el servidor Fastify con `GET /v1/salud` y el formato de errores de `contracts/api.md` en `api/src/servidor.ts`
- [X] T016 Implementar hash Argon2id y sesiones con token opaco de 90 días, renovado con el uso, en `api/src/modulos/auth/sesiones.ts`
- [X] T017 Implementar `POST /auth/iniciar-sesion`, `POST /auth/cerrar-sesion`, `POST /auth/cambiar-contrasena` y `GET /yo` en `api/src/modulos/auth/rutas.ts`
- [X] T018 Crear los controles de sesión y de `es_admin` en `api/src/modulos/auth/permisos.ts`
- [X] T019 Crear el script que registra la primera admin desde variables de entorno, con estado `activa` y `es_admin` verdadero, en `api/scripts/admin-inicial.ts`

### App

- [X] T020 [P] Traducir los tokens de `DESIGN.md` y la sección `Adaptación a React Native` a `src/theme.ts`
- [X] T021 [P] Cargar Onest en sus cuatro pesos en `src/app/_layout.tsx`
- [X] T022 [P] Crear los componentes base `boton`, `campo`, `chip`, `aviso`, `fila-lista`, `hoja` y `cabecera` en `src/components/`
- [X] T023 [P] Crear el cliente de API con `EXPO_PUBLIC_API_URL` en `src/services/api.ts`
- [X] T024 Guardar el token con `expo-secure-store` y exponer la sesión en `src/services/sesion.ts`
- [X] T025 Crear la base SQLite con `marcaciones_locales` y `cuenta_local` en `src/db/local.ts`
- [X] T026 Crear la pantalla de inicio de sesión con DNI y contraseña en `src/screens/iniciar-sesion.tsx` y `src/app/(publico)/iniciar-sesion.tsx`
- [X] T027 Proteger las rutas por sesión y `es_admin` en `src/app/_layout.tsx`
- [ ] T028 Crear la pantalla de cambio de contraseña obligatorio en `src/screens/cambiar-contrasena.tsx` y `src/app/(personal)/cambiar-contrasena.tsx`

**Punto de control**: la admin inicial entra a la app y las tablas de registro no aceptan cambios.

---

## Fase 3: Historia 1, marcar asistencia (Prioridad: P1) 🎯 MVP

**Objetivo**: una persona con cuenta activa marca con señal, sin señal y sin GPS.

**Prueba independiente**: con cuentas creadas por script, marcar en esos tres casos y comprobar los datos guardados.

### Pruebas

- [X] T029 [P] [US1] Escribir pruebas de `POST /marcaciones/sincronizar` para idempotencia por `id`, `repetida`, salida después de medianoche, `minutos_extra`, cálculo de `desfase_segundos`, `hora_oficial` y `fecha_laboral` en `America/Lima` en `api/tests/marcaciones.test.ts`
- [X] T030 [P] [US1] Escribir pruebas de la regla entrada para personal operario, y entrada y salida para personal administrativo, en `api/tests/clases-marcacion.test.ts`
- [X] T031 [P] [US1] Escribir pruebas de la cola local para reintentos y borrado solo tras confirmar en `src/services/sincronizacion.test.ts`

### Implementación

- [X] T032 [US1] Implementar el cálculo de hora y fecha laboral en `api/src/modulos/marcaciones/hora.ts`
- [X] T033 [US1] Implementar `POST /marcaciones/sincronizar` con la persona tomada de la sesión, resultados por marcación y observaciones `sin_ubicacion` y `cuenta_no_activa` en `api/src/modulos/marcaciones/rutas.ts`
- [X] T034 [US1] Agregar la validación automática con `tipo` vacío para marcaciones de una admin en `api/src/modulos/marcaciones/servicio.ts` (regla histórica sustituida por FR-021 en 0.1.4)
- [X] T035 [P] [US1] Implementar la captura de ubicación en primer plano con espera de 7 segundos, sin usar la última ubicación conocida, en `src/services/ubicacion.ts`
- [X] T036 [US1] Implementar la cola en SQLite, con UUID y `cuenta_id` por marcación, guardada antes de confirmar y enviada solo con la sesión de esa cuenta, en `src/services/cola-marcaciones.ts`
- [X] T037 [US1] Implementar el envío al abrir la app y al volver la conexión en `src/services/sincronizacion.ts`
- [X] T038 [US1] Registrar el envío en segundo plano con `expo-background-task` en `src/services/tarea-sincronizacion.ts`
- [X] T039 [US1] Crear la pantalla Marcar, con el estado de envío y la acción que corresponde a entrada o salida, en `src/screens/marcar/index.tsx` y `src/app/(personal)/index.tsx`
- [X] T040 [US1] Evitar doble marcación por toques repetidos en `src/screens/marcar/index.tsx`

**Punto de control**: se puede marcar en los tres casos y la marcación llega una sola vez.

---

## Fase 4: Historia 2, registrar una cuenta y aprobarla (Prioridad: P1)

**Objetivo**: la persona se registra y la admin controla quién puede marcar.

**Prueba independiente**: registrar una cuenta, comprobar que no marca, aprobarla y comprobar que ya marca.

### Pruebas

- [X] T041 [P] [US2] Escribir pruebas de registro con DNI vacío, DNI repetido y rol admin rechazado en `api/tests/registro.test.ts`
- [X] T042 [P] [US2] Escribir pruebas de aprobación, cambio de rol, pausa, desactivación y restablecimiento con revocación de sesiones en `api/tests/cuentas-admin.test.ts`

### Implementación

- [X] T043 [US2] Implementar `POST /auth/registro` con `rol` limitado a `operario` o `administrativo` en `api/src/modulos/auth/registro.ts`
- [X] T044 [US2] Implementar las rutas de `/admin/cuentas`, con registro en `eventos_cuenta`, en `api/src/modulos/cuentas/rutas.ts`
- [X] T045 [P] [US2] Crear la pantalla de registro en `src/screens/registro.tsx` y `src/app/(publico)/registro.tsx`
- [X] T046 [P] [US2] Mostrar el estado de cuenta pendiente, pausada o desactivada en `src/screens/cuenta-no-activa.tsx`
- [X] T047 [US2] Crear la lista y el detalle de cuentas para la admin en `src/screens/admin/cuentas/` y `src/app/(admin)/cuentas/`

**Punto de control**: una cuenta nueva solo marca cuando una admin la aprueba.

---

## Fase 5: Historia 3, validar marcaciones (Prioridad: P2)

**Objetivo**: la admin aprueba con tipo o rechaza con motivo.

**Prueba independiente**: con marcaciones pendientes, aprobar una y rechazar otra, y comprobar el resultado.

### Pruebas

- [X] T048 [P] [US3] Escribir pruebas de aprobación con tipo, proyecto obligatorio, rechazo con motivo y falta por rechazo en `api/tests/validacion.test.ts`
- [X] T049 [P] [US3] Escribir pruebas de la asignación de tipo por la misma admin y de permisos en `api/tests/validacion-admin.test.ts`

### Implementación

- [X] T050 [US3] Implementar las rutas de `/admin/proyectos` en `api/src/modulos/proyectos/rutas.ts`
- [X] T051 [US3] Implementar `GET /admin/marcaciones`, su detalle, `aprobar` y `rechazar`, con la falta de origen `rechazo`, en `api/src/modulos/validacion/rutas.ts`
- [X] T052 [US3] Crear la pantalla de proyectos en `src/screens/admin/proyectos.tsx` y `src/app/(admin)/proyectos.tsx`
- [X] T053 [US3] Crear la lista de marcaciones con filtros por estado, persona, fecha, observadas y sin tipo en `src/screens/admin/marcaciones/index.tsx` y `src/app/(admin)/marcaciones/index.tsx`
- [X] T054 [US3] Crear el detalle con ambas horas, ubicación, observaciones, aprobación y rechazo en `src/screens/admin/marcaciones/detalle.tsx` y `src/app/(admin)/marcaciones/[id].tsx`

**Punto de control**: cada marcación termina aprobada con tipo o rechazada con motivo.

---

## Fase 6: Historia 4, registrar faltas injustificadas (Prioridad: P2)

**Objetivo**: los días sin marcación quedan registrados solos.

**Prueba independiente**: correr el cierre sobre fechas de prueba y revisar las faltas creadas y anuladas.

### Pruebas

- [X] T055 [P] [US4] Escribir pruebas del cierre para personal operario todos los días, personal administrativo de lunes a viernes, cuentas pausadas, cuentas nuevas e idempotencia en `api/tests/cierre-dia.test.ts`
- [X] T056 [P] [US4] Escribir pruebas de la anulación por marcación tardía y de la recuperación de días sin cerrar en `api/tests/faltas.test.ts`

### Implementación

- [X] T057 [US4] Implementar el cierre diario, con `cierres_dia` y la observación `salida_faltante`, en `api/src/tareas/cierre-dia.ts`
- [X] T058 [US4] Programar el cierre a las 00:05 de Lima y recuperar días pendientes al arrancar en `api/src/servidor.ts`
- [X] T059 [US4] Anular la falta con origen `marcacion_tardia` al recibir una marcación de ese día en `api/src/modulos/marcaciones/servicio.ts`

**Punto de control**: las faltas aparecen y se anulan con rastro.

---

## Fase 7: Historia 5, ver mis marcaciones (Prioridad: P3)

**Objetivo**: cada persona revisa solo lo suyo.

**Prueba independiente**: marcar con dos cuentas y comprobar que cada una ve solo sus datos.

### Pruebas

- [X] T060 [P] [US5] Escribir pruebas de aislamiento de `GET /yo/historial` en `api/tests/historial.test.ts`

### Implementación

- [X] T061 [US5] Implementar `GET /yo/historial` en `api/src/modulos/marcaciones/historial.ts`
- [X] T062 [US5] Crear la pantalla de historial, con marcaciones sin enviar, estado, tipo y motivo de rechazo, en `src/screens/historial.tsx` y `src/app/(personal)/historial.tsx`

**Punto de control**: el historial muestra lo propio y nada más.

---

## Fase 8: Historia 6, corregir una marcación (Prioridad: P3)

**Objetivo**: la admin corrige sin perder el original.

**Prueba independiente**: corregir una marcación y una falta, y comprobar el rastro.

### Pruebas

- [X] T063 [P] [US6] Escribir pruebas de corrección de falta o no falta con motivo obligatorio, original conservado y permisos en `api/tests/correcciones.test.ts`

### Implementación

- [X] T064 [US6] Implementar `POST /admin/correcciones` en `api/src/modulos/validacion/correcciones.ts`
- [X] T065 [US6] Implementar `GET /admin/faltas` en `api/src/modulos/faltas/rutas.ts`
- [X] T066 [US6] Agregar la decisión de falta o no falta y su historial en la pantalla de faltas
- [X] T067 [US6] Crear la pantalla de faltas en `src/screens/admin/faltas.tsx` y `src/app/(admin)/faltas.tsx`

**Punto de control**: toda corrección conserva el original, el motivo, el autor y la fecha.

---

## Fase 9: Cierre

**Propósito**: comprobar el conjunto y generar el APK.

- [ ] T068 [P] Revisar que las pantallas usen solo tokens de `src/theme.ts`, con áreas táctiles de 48 px y lectores de pantalla, en `src/screens/` y `src/components/`
- [X] T069 [P] Respetar la opción de reducir movimiento del sistema en `src/hooks/use-movimiento.ts`
- [X] T070 [P] Documentar cómo levantar el proyecto en `docs/desarrollo.md`
- [ ] T071 Ejecutar los 20 escenarios de `specs/001-asistencia-v1/quickstart.md` en Android real o emulador
- [ ] T072 Generar el APK con el perfil `preview` y probarlo en un teléfono según `specs/001-asistencia-v1/quickstart.md`
  - EAS generó el [APK 0.1.1](https://expo.dev/artifacts/eas/8k1VvfJ5WKcIG0ASr2u1d1Jy1M2EsthxVpYzNYdENMk.apk). Se descargó y se verificaron la integridad del archivo, el paquete, la versión y la presencia del bloque de firma. Queda probarlo en un teléfono.

---

## Dependencias y orden

### Fases

- **Fase 1**: sin dependencias.
- **Fase 2**: depende de la fase 1 y bloquea todas las historias.
- **Fases 3 a 8**: dependen de la fase 2.
- **Fase 9**: depende de las historias que se quieran entregar.

### Historias

- **Historia 1**: puede empezar tras la fase 2. Usa cuentas creadas por script.
- **Historia 2**: puede empezar tras la fase 2, en paralelo con la historia 1.
- **Historia 3**: depende de la historia 1, porque valida marcaciones.
- **Historia 4**: depende de la historia 1. La falta por rechazo depende de la historia 3.
- **Historia 5**: depende de la historia 1.
- **Historia 6**: depende de las historias 3 y 4.

### Dentro de cada historia

- Las pruebas se escriben primero y deben fallar.
- La API va antes que las pantallas que la usan.

## Ejemplo en paralelo: Historia 1

```bash
Tarea: "T029 Pruebas de sincronización en api/tests/marcaciones.test.ts"
Tarea: "T030 Pruebas de entrada y salida en api/tests/clases-marcacion.test.ts"
Tarea: "T031 Pruebas de la cola en src/services/sincronizacion.test.ts"
```

## Estrategia de implementación

### MVP

1. Completar las fases 1 y 2.
2. Completar la historia 1.
3. **Detenerse y validar** con los escenarios 3 a 7 de `quickstart.md`.

### Entrega por partes

1. Base común.
2. Historias 1 y 2: el personal puede registrarse y marcar.
3. Historias 3 y 4: la admin valida y aparecen las faltas.
4. Historias 5 y 6: historial y correcciones.
5. Antes del uso real, elegir el servidor y publicar con HTTPS.

## Notas

- Esta lista cubre las etapas 1 a 3 de `research.md`. La etapa 4 necesita primero elegir el servidor.
- Todavía no se usa git: antes de editar, volver a leer el archivo.
- Las credenciales nunca se escriben en archivos compartidos.
- La recuperación y el cambio obligatorio de contraseña se aplazan según la especificación vigente. T028 queda fuera del alcance y los apartados correspondientes de T017 y T042 se evalúan sin ese flujo.
- La estructura final está en `plan.md`. Varias tareas se cumplen con rutas agrupadas, migraciones SQL y pruebas consolidadas.
- La API usa `pg` con migraciones SQL. La app guarda la cola en SQLite y la cuenta con el token en SecureStore.
- La revisión en navegador a 375 px confirmó el selector en las tres propuestas y la conservación del texto en Registro. Las pruebas de accesibilidad, GPS y modo avión en Android se registran en T068, T071 y T072.

## Fase 10: Convergencia

- [X] T073 Asociar cada lote al token de su cuenta y confirmar solo los identificadores reconocidos por el servidor, según FR-010, FR-011 y FR-011a.
- [X] T074 Completar las once pantallas en cada propuesta y comprobar el cambio de diseño con el mismo estado, según FR-030.
- [X] T075 Mostrar ambas decisiones de falta y el rastro de cambios, según FR-026 y SC-003.
- [X] T076 Proteger los accesos directos de administración y separar sus rutas y módulos, según FR-017, FR-026 y el plan.
- [X] T077 Permitir que una pausa iniciada hoy termine el mismo día y conservar su rastro, según FR-006a.
- [X] T078 Quitar la opción experimental del compilador de React que alteraba el orden de hooks en el formulario y volver a verificar el cambio de diseño.
