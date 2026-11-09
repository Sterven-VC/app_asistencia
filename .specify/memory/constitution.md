<!--
Informe de impacto
- Versión: 1.2.0 → 2.0.0
- Principio modificado: III. Validación desde cuentas exclusivas de administración
- Restricciones: separación de cuentas de personal y de administración
- Secciones creadas: ninguna
- Secciones eliminadas: ninguna
- Plantillas: sin cambios. Los comandos leen este archivo al ejecutarse.
- Pendiente: ninguno.
-->
# Constitución de Asistencia TMT

## Principios fundamentales

### I. Marcar primero

- Una persona con cuenta aprobada DEBE poder marcar asistencia desde la pantalla inicial.
- En la primera versión, la persona solo marca. NO DEBE elegir Proyecto, Oficina ni Cita médica.
- Una función nueva NO DEBE agregar pasos a la marcación sin aprobación expresa.

Razón: el personal marca en obra y en oficina, muchas veces con prisa.

### II. Registro confiable (NO NEGOCIABLE)

- Cada marcación DEBE guardar quién marcó, la hora y la ubicación GPS disponible.
- La hora la registra el sistema. Ninguna persona DEBE poder escribirla ni cambiarla.
- Una marcación hecha sin conexión DEBE guardar la hora del teléfono y la hora de recepción.
  La admin DEBE ver ambas.
- Una marcación NO DEBE borrarse ni sobrescribirse.
- Una admin solo puede corregir si un día es falta o no. La hora NO DEBE corregirse.
- Toda corrección DEBE conservar el original y agregar motivo, autor y fecha.

Razón: la empresa debe poder confiar en el registro y saber qué cambió, quién lo cambió y por qué.

### III. Validación por la admin

- Una cuenta nueva NO DEBE poder marcar hasta que una admin la apruebe y confirme su rol.
- Cada marcación DEBE quedar pendiente hasta que una admin la apruebe o la rechace.
- Al aprobar una entrada, la admin DEBE asignar el tipo: Proyecto, Oficina o Cita médica.
- Rechazar una marcación DEBE requerir un motivo. Rechazar una entrada genera falta.
- La salida define el tiempo extra. Rechazarla quita ese tiempo y NO DEBE generar falta.
- Una marcación pendiente NO DEBE impedir que la persona marque en otro día.
- Las cuentas de administración DEBEN ser exclusivas para gestionar asistencia. Las personas que administran registran su propia asistencia con su cuenta de personal.
- Las cuentas de administración NO DEBEN poder marcar, tener historial personal ni generar faltas. Las marcaciones nuevas de las cuentas de personal pasan por la validación habitual.
- Si termina un día sin marcación, el sistema DEBE registrar una falta injustificada. Para personal
  operario aplica todos los días y para personal administrativo, de lunes a viernes.
- Si después llega una marcación sin conexión de ese día, la falta DEBE anularse con rastro.

Razón: el registro solo tiene valor para la empresa cuando una persona responsable lo revisó.

### IV. Funciona sin señal

- Una cuenta aprobada con sesión activa DEBE poder marcar sin conexión.
- La marcación DEBE guardarse en el teléfono antes de confirmarse a la persona.
- La app DEBE enviarla automáticamente al volver la conexión, sin perderla ni duplicarla.
- La persona DEBE poder ver si su marcación ya se envió.
- Si no hay ubicación disponible, la marcación DEBE guardarse y quedar observada para la admin.

Razón: en mina y en obra la señal y el GPS pueden fallar, y eso no debe dejar a nadie sin registro.

### V. Privacidad y datos mínimos

- La ubicación DEBE capturarse solo al marcar. NO DEBE existir seguimiento continuo ni en segundo
  plano.
- Cada persona DEBE ver solo sus propias marcaciones. Solo una admin DEBE ver las de todos.
- La ubicación de una marcación DEBE ser visible solo para esa persona y para una admin.
- Cita médica DEBE registrarse solo como tipo de asistencia. NO DEBE guardarse diagnóstico,
  especialidad ni nombre de la clínica.
- Una cuenta DEBE limitarse a estos datos: DNI, nombre 1, nombre 2, apellido paterno, apellido
  materno, número de referencia, rol y contraseña. El DNI es obligatorio. Agregar otro dato requiere
  enmendar esta constitución.

Razón: una ubicación y una cita médica son datos sensibles para quien marca.

### VI. Solo lo pedido

- NO DEBEN agregarse pantallas ni funciones que no se hayan pedido.
- Una decisión abierta DEBE preguntarse antes de asumirse.
- NO DEBEN presentarse datos simulados como definitivos.
- Cada cambio DEBE ser pequeño y tener un solo objetivo.

Razón: las funciones se definen durante el desarrollo y la app debe seguir siendo simple.

## Restricciones del proyecto

- **Entrega:** APK para Android.
- **Stack:** React Native, Expo, TypeScript, Expo Router y EAS Build.
- **Backend:** API propia con PostgreSQL en la PC durante el desarrollo, publicada con un túnel de
  VS Code para probar en el teléfono. El servidor del uso real DEBE aprobarse antes de implementarlo.
- **Diseño:** `DESIGN.md` es la fuente de verdad. Todo color DEBE salir de los tokens de tema.
  Mientras se comparan las tres propuestas, cada una mantiene sus propios tokens y NO DEBE
  mezclarse con las otras.
- **Secretos:** NO DEBEN subirse credenciales, tokens ni la clave de firma del APK.

| Rol | Puede hacer |
|---|---|
| Personal operario | Marcar asistencia y ver sus propias marcaciones |
| Personal administrativo | Marcar asistencia y ver sus propias marcaciones |
| Administración | Aprobar, pausar o desactivar cuentas de personal, validar marcaciones, corregir faltas y mantener proyectos |

Cada cuenta de administración tiene su propio identificador, contraseña y sesión. Se crea mediante
un comando de operación y queda fuera del registro público. Al separar una cuenta que ya tenía
ambos permisos, se DEBE conservar su rol laboral y su historial y revocar sus sesiones anteriores.

## Flujo de trabajo y calidad

- Las funciones DEBEN seguir este orden: especificación, plan, tareas e implementación.
- Una función NO DEBE darse por terminada sin probarse en un Android real o en un emulador.
- Las funciones de marcación DEBEN probarse también sin conexión y sin GPS.
- En el proyecto trabajan Claude y Codex. Antes de editar, cada uno DEBE volver a leer el archivo
  y NO DEBE pisar cambios ajenos. Todavía no se usa git.
- Todas las respuestas y los documentos del proyecto DEBEN estar en español.

## Gobernanza

- Esta constitución prevalece sobre otras reglas del proyecto. En diseño manda `DESIGN.md`.
- `AGENTS.md` es la guía de trabajo diaria y DEBE mantenerse alineada con este documento.
- Cada plan DEBE comprobar que cumple estos principios. Una excepción DEBE justificarse en el plan
  y aprobarse antes de implementarse.
- Una enmienda DEBE aprobarla el responsable del proyecto y dejar actualizado el informe de impacto.
- Las versiones siguen este criterio: MAJOR si se elimina o redefine un principio, MINOR si se
  agrega o amplía una regla, y PATCH si solo se aclara la redacción.

**Versión**: 2.0.0 | **Ratificada**: 2026-11-06 | **Última enmienda**: 2026-11-09
