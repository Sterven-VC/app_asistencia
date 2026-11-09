# Auditoría de seguridad y arquitectura de Asistencia TMT

Revisión del código de la app Expo, la API Fastify, las migraciones de PostgreSQL y las dependencias de producción. La revisión se hizo para la versión 0.1.4 y el entorno local.

## Cambios aplicados

| Hallazgo | Cambio |
| --- | --- |
| Una cuenta de personal también podía administrar | La migración 003 retira ese privilegio de las cuentas existentes, conserva sus identificadores y su historial, y revoca sus sesiones. La cuenta de administración se crea aparte con `admin.<DNI>` y contraseña exclusiva. Los eventos registran ambos pasos. |
| La separación dependía de controles repartidos por la app | La API protege todo `/v1/admin` con el mismo control. Las rutas de asistencia requieren una cuenta de personal. PostgreSQL impide cambiar el ámbito de una cuenta y rechaza registros de asistencia, faltas, pausas y correcciones cuyo titular sea una cuenta de administración. |
| Las sesiones y las solicitudes provocaban escrituras y podían quedar asociadas al servidor equivocado | Las sesiones administrativas caducan a las ocho horas. La API renueva las del personal como máximo una vez al día. La app vincula cada sesión a su servidor y requiere HTTPS, con excepciones de desarrollo para direcciones locales. |
| La API aceptaba cualquier origen web y registraba las rutas con sus parámetros | CORS acepta orígenes explícitos. Las respuestas usan `Cache-Control: no-store` y los registros de solicitudes usan la plantilla de la ruta. |
| Las instancias podían competir por la migración y las consultas de historial crecían sin índices específicos | PostgreSQL serializa las migraciones con un bloqueo transaccional. Hay índices para sesiones, pausas, historial, validaciones y faltas. Cada instancia abre hasta `DB_POOL_MAX` conexiones. |

Expo contiene la interfaz, la sesión y la cola de marcaciones sin conexión. Fastify concentra autorización y reglas en módulos de cuentas, marcaciones, validación, faltas y proyectos. PostgreSQL conserva el registro y aplica las restricciones de integridad. Se mantiene una API modular y una base de datos para el tamaño actual. [Guía de autorización de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [Bloqueos de PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS).

## Antes de usar datos reales

| Prioridad | Riesgo observado | Acción pendiente |
| --- | --- | --- |
| Alta | El PostgreSQL de desarrollo confía en procesos locales. La aplicación usa la misma conexión para migrar y atender peticiones. | En el servidor final, usar credenciales propias y acceso de red restringido. Separar el rol que aplica migraciones del rol de la API y concederle a este último solo los permisos que usa. |
| Alta | Un túnel público permite llegar a registro y login. El bloqueo por cuenta limita intentos, pero no limita el volumen total de peticiones. | Servir la API con HTTPS y configurar límites en el proxy para esas rutas. Medir el volumen normal antes de fijar los umbrales. |
| Alta | Cada sesión de administración da acceso a datos de personal y acciones de validación. La misma persona puede gestionar su propia marcación desde su acceso de administración. | Definir cómo se revisan las marcaciones del administrador y si se requiere segundo factor para gestionar. |
| Alta | El respaldo previo a la migración se restauró en una instancia aislada. La copia y el archivo de acceso tienen permisos restringidos en Windows. | Definir frecuencia de copias, retención, acceso y restauraciones periódicas para el servidor final. |
| Alta si se publica web | La app guarda la sesión de Android en SecureStore. La vista de desarrollo web usa `localStorage`, accesible al JavaScript del mismo origen. | Mantener la vista web para pruebas. Antes de habilitar acceso web real, diseñar sesiones web con cookies `HttpOnly` y protección CSRF. |
| Media | `npm audit --omit=dev` informó cinco avisos moderados de una misma cadena transitiva de herramientas de Expo, vinculada a `minimatch`. La API informó cero avisos. | Actualizar la cadena cuando el SDK de Expo tenga una combinación compatible y volver a compilar y probar el APK. |

[Gestión de sesiones de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [Límites de consumo en APIs según OWASP](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/), [Aviso de minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Cuando aumente el uso

- Medir la latencia y las conexiones de PostgreSQL. Ajustar `DB_POOL_MAX` al presupuesto compartido por todas las instancias.
- Incorporar paginación por cursor en los listados que hoy devuelven hasta 200 filas cuando los responsables necesiten consultar más registros.
- Ejecutar el cierre diario como tarea única si se sirve la API desde varias instancias. Ahora se programa en cada proceso de la API.

## Verificación de la versión

- 44 pruebas de la API en PostgreSQL aislado y 3 pruebas de la cola sin conexión.
- Ingreso y protección de rutas en ambos sentidos desde la app web, con cuentas sintéticas en Chrome.
- Migración aplicada en la base local. Se comprobó el acceso administrativo y la conservación de las dos cuentas de personal y sus registros.
- Falta verificar en Android la instalación y el arranque de la versión, además de GPS y sincronización sin conexión.
