# Plan de implementación: Asistencia TMT, primera versión

**Carpeta**: `specs/001-asistencia-v1` | **Fecha**: 2026-11-06 | **Especificación**: [spec.md](spec.md)

**Entrada**: especificación de `specs/001-asistencia-v1/spec.md`

## Resumen

App Android con Expo para marcar asistencia con GPS, incluso sin señal, y una API propia con PostgreSQL que aplica las reglas de hora, roles, validación, faltas y rastro. Primero se prueba con la base y la API en la PC del usuario. El servidor final se elige antes del uso real. Ver [research.md](research.md).

## Contexto técnico

**Lenguaje y versión**: TypeScript en la app y la API, Node.js 24.

**Dependencias principales**:

- App: Expo SDK 58, Expo Router, `expo-sqlite`, `expo-location`, `expo-secure-store`, `expo-background-task`, `@react-native-community/netinfo`, `@expo-google-fonts/onest`, `lucide-react-native`, `react-native-svg`.
- API: Fastify 5, Zod 4, `pg`, `argon2`, `croner`.

**Almacenamiento**: PostgreSQL 17 local en `.local/postgres`, puerto 5434, base `asistencia_tmt`. SQLite en el teléfono para las marcaciones sin enviar.

**Pruebas**: Vitest con base `asistencia_tmt_test` para la API y el ejecutor de pruebas de Node.js para la cola de la app. Los escenarios de interfaz se prueban en Android.

**Plataforma**: Android, entregado como APK con EAS Build. La API corre en Windows durante las pruebas y llega al teléfono con un túnel de VS Code.

**Tipo de proyecto**: app móvil con API.

**Metas de rendimiento**: marcar en menos de 10 segundos, incluida la espera máxima del GPS. Validar una marcación en menos de 30 segundos.

**Restricciones**: funciona sin señal, sin seguimiento de ubicación, registro inalterable y sin credenciales en el APK.

**Escala**: hasta 30 personas y cerca de 60 marcaciones al día.

## Revisión de la constitución

*Revisión inicial y posterior al diseño: pasa.*

| Principio | Cómo se cumple | Estado |
|---|---|---|
| I. Marcar primero | La pantalla inicial tiene una acción principal y no pide tipo | Cumple |
| II. Registro confiable | Tablas inmutables con triggers, dos horas guardadas y correcciones con motivo | Cumple |
| III. Validación por la admin | Validaciones por marcación, tipo al aprobar, aprobación automática de admin y cierre diario | Cumple |
| IV. Funciona sin señal | SQLite antes de confirmar, UUID idempotente y envío automático | Cumple |
| V. Privacidad y datos mínimos | Permiso de ubicación solo en primer plano, permisos por rol en la API y sin datos médicos | Cumple |
| VI. Solo lo pedido | Solo se incluyen pantallas exigidas por la especificación | Cumple |
| Restricciones | Stack fijo y backend aprobado por el usuario para la etapa local | Cumple |

**Alcance de la aprobación**: el usuario aprobó PostgreSQL en su PC y un túnel de VS Code para probar. Falta aprobar el servidor del uso real.

## Estructura del proyecto

### Documentación

```text
specs/001-asistencia-v1/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Lo crea /speckit-tasks
```

### Código

```text
src/                          # App Expo
├── app/                      # Solo rutas de Expo Router
│   ├── _layout.tsx
│   ├── (acceso)/
│   │   ├── iniciar-sesion.tsx
│   │   ├── registro.tsx
│   │   └── cuenta-no-activa.tsx
│   ├── (app)/                # Pestañas protegidas por sesión y rol
│   │   ├── marcar.tsx
│   │   ├── historial.tsx
│   │   ├── marcaciones.tsx
│   │   ├── cuentas.tsx
│   │   ├── faltas.tsx
│   │   └── proyectos.tsx
│   └── (admin-detalles)/     # Detalles protegidos por rol
│       ├── marcacion/[id].tsx
│       └── cuenta/[id].tsx
├── logica/                   # Lógica de cada pantalla, sin interfaz
├── disenos/                  # Una propuesta visual por skill
│   ├── contrato.ts           # Lo que toda propuesta debe implementar
│   ├── ui-ux-pro-max/
│   ├── impeccable/
│   └── frontend-design/
├── services/                 # Cliente de API, cola y sincronización
├── db/                       # SQLite local
└── utils/

api/                          # API y base de datos
├── src/
│   ├── db/                   # Conexión y migraciones SQL
│   ├── modulos/              # auth, cuentas, marcaciones, validacion, faltas y proyectos
│   ├── tareas/               # Cierre diario
│   ├── config.ts
│   └── servidor.ts
├── scripts/                  # Cuenta admin inicial
└── tests/

assets/                       # Logo y fuentes
docs/                         # Guías del proyecto
app.config.ts
eas.json
package.json
```

**Decisión de estructura**: Expo queda en la raíz porque `AGENTS.md` ya define sus comandos ahí. La API vive en `api/` con su propio `package.json`, para que nada del servidor entre en el APK. La lógica vive en `src/logica/` y cada propuesta visual solo dibuja, así el cambio de diseño no altera datos ni reglas.

## Pantallas

| Pantalla | Quién la ve | Requisitos |
|---|---|---|
| Iniciar sesión | Todos | FR-005 |
| Registro | Todos | FR-001, FR-002 |
| Marcar | Cuenta activa | FR-007 a FR-015 |
| Historial | Cuenta activa | FR-024 |
| Marcaciones | Admin | FR-016 a FR-021 |
| Cuentas | Admin | FR-004, FR-006a |
| Faltas | Admin | FR-026 |
| Cuenta no activa | Cuenta pendiente, pausada o desactivada | FR-003, FR-006a |
| Proyectos | Admin | FR-018a |

## Seguimiento de complejidad

No hay excepciones a la constitución. Tener dos proyectos, app y API, es necesario porque las credenciales de la base no pueden ir dentro del APK. Las tres propuestas visuales son temporales: al elegir una, se borran las otras dos y el botón de cambio.
