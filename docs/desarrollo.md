# Cómo levantar el proyecto

## Estructura

```text
pry_asistencia/
├── AGENTS.md, CLAUDE.md     Reglas para Claude y Codex
├── DESIGN.md, PRODUCT.md    Marca y producto
├── app.config.ts, eas.json  Configuración de la app y del APK
├── src/                     App Expo
│   ├── app/(acceso)/        Inicio de sesión, registro y cuenta no activa
│   ├── app/(app)/           Pestañas de asistencia y administración
│   ├── app/(admin-detalles)/ Detalles protegidos de cuentas y marcaciones
│   ├── logica/              Lógica de cada pantalla
│   ├── disenos/             Una propuesta visual por skill
│   ├── services/            API, sesión y envío
│   └── db/                  SQLite del teléfono
├── api/                     API por módulos, migraciones y pruebas de integración
├── assets/                  Logo, iconos y fuentes
├── docs/                    Guías
├── specs/                   Especificaciones de Spec Kit
└── .local/                  Base de datos local, no se comparte
```

## Encender todo

Desde la raíz del proyecto:

```bash
npm run db:iniciar --prefix api
```

```bash
npm run dev --prefix api
```

La API queda en `http://localhost:3000/v1`. Al arrancar aplica migraciones y registra las faltas de los días que no se cerraron. Puedes comprobar que responde en `http://localhost:3000/v1/salud`.

## Cuentas de administración

Para marcar, el personal entra con su DNI y su contraseña habitual. Para gestionar, cada persona autorizada entra con `admin.<DNI>` y su propia contraseña administrativa. La sesión de administración dura ocho horas.

Para dar de alta a otra persona autorizada cuyo DNI ya está registrado, ejecuta desde la raíz en PowerShell. El comando pide una contraseña de 16 a 256 caracteres, distinta de la de personal.

```powershell
$claveAdmin = Read-Host 'Contraseña de administración' -AsSecureString
$env:ADMIN_CONTRASENA_EXCLUSIVA = [System.Net.NetworkCredential]::new('', $claveAdmin).Password
try {
    npm run db:crear-admin --prefix api -- 12345678
} finally {
    Remove-Item Env:ADMIN_CONTRASENA_EXCLUSIVA
    $claveAdmin.Dispose()
}
```

Si el DNI aún no existe, completa los datos de identidad `ADMIN_*` que figuran en `api/.env.example`. El comando requiere que las migraciones estén aplicadas.

Al pasar a la versión 0.1.4, vuelve a iniciar sesión. El historial y la cola de marcaciones siguen asociados a la cuenta de personal. Consulta los cambios y las tareas previas a producción en la [auditoría de seguridad y arquitectura](seguridad-y-arquitectura.md).

## Pruebas automatizadas

```bash
npm run typecheck
npm test
npm run typecheck --prefix api
npm test --prefix api
```

Las pruebas de la API requieren PostgreSQL encendido y usan la base `asistencia_tmt_test`.

## Probar en la PC

Con la API encendida, ejecuta `npx expo start --web` en otra terminal desde la raíz. Expo abre el navegador y refresca la vista al guardar cambios de TypeScript. Puedes comprobar el ingreso, los permisos y las pantallas con datos de prueba. Reserva el dispositivo o emulador Android para comprobar el arranque del APK, el GPS y la sincronización sin conexión.

## Probar en el celular

1. En VS Code, abre el panel **Puertos**.
2. Reenvía el puerto `3000`.
3. Cambia su visibilidad a **Pública**. Si queda privada, el teléfono recibe una página de inicio de sesión en vez de la API.
4. Copia la dirección y agrégale `/v1`.
5. En el APK, abre **Servidor** en la pantalla de inicio de sesión, pega la dirección y guárdala.

La PC y VS Code deben seguir encendidos mientras pruebas.
El túnel público expone la API a Internet. Úsalo temporalmente con datos de prueba y ciérralo cuando termines.

## Generar el APK

La primera vez inicia sesión en Expo:

```bash
npx eas-cli@latest login
```

Luego:

```bash
npm run apk
```

EAS compila en la nube y entrega un enlace de descarga.
La instalación y los escenarios con GPS y modo avión se validan según la [guía de Spec Kit](../specs/001-asistencia-v1/quickstart.md).

## Base de datos

- La base vive en `.local/postgres`, en el puerto 5434, y solo acepta conexiones de esta PC.
- Para verla en pgAdmin, usa `127.0.0.1`, puerto `5434`, usuario `asistencia`, sin contraseña.
- Para reemplazar un DNI, ejecuta el siguiente comando. Si existen una cuenta de personal y otra de administración para el DNI, se actualizan las dos.

```bash
npm run db:cambiar-dni --prefix api -- 00000000 12345678
```

## Revisar diseños sin servidor

Con `npx expo start --web`, abre la galería y elige la pantalla con `pantalla`. El botón de la esquina cambia la propuesta cuando la URL omite el parámetro `diseno`.

```text
http://localhost:8081/galeria?pantalla=marcar&barra=1
```
