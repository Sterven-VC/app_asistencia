# Guía de validación: Asistencia TMT, primera versión

Sí se puede probar en la PC antes de instalar un APK. Esta guía sigue las etapas de [research.md](research.md).

## Requisitos

- Node.js 24
- PostgreSQL 17 instalado. El proyecto crea su propio clúster en `.local/postgres`
- VS Code con una sesión iniciada para reenviar puertos
- Un teléfono Android
- Una cuenta de Expo para generar el APK

Las credenciales van en `api/.env`, que nunca se comparte. El archivo `api/.env.example` lista las variables necesarias.

## Etapa 1: API y base de datos en la PC

```bash
cd api
```

```bash
npm install
```

```bash
npm run db:migrar
```

Da de alta la cuenta exclusiva de administración siguiendo [las instrucciones de desarrollo](../../docs/desarrollo.md#cuentas-de-administración).

```bash
npm test
```

```bash
npm run dev
```

**Resultado esperado**: las pruebas pasan y `GET /v1/salud` responde 200.

## Etapa 2: túnel de VS Code

1. En VS Code, abre el panel **Puertos**.
2. Reenvía el puerto `3000`.
3. Cambia su visibilidad a **Pública**.
4. Copia la dirección y agrega `/v1` al final.

## Etapa 3: APK en el teléfono

```bash
npm run apk
```

Instala el APK. En la pantalla de inicio de sesión, abre **Servidor** y pega la dirección del túnel.

## Escenarios de validación

| N.º | Pasos | Resultado esperado | Cubre |
|---|---|---|---|
| 1 | Registrar una cuenta e intentar marcar | La cuenta queda pendiente y no marca | Historia 2 |
| 2 | Aprobar la cuenta como admin | La persona ya puede marcar | Historia 2 |
| 3 | Marcar con señal y GPS, midiendo el tiempo | Queda pendiente en menos de 10 segundos | SC-001 |
| 4 | Activar modo avión, marcar y volver a conectar | La marcación llega una sola vez | SC-002 |
| 5 | Negar el permiso de ubicación y marcar | Se guarda y queda observada | Historia 1 |
| 6 | Marcar entrada y salida como administrativo | Quedan las dos marcaciones | FR-008 |
| 7 | Marcar dos veces como operario | Queda una sola entrada | FR-008 |
| 8 | Aprobar eligiendo Proyecto | Pide el proyecto de la lista | FR-018 |
| 9 | Rechazar una entrada | Pide motivo y registra falta | FR-019 |
| 10 | Entrar con `admin.<DNI>` y luego con el DNI personal | La cuenta admin accede a gestión. La cuenta personal marca y queda pendiente de validación | FR-021 |
| 11 | Correr el cierre de un día sin marcación | Operario tiene falta; administrativo solo de lunes a viernes | FR-022 |
| 12 | Enviar una marcación sin conexión de un día con falta | La falta se anula con rastro | FR-023 |
| 13 | Pausar una cuenta y correr el cierre | No marca ni genera faltas | FR-006a |
| 14 | Corregir si un día es falta | Se conservan el original, motivo, autor y fecha | SC-003 |
| 15 | Intentar `UPDATE` sobre `marcaciones` en la base | PostgreSQL lo rechaza | Principio II |
| 16 | Abrir el historial con dos cuentas | Cada una ve solo lo suyo | Historia 5 |
| 17 | Marcar sin señal, cerrar sesión y entrar con otra cuenta | No se envía a nombre de la segunda | FR-011a |
| 18 | Marcar salida a las 20:00, aprobarla y luego rechazar otra | Da 90 minutos extra y el rechazo no crea falta | FR-019a |
| 19 | Fallar 5 veces la contraseña | La cuenta se bloquea 15 minutos | FR-005a |
| 20 | Tocar el botón de diseño en cada pantalla | Cambia el aspecto y conserva los datos | FR-030 |

## Antes del uso real

- Elegir el servidor final y publicar la API con HTTPS.
- Verificar que cada acceso administrativo corresponde a la persona autorizada.
- Generar un APK apuntando al servidor final, sin tráfico HTTP.
- Elegir un diseño y borrar los otros dos con el botón de cambio.
