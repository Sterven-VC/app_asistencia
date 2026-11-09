# Contrato de la API: Asistencia TMT

Base: `/v1`. Formato JSON. Las fechas van en ISO 8601.

Todas las rutas requieren `Authorization: Bearer <token>`, salvo salud, registro e inicio de sesión. Las rutas `/admin` requieren una cuenta activa con rol `admin`. La sincronización y `/yo/historial` son de uso exclusivo del personal.

## Errores

```json
{ "error": { "codigo": "dni_duplicado", "mensaje": "Ese DNI ya tiene una cuenta" } }
```

| HTTP | Códigos |
|---|---|
| 400 | `datos_invalidos`, `motivo_requerido`, `tipo_requerido`, `proyecto_requerido` |
| 401 | `sesion_invalida`, `credenciales_invalidas` |
| 403 | `cuenta_pendiente`, `cuenta_no_activa`, `solo_admin`, `solo_personal` |
| 404 | `no_encontrado` |
| 409 | `dni_duplicado`, `ya_validada`, `sin_cambios`, `proyecto_duplicado` |
| 429 | `cuenta_bloqueada` |

## Cuenta y sesión

| Método y ruta | Cuerpo | Respuesta |
|---|---|---|
| `GET /salud` | | 200, sin sesión |
| `POST /auth/registro` | `dni`, `nombre_1`, `nombre_2`, `apellido_paterno`, `apellido_materno`, `numero_referencia`, `rol`, `contrasena` | 201, cuenta `pendiente` |
| `POST /auth/iniciar-sesion` | `identificador`, `contrasena`. Se acepta `dni` en lugar de `identificador` para personal | 200, `token`, `expira_en`, `cuenta` |
| `POST /auth/cerrar-sesion` | | 204 |
| `GET /yo` | | 200, `cuenta`, `pausas` |

`rol` en el registro solo acepta `operario` o `administrativo`.

El identificador de personal es el DNI. El de administración usa el formato `admin.<DNI>` con contraseña propia. Las sesiones administrativas vencen ocho horas después de iniciar sesión. `es_admin` se conserva como campo de respuesta para clientes anteriores y se calcula a partir de `rol`.

## Marcación

### `POST /marcaciones/sincronizar`

```json
{
  "hora_envio_telefono": "2026-11-06T13:05:00-05:00",
  "marcaciones": [
    {
      "id": "uuid",
      "clase": "entrada",
      "hora_telefono": "2026-11-06T08:01:12-05:00",
      "sin_conexion": true,
      "latitud": -12.0,
      "longitud": -77.0,
      "precision_m": 18,
      "motivo_sin_ubicacion": null
    }
  ]
}
```

Respuesta 200, con un resultado por marcación:

```json
{ "resultados": [ { "id": "uuid", "resultado": "guardada" } ] }
```

| `resultado` | Significado |
|---|---|
| `guardada` | Se registró |
| `ya_existia` | Ese `id` ya estaba. El teléfono la da por enviada |
| `repetida` | Ya había otra de esa clase ese día. Se guardó observada, sin perderla |

Reglas:

- La persona sale de la sesión, nunca del cuerpo.
- Una cuenta `pausada` o `desactivada` que marcó sin señal queda guardada y observada. Nada se pierde.
- Si la marca pertenece a un día con falta `sin_marcacion`, la falta se anula con origen `marcacion_tardia`.
- Si la cuenta es admin, se agrega una validación automática.

### `GET /yo/historial?desde=&hasta=`

Devuelve marcaciones y faltas de la persona, con fecha, hora vigente, estado, tipo, proyecto y motivo de rechazo.

## Admin: cuentas

| Método y ruta | Cuerpo |
|---|---|
| `GET /admin/cuentas?estado=` | |
| `POST /admin/cuentas/:id/aprobar` | `rol` |
| `POST /admin/cuentas/:id/desactivar` | `motivo` |
| `POST /admin/cuentas/:id/pausas` | `desde`, `hasta` |
| `PATCH /admin/cuentas/:id/pausas/:pausaId` | `hasta` |

## Admin: marcaciones

| Método y ruta | Cuerpo |
|---|---|
| `GET /admin/marcaciones?estado=&fecha=&cuenta_id=&observada=&sin_tipo=` | |
| `GET /admin/marcaciones/:id` | Incluye ambas horas, ubicación, observaciones e historial |
| `POST /admin/marcaciones/:id/aprobar` | `tipo`, `proyecto_id`. En una salida no llevan valor |
| `POST /admin/marcaciones/:id/rechazar` | `motivo` |

En una entrada autoaprobada antes de separar las cuentas, `aprobar` permite que la cuenta de administración del mismo DNI complete el tipo. Rechazar una entrada crea una falta. Rechazar una salida quita el tiempo extra y no crea falta.

## Admin: faltas y proyectos

| Método y ruta | Cuerpo |
|---|---|
| `GET /admin/faltas?fecha=&cuenta_id=` | |
| `POST /admin/correcciones` | `cuenta_id`, `fecha`, `es_falta`, `motivo` |
| `GET /admin/proyectos` | |
| `POST /admin/proyectos` | `nombre` |
| `PATCH /admin/proyectos/:id` | `nombre`, `activo` |

El detalle de una marcación incluye `validaciones` con la decisión, tipo, proyecto, motivo, autor, fecha y el indicador de aprobación automática. El listado de faltas incluye `es_falta` para el estado efectivo del día y `correcciones` con los estados anterior y nuevo, el motivo, el autor y la fecha de cada decisión.
