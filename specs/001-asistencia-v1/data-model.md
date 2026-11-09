# Modelo de datos: Asistencia TMT, primera versión

Las tablas marcadas como **inmutables** solo aceptan inserciones. Un trigger rechaza `UPDATE` y `DELETE`.

## PostgreSQL

### `cuentas`

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | uuid | Clave primaria |
| `dni` | char(8) | Obligatorio, solo dígitos, único por ámbito de cuenta |
| `nombre_1` | texto | Obligatorio |
| `nombre_2` | texto | Puede estar vacío si la persona no tiene segundo nombre |
| `apellido_paterno` | texto | Obligatorio |
| `apellido_materno` | texto | Obligatorio |
| `numero_referencia` | texto | Obligatorio |
| `rol` | texto restringido | `operario` o `administrativo` para personal y `admin` para administración |
| `estado` | enum | `pendiente`, `activa` o `desactivada` |
| `contrasena_hash` | texto | Argon2id |
| `intentos_fallidos` | entero | Se reinicia al entrar |
| `bloqueada_hasta` | timestamptz | 15 minutos tras 5 intentos fallidos |
| `creada_en` | timestamptz | |
| `aprobada_en` | timestamptz | Marca desde cuándo aplican las faltas |

**Pausada** no se guarda como estado. Una cuenta `activa` está pausada cuando hoy cae dentro de una pausa vigente.

El ámbito de la cuenta se fija al crearla. Las cuentas de administración se crean activas mediante el comando de operación y pueden desactivarse por operación. Las marcaciones, faltas, pausas y correcciones apuntan a una cuenta de personal. Los registros de auditoría permiten que la cuenta de administración figure como autora.

```text
pendiente → activa → desactivada
pendiente → desactivada
activa ⇄ pausada (por fechas)
```

### `sesiones`

`id`, `cuenta_id`, `token_hash`, `creada_en`, `expira_en`, `revocada_en`.

### `eventos_cuenta` (inmutable)

`id`, `cuenta_id`, `evento`, `detalle` (jsonb), `autor_id`, `creado_en`.

Eventos de aprobación, pausa, cambio de pausa, desactivación, separación de una cuenta mixta y alta administrativa.

### `pausas`

`id`, `cuenta_id`, `desde` (fecha), `hasta` (fecha), `autor_id`, `creada_en`, `anulada_en` opcional. La regla es `hasta >= desde`. Si el nuevo fin precede al inicio, se anula la pausa y se conserva el intervalo original. Cambiar o anular una pausa agrega un evento en `eventos_cuenta`.

### `proyectos`

`id`, `nombre` (único), `activo`, `creado_por`, `creado_en`. Un proyecto no se borra: se marca inactivo.

### `marcaciones` (inmutable)

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | uuid | Creado en el teléfono. Hace idempotente el envío |
| `cuenta_id` | uuid | Sale de la sesión, no del cuerpo del pedido |
| `clase` | enum | `entrada` o `salida`. El personal operario solo usa `entrada` |
| `fecha_laboral` | fecha | Día de `hora_oficial` en `America/Lima`. Una salida usa el día de su entrada abierta de las últimas 16 horas |
| `hora_telefono` | timestamptz | Hora del teléfono al marcar |
| `hora_recepcion` | timestamptz | Hora del servidor al recibir |
| `desfase_segundos` | entero | Hora del servidor menos hora del teléfono al enviar |
| `hora_oficial` | timestamptz | `hora_telefono` más `desfase_segundos` |
| `sin_conexion` | booleano | Se marcó sin señal |
| `latitud`, `longitud`, `precision_m` | numérico | Vacíos si no hubo ubicación |
| `motivo_sin_ubicacion` | enum | `sin_permiso`, `sin_gps` o `tiempo_agotado` |
| `es_repetida` | booleano | Verdadero si ya existía esa clase ese día |
| `minutos_extra` | entero | Solo en salidas. Minutos después del fin del horario |

Regla: índice único en `(cuenta_id, fecha_laboral, clase)` cuando `es_repetida` es falso.

### `observaciones` (inmutable)

`id`, `marcacion_id`, `codigo` (`sin_ubicacion`, `salida_faltante`, `cuenta_no_activa` o `marcacion_repetida`), `creado_en`.

Se separan de `marcaciones` porque algunas aparecen después, como la salida faltante.

### `validaciones` (inmutable)

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | uuid | |
| `marcacion_id` | uuid | |
| `decision` | enum | `aprobada` o `rechazada` |
| `tipo` | enum | `proyecto`, `oficina` o `cita_medica` |
| `proyecto_id` | uuid | Obligatorio si `tipo` es `proyecto` |
| `motivo` | texto | Obligatorio si es `rechazada` |
| `automatica` | booleano | Verdadero en las marcaciones de una admin |
| `autor_id` | uuid | |
| `creado_en` | timestamptz | |

La aprobación automática de una admin deja `tipo` vacío. Al asignarlo, se agrega otra fila.

En una salida no se asigna tipo: `aprobada` considera `minutos_extra` y `rechazada` los descarta sin generar falta.

### `correcciones` (inmutable)

`id`, `cuenta_id`, `fecha`, `es_falta_anterior`, `es_falta_nuevo`, `motivo` (obligatorio), `autor_id`, `creado_en`.

Lo único corregible es si un día es falta o no. La hora nunca se corrige.

### `faltas` (inmutable)

`id`, `cuenta_id`, `fecha`, `origen` (`sin_marcacion`, `rechazo` o `correccion`), `marcacion_id`, `creada_en`.

Regla: `unique (cuenta_id, fecha, origen)`.

### `anulaciones_falta` (inmutable)

`id`, `falta_id` (único), `motivo`, `origen` (`marcacion_tardia` o `correccion`), `autor_id`, `creado_en`. El autor queda vacío cuando anula el sistema.

### `cierres_dia`

`fecha` (clave primaria), `ejecutado_en`.

### Vista `marcaciones_vigentes`

Une cada marcación con su última validación. Expone `estado` (`pendiente`, `aprobada` o `rechazada`), `tipo` y `proyecto_id`. Es lo que leen las pantallas.

## Reglas del cierre diario

Para cada fecha sin fila en `cierres_dia`:

1. Toma las cuentas `activa` aprobadas antes de esa fecha y sin pausa ese día.
2. Excluye sábados y domingos si el `rol` es `administrativo`.
3. Registra una falta `sin_marcacion` si no hay marcación ese día.
4. Agrega la observación `salida_faltante` a quienes son `administrativo` y solo tienen entrada.
5. Inserta la fila en `cierres_dia`.

## SQLite en el teléfono

### `marcaciones_locales`

`id`, `cuenta_id`, `clase`, `hora_telefono`, `latitud`, `longitud`, `precision_m`, `motivo_sin_ubicacion`, `sin_conexion`, `estado_envio` (`pendiente`, `enviando`, `enviada` o `error`), `intentos`, `ultimo_error`.

```text
pendiente → enviando → enviada
enviando → pendiente (reintento)
enviando → error (rechazo definitivo de la API)
```

Una marcación se borra del teléfono solo cuando la API confirmó que la guardó y el historial ya la muestra.

### Sesión en SecureStore

SecureStore conserva el token junto al servidor que lo emitió y el perfil de la cuenta. La app usa el perfil de personal al marcar sin señal y vincula cada registro de SQLite al identificador de quien lo creó. El perfil administrativo se verifica al abrir o reanudar la app.
