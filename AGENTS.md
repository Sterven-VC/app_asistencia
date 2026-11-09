# Asistencia TMT

App móvil para que el personal de Time Telemetry marque su asistencia con su
ubicación. La admin valida cada marcación y asigna el tipo: **Proyecto**,
**Oficina** o **Cita médica**.

Time Telemetry hace instrumentación y monitoreo automatizado, sobre todo para
minería y construcción. Su personal trabaja en obra y en oficina.
Consulta [el contexto de Time Telemetry](docs/contexto-time-telemetry.md) para
conocer sus servicios y las preguntas abiertas sobre el registro de asistencia.

Se entrega como **APK para Android**.

> [!important] Responder siempre en español
> Todas las respuestas van en español, incluidos los resúmenes y los mensajes
> de commit.

## Qué se quiere lograr

- Marcar asistencia desde el celular debe ser rápido y simple.
- Debe quedar claro quién marcó, cuándo y dónde estaba.
- La empresa debe poder confiar en ese registro y consultarlo.

Las reglas vigentes están en `.specify/memory/constitution.md` y en
`specs/001-asistencia-v1/`. Las funciones concretas se definen durante el desarrollo. **No agregar pantallas
ni funciones que no se hayan pedido.** Si un pedido deja una decisión abierta,
preguntar antes de asumirla.

## Stack

- React Native + Expo
- TypeScript
- Expo Router para la navegación
- EAS Build para generar el APK

El backend es una API propia en `api/` con PostgreSQL local, y llega al celular
con el reenvío de puertos de VS Code. El servidor del uso real está por definir.
No simular datos como si fueran definitivos.

## Diseño

**`DESIGN.md` es la fuente de verdad del diseño.** Leerlo antes de crear o
cambiar cualquier pantalla: colores, tipografía, espaciado, componentes, íconos,
movimiento y tono de los textos salen de ahí.

- Usar la paleta de Time Telemetry mediante tokens de tema. Un color suelto en
  una pantalla es un error.
- Sus ejemplos en CSS se traducen según la sección `Adaptación a React Native`.
- Regla principal: nada redundante ni obvio en pantalla.
- El logo es `assets/images/logo-time-telemetry.png`.
- El icono de Android es `assets/images/logo-tmt-app.png`.
- Las propuestas de `src/disenos/` son temporales y no se mezclan entre sí.

## Comandos

- `npx expo start`: levantar la app en desarrollo
- `npx expo install <paquete>`: instalar dependencias compatibles con el SDK
- `npm run apk`: generar el APK
- `npm run dev --prefix api`: levantar la API
- `npm test --prefix api`: probar la API
- `npm run db:iniciar --prefix api`: encender PostgreSQL local

El perfil `preview` de `eas.json` debe tener `android.buildType` en `apk`.

## Cómo se trabaja

- En este proyecto trabajan Claude y Codex. Todavía no se usa git: antes de
  editar, volver a leer el archivo y no pisar cambios ajenos.
- Hacer cambios pequeños, con un solo objetivo.
- Probar en un Android real o en un emulador antes de dar algo por terminado.
- Nunca subir credenciales, tokens ni la clave de firma del APK.
- Mantener este archivo corto. La documentación extensa va en `docs/`, según
  `docs/arquitectura-claude-code.md`.
