# Asistencia TMT

App Android para que el personal de Time Telemetry marque su asistencia con su ubicación. La admin valida cada marcación desde la misma app.

- **App:** Expo y React Native, en `src/`.
- **API:** Fastify y PostgreSQL, en `api/`.
- **Celular:** llega a la API con el reenvío de puertos de VS Code.

Esta guía deja otra PC con Windows funcionando igual que la PC de desarrollo. Los detalles del día a día están en [docs/desarrollo.md](docs/desarrollo.md).

## Requisitos

| Programa | Para qué | Nota |
|---|---|---|
| [Git](https://git-scm.com/download/win) | Clonar el proyecto | Incluye Git Bash, que usan los hooks de Claude |
| [Node.js 24 LTS](https://nodejs.org/) | App, API y scripts | |
| [PostgreSQL 17](https://www.postgresql.org/download/windows/) | Base de datos | Basta con instalar los programas; el proyecto crea su propio servidor |
| [VS Code](https://code.visualstudio.com/) | Probar en el celular | Con sesión de GitHub o Microsoft para reenviar puertos |
| Cuenta de [Expo](https://expo.dev/) | Generar el APK | Solo si vas a compilar uno nuevo |

PostgreSQL se busca en `C:\Program Files\PostgreSQL`. Si está en otra carpeta, define `PG_BIN` con la ruta de su carpeta `bin` antes de iniciar la base.

## 1. Clonar

```powershell
git clone https://github.com/Sterven-VC/app_asistencia.git
cd app_asistencia
```

## 2. Instalar dependencias

```powershell
npm install
npm install --prefix api
```

## 3. Crear la configuración local

```powershell
Copy-Item api/.env.example api/.env
```

Los valores por defecto sirven para la base local. `api/.env` nunca se sube a git.

## 4. Encender la base de datos

```powershell
npm run db:iniciar --prefix api
npm run db:migrar --prefix api
```

El primer arranque crea el servidor en `.local/postgres`, en el puerto `5434`, con las bases `asistencia_tmt` y `asistencia_tmt_test`. Solo acepta conexiones de la misma PC y no pide contraseña.

Tras reiniciar la PC, vuelve a ejecutar `npm run db:iniciar --prefix api`.

## 5. Crear la cuenta de administración

En una PC nueva la base está vacía. Antes de crear la cuenta:

1. Completa en `api/.env` los datos de identidad `ADMIN_NOMBRE_1`, `ADMIN_NOMBRE_2`, `ADMIN_APELLIDO_PATERNO`, `ADMIN_APELLIDO_MATERNO` y `ADMIN_NUMERO_REFERENCIA`.
2. Ejecuta lo siguiente en PowerShell, cambiando `12345678` por el DNI.

El comando pide una contraseña de 16 a 256 caracteres y no la guarda en ningún archivo.

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

La admin entra a la app con `admin.<DNI>` y esa contraseña.

Si vas a copiar la base de la otra PC, sáltate este paso y sigue [Copiar los datos de otra PC](#copiar-los-datos-de-otra-pc).

## 6. Encender la API

```powershell
npm run dev --prefix api
```

La API queda en `http://localhost:3000/v1`. Comprueba que responde en `http://localhost:3000/v1/salud`.

## 7. Ver la app

### En la PC

En otra terminal:

```powershell
npx expo start --web
```

La galería muestra las pantallas sin servidor, por ejemplo `http://localhost:8081/galeria?pantalla=marcar&barra=1`. El botón de la esquina cambia entre las tres propuestas de diseño.

### En el celular

1. En VS Code, abre el panel **Puertos** y reenvía el puerto `3000`.
2. Cambia su visibilidad a **Pública**.
3. Copia la dirección y agrégale `/v1`.
4. En el APK, abre **Servidor** en la pantalla de inicio de sesión, pega la dirección y guárdala.

Un APK ya instalado sirve con cualquier PC: solo hay que cambiarle el servidor. El túnel expone la API a Internet, así que ciérralo cuando termines de probar.

## 8. Generar un APK nuevo

Solo hace falta si cambió el código de la app.

```powershell
npx eas-cli@latest login
npm run apk
```

Usa la misma cuenta de Expo que en la otra PC, porque el proyecto está vinculado a ella en `app.config.ts`. EAS compila en la nube y entrega un enlace de descarga.

## Comprobar que todo funciona

Con la base encendida:

```powershell
npm run typecheck
npm test
npm run typecheck --prefix api
npm test --prefix api
```

## Copiar los datos de otra PC

Opcional. Sirve para llevar cuentas, marcaciones y faltas.

En la PC de origen, con la base encendida:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -h 127.0.0.1 -p 5434 -U asistencia -Fc -f asistencia.dump asistencia_tmt
```

En la PC nueva, después del paso 4 pero sin ejecutar `db:migrar`:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\pg_restore.exe" -h 127.0.0.1 -p 5434 -U asistencia -d asistencia_tmt --no-owner asistencia.dump
```

Si ya habías migrado, la base tiene tablas y la restauración choca con ellas. En ese caso borra `.local/postgres` con la base detenida y empieza de nuevo desde el paso 4.

El respaldo contiene datos personales: pásalo por un medio privado y bórralo después. `*.dump` está excluido de git.

## Lo que no está en git

| Archivo o carpeta | Por qué | Cómo se recupera |
|---|---|---|
| `node_modules/` | Dependencias | `npm install` |
| `api/.env` | Configuración local y claves | Copiar `api/.env.example` |
| `.local/` | Base de datos y registros | `npm run db:iniciar --prefix api`, o restaurar un respaldo |
| `.expo/`, `dist/` | Archivos generados por Expo | Se crean solos |
| APK y llaves de firma | Los guarda EAS | `npm run apk` |
