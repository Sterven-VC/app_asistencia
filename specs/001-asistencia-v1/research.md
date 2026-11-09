# Investigación: Asistencia TMT, primera versión

Decisiones técnicas tomadas el 2026-11-06. Las versiones son las publicadas en npm ese día.

## 1. Entorno por etapas

- **Decisión**: probar primero en la PC del usuario, luego en un teléfono y publicar en un servidor antes del uso real.
- **Razón**: el usuario quiere validar el sistema en su PC. Un teléfono en obra no puede llegar a esa PC y, si está apagada, nada se sincroniza.
- **Alternativas**: publicar desde el inicio en un servidor, descartado por ahora. El servidor final queda pendiente antes del uso real.

| Etapa | Base de datos y API | App | Sirve para |
|---|---|---|---|
| 1. PC | Tu PC | Pruebas automáticas | Comprobar reglas de negocio |
| 2. Túnel | Tu PC, publicada con el reenvío de puertos de VS Code | Expo Go o APK en tu celular | Comprobar pantallas, GPS y modo sin señal |
| 3. APK | Tu PC, por el mismo túnel | APK en tu celular, con cualquier red | Comprobar la instalación real |
| 4. Uso real | Servidor por decidir | APK para el personal | Operación diaria |

## 2. API propia entre la app y PostgreSQL

- **Decisión**: la app nunca se conecta directo a la base. Habla con una API.
- **Razón**: las credenciales de la base no pueden viajar en un APK, y las reglas de hora, roles y rastro deben aplicarse en el servidor.
- **Alternativas**: conexión directa, descartada por seguridad.

## 3. Base de datos

- **Decisión**: PostgreSQL 17 local, con un clúster propio del proyecto en `.local/postgres`, puerto 5434, base `asistencia_tmt`.
- **Razón**: usa el programa ya instalado y no necesita la contraseña de los servidores que corren en los puertos 5432 y 5433. Cambiar de servidor es cambiar `DATABASE_URL`.
- **Alternativas**: MySQL, descartado porque no está instalado y PostgreSQL permite bloquear cambios con triggers sin complicaciones.

## 4. Stack de la API

- **Decisión**: Node.js 24, TypeScript, Fastify 5, Zod 4 y `pg`, con migraciones en SQL.
- **Razón**: un solo lenguaje en la app y la API. Los triggers y la vista son SQL, así que un ORM no aporta en este tamaño.
- **Alternativas**: NestJS, descartado por ser más grande de lo que necesitan 30 personas.

## 5. Autenticación

- **Decisión**: DNI y contraseña con hash Argon2id. Sesión con un token opaco guardado con hash en la base y en `expo-secure-store` en el teléfono. Dura 90 días y se renueva con el uso.
- **Razón**: un token que vive en la base se puede revocar al desactivar una cuenta. La sesión larga permite marcar sin señal por varios días.
- **Alternativas**: JWT, descartado porque revocarlo exige otra lista en la base.
- **Regla**: si la sesión venció sin conexión, las marcaciones guardadas se conservan y se envían al iniciar sesión otra vez.

## 6. Marcación sin conexión

- **Decisión**: `expo-sqlite` guarda cada marcación antes de confirmarla. Cada una tiene un UUID creado en el teléfono, que hace idempotente el envío.
- **Disparadores de envío**: al abrir la app, al volver la conexión con `@react-native-community/netinfo` y con `expo-background-task` mientras la app está cerrada.
- **Razón**: el UUID evita duplicados aunque un envío se repita.
- **Límite**: Android decide cuándo corre una tarea en segundo plano, así que con la app cerrada el envío puede demorar. Abrir la app siempre lo dispara.
- **Alternativas**: `AsyncStorage`, descartado porque no da transacciones.

## 7. Hora confiable

- **Decisión**: cada envío incluye la hora actual del teléfono. La API calcula `desfase_segundos` como hora del servidor menos esa hora, y define `hora_oficial` como hora del teléfono más ese desfase.
- **Razón**: corrige un reloj adelantado o atrasado sin depender de señal al marcar. Con conexión, el resultado coincide con la hora del servidor.
- **Límite**: si la persona cambia el reloj entre marcar y enviar, el cálculo se altera. Por eso la admin siempre ve la hora del teléfono y la de recepción.

## 8. Ubicación

- **Decisión**: `expo-location`, solo permiso en primer plano, con 7 segundos de espera al marcar.
- **Razón**: cumple la regla de no seguir a la persona. Sin ubicación en ese tiempo, la marcación se guarda observada.
- **Alternativas**: usar la última ubicación conocida, descartado porque puede ser de otro lugar.

## 9. Registro inalterable

- **Decisión**: las tablas de registro solo aceptan inserciones y triggers de PostgreSQL rechazan `UPDATE` y `DELETE`. El estado vigente sale de una vista.
- **Razón**: la regla se cumple aunque exista un error en la API.
- **Alternativas**: control solo en la API, descartado porque depende de que nadie se equivoque.

## 10. Faltas automáticas

- **Decisión**: un cierre diario corre a las 00:05 de Lima con `croner`. Al arrancar, la API procesa los días que no se cerraron.
- **Razón**: en la PC local, el proceso puede estar apagado a medianoche. El cierre es idempotente gracias a la tabla `cierres_dia`.

## 11. Interfaz

- **Decisión**: componentes propios sobre tokens de tema derivados de `DESIGN.md`, Onest con `@expo-google-fonts/onest`, iconos de `lucide-react-native` con grosor 1.8 y `react-native-svg`.
- **Razón**: `DESIGN.md` define medidas y estados propios. Los componentes nativos de `@expo/ui` no respetarían esa identidad.

## 12. Generación del APK

- **Decisión**: `eas build --platform android --profile preview`, con `android.buildType` en `apk`. Se compila en la nube de EAS.
- **Razón**: la PC no tiene Java ni Android Studio. EAS no los necesita.
- **Túnel**: el reenvío de puertos de VS Code entrega una dirección HTTPS. Como esa dirección puede cambiar, la pantalla de inicio de sesión del APK de prueba permite editarla sin recompilar.
- **HTTP local**: `app.config.ts` activa `usesCleartextTraffic` solo si `PERMITIR_HTTP` vale `1`. El perfil `preview` lo activa y el APK de uso real no.

## 13. Pruebas

- **Decisión**: Vitest contra una base `asistencia_tmt_test` para la API. `jest-expo` y Testing Library para la lógica de la app.
- **Razón**: las reglas de inmutabilidad viven en PostgreSQL, así que se prueban con una base real.

## Pendiente antes del uso real

- Elegir el servidor final y publicar la API con HTTPS.
- Confirmar con la empresa el plazo de conservación y el contenido legal del registro.
