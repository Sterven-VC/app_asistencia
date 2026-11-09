# Especificación de función: Asistencia TMT, primera versión

**Carpeta de la función**: `specs/001-asistencia-v1`

**Creada**: 2026-11-06

**Estado**: Borrador

**Pedido**: Primera versión de Asistencia TMT. El personal se registra, una admin aprueba su cuenta, la persona marca asistencia con ubicación, incluso sin señal, y la admin valida cada marcación y le asigna el tipo. Si termina el día sin marcación, se registra una falta injustificada.

## Clarifications

### Session 2026-11-06

- Q: ¿Desde dónde aprueba cuentas y valida marcaciones la admin? → A: En la misma app Android.
- Q: Al aprobar como Proyecto, ¿basta el tipo o se indica cuál proyecto? → A: La admin elige el proyecto de una lista que ella mantiene.
- Q: ¿Una marcación rechazada cuenta como falta injustificada? → A: Sí. Si fue un error, la admin lo corrige con motivo.
- Q: ¿Quién asigna el tipo en una marcación autoaprobada antes de la separación? → A: La misma persona desde su cuenta exclusiva de administración, con rastro.
- Q: ¿Qué pasa con quien deja la empresa o sale de vacaciones? → A: La admin desactiva la cuenta o la pausa por fechas. Mientras tanto no marca ni genera faltas, y su historial se conserva.
- Q: ¿La admin puede corregir la hora? → A: No. Solo corrige si un día es falta o no.
- Q: ¿Qué pasa al rechazar una salida? → A: La salida sirve para el tiempo extra. Rechazarla quita ese tiempo y no genera falta.
- Q: ¿Habrá más de una admin? → A: Habrá varias, pero por ahora se trabaja con una.
- Q: ¿Cómo se recupera una contraseña? → A: Se definirá después. Por ahora no se construye.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia 1 - Marcar asistencia (Prioridad: P1)

Una persona con cuenta aprobada abre la app y marca su asistencia. El sistema guarda quién marcó, la hora y la ubicación. La marcación funciona aunque no haya señal ni GPS.

**Por qué esta prioridad**: es la razón de ser de la app. Sin esto no existe registro de asistencia.

**Prueba independiente**: con una cuenta ya aprobada, marcar con señal, sin señal y sin GPS, y comprobar que cada marcación queda guardada con sus datos.

**Escenarios de aceptación**:

1. **Dado** que tengo una cuenta aprobada y sesión activa, **cuando** marco asistencia con señal y GPS, **entonces** la marcación queda registrada con mi persona, la hora y la ubicación, y queda pendiente de validación.
2. **Dado** que no tengo señal, **cuando** marco asistencia, **entonces** la marcación se guarda en el teléfono, veo que aún no se envió y se envía sola cuando vuelve la conexión.
3. **Dado** que el GPS no está disponible o el permiso está negado, **cuando** marco asistencia, **entonces** la marcación se guarda sin ubicación y queda observada para la admin.
4. **Dado** que toqué la acción de marcar dos veces seguidas, **cuando** el sistema procesa el pedido, **entonces** queda una sola marcación.
5. **Dado** que soy personal operario, **cuando** marco en el día, **entonces** se registra mi entrada y no se me pide salida.
6. **Dado** que soy personal administrativo y ya marqué mi entrada, **cuando** vuelvo a marcar ese día, **entonces** se registra mi salida.

---

### Historia 2 - Registrar una cuenta y aprobarla (Prioridad: P1)

Una persona llena sus datos y elige si es personal operario o administrativo. Su cuenta queda pendiente hasta que una admin la apruebe y confirme su rol.

**Por qué esta prioridad**: sin cuentas aprobadas nadie puede marcar, y el registro debe poder atribuirse a una persona real.

**Prueba independiente**: registrar una cuenta, comprobar que no puede marcar, aprobarla como admin y comprobar que ya puede marcar.

**Escenarios de aceptación**:

1. **Dado** que soy una persona nueva, **cuando** envío mis datos, **entonces** mi cuenta queda pendiente y no puedo marcar.
2. **Dado** que dejo el DNI vacío o uso uno ya registrado, **cuando** envío mis datos, **entonces** la cuenta no se registra y veo qué debo corregir.
3. **Dado** que soy admin y hay una cuenta pendiente, **cuando** la apruebo y confirmo o cambio su rol, **entonces** esa persona ya puede marcar.
4. **Dado** que me estoy registrando, **cuando** elijo mi rol, **entonces** solo puedo elegir personal operario o personal administrativo, nunca admin.

---

### Historia 3 - Validar marcaciones (Prioridad: P2)

La admin revisa las marcaciones del personal, las aprueba asignando el tipo o las rechaza con un motivo.

**Por qué esta prioridad**: da valor al registro para la empresa, pero la marcación puede existir y esperar revisión.

**Prueba independiente**: con marcaciones pendientes, aprobar una asignando el tipo, rechazar otra con motivo y comprobar el estado que ve cada persona.

**Escenarios de aceptación**:

1. **Dado** que soy admin y hay marcaciones pendientes, **cuando** las reviso, **entonces** veo la persona, la hora, la ubicación y si están observadas.
2. **Dado** que apruebo una entrada, **cuando** confirmo, **entonces** debo asignar Proyecto, Oficina o Cita médica, y si es Proyecto debo elegir cuál de la lista.
3. **Dado** que rechazo una entrada, **cuando** confirmo, **entonces** debo escribir un motivo y ese día queda como falta injustificada.
4. **Dado** que la marcación se hizo sin conexión, **cuando** la reviso, **entonces** veo la hora del teléfono y la hora de recepción.
5. **Dado** que una persona administra la asistencia, **cuando** marca con su cuenta de personal, **entonces** el registro queda pendiente de validación igual que los demás.
6. **Dado** que una persona marcó su salida a las 20:00 y su horario termina a las 18:30, **cuando** apruebo la salida, **entonces** se consideran 90 minutos de tiempo extra.
7. **Dado** esa misma salida, **cuando** la rechazo con un motivo, **entonces** no se considera tiempo extra y no se registra falta.

---

### Historia 4 - Registrar faltas injustificadas (Prioridad: P2)

Si una persona termina el día sin marcación, el sistema registra una falta injustificada.

**Por qué esta prioridad**: completa el registro diario sin que la admin tenga que buscar ausencias a mano.

**Prueba independiente**: dejar pasar un día sin marcar con una cuenta aprobada y comprobar que aparece la falta. Luego enviar una marcación sin conexión de ese día y comprobar que la falta se anula con rastro.

**Escenarios de aceptación**:

1. **Dado** que soy personal operario con cuenta aprobada, **cuando** termina cualquier día sin marcación mía, **entonces** se registra una falta injustificada.
2. **Dado** que soy personal administrativo con cuenta aprobada, **cuando** termina un día de lunes a viernes sin marcación mía, **entonces** se registra una falta injustificada.
3. **Dado** que soy personal administrativo, **cuando** termina un sábado o domingo sin marcación mía, **entonces** no se registra falta.
4. **Dado** que tengo una falta registrada, **cuando** llega una marcación sin conexión hecha ese mismo día, **entonces** la falta se anula y queda rastro de ello.

---

### Historia 5 - Ver mis marcaciones (Prioridad: P3)

Cada persona consulta sus propias marcaciones y faltas, con su estado.

**Por qué esta prioridad**: da confianza a la persona, pero no impide que el registro funcione.

**Prueba independiente**: marcar con dos cuentas y comprobar que cada una ve solo lo suyo.

**Escenarios de aceptación**:

1. **Dado** que tengo marcaciones, **cuando** abro mi historial, **entonces** veo fecha, hora, estado, tipo asignado y motivo de rechazo si existe.
2. **Dado** que hay marcaciones de otras personas, **cuando** abro mi historial, **entonces** no las veo.

---

### Historia 6 - Corregir si un día es falta (Prioridad: P3)

La admin decide si un día es falta o no, sin perder el dato original. La hora nunca se corrige.

**Por qué esta prioridad**: es necesaria para resolver errores, pero ocurre menos que el flujo diario.

**Prueba independiente**: corregir un día y comprobar que se conservan el original, el motivo, el autor y la fecha.

**Escenarios de aceptación**:

1. **Dado** que soy admin, **cuando** indico si un día es falta o no, **entonces** debo escribir un motivo y el original se conserva.
2. **Dado** que no soy admin, **cuando** veo mis marcaciones, **entonces** no puedo corregirlas.

---

### Casos límite

- Si el teléfono se pierde o se daña antes de enviar una marcación, esa marcación se pierde y la falta del día se resuelve con una corrección de la admin.
- Si la persona cierra sesión con marcaciones sin enviar, esas marcaciones no se pierden y se envían cuando esa misma persona inicie sesión. Nunca se envían a nombre de otra.
- Si la sesión vence sin señal, las marcaciones guardadas se conservan hasta iniciar sesión otra vez.
- Si ya existe una marcación de esa clase ese día, la nueva se guarda como repetida y queda observada.
- Si una persona marcó sin señal mientras su cuenta estaba pausada o desactivada, la marcación se guarda y queda observada.
- Una salida hecha dentro de las 16 horas siguientes a una entrada abierta pertenece al día de esa entrada, aunque pase la medianoche.
- Si el reloj del teléfono está cambiado, la admin ve la diferencia entre la hora del teléfono y la hora de recepción.
- Una marcación hecha desde una cuenta de personal queda observada si falta la ubicación, incluso si la persona también administra la asistencia.
- La primera cuenta admin usa un DNI temporal hasta que se registre el real.
- Los feriados y los turnos especiales no se calculan solos: la admin corrige las faltas que correspondan.
- Si una persona de personal administrativo marca su entrada y no su salida, la marcación queda observada para la admin.

## Requisitos *(obligatorio)*

### Requisitos funcionales

**Cuentas**

- **FR-001**: La persona DEBE registrarse con DNI, nombre 1, apellido paterno, apellido materno, número de referencia, rol y contraseña de al menos 8 caracteres. El nombre 2 es opcional. El DNI es obligatorio y único entre las cuentas de personal.
- **FR-002**: Al registrarse, la persona DEBE elegir solo entre personal operario y personal administrativo.
- **FR-003**: Una cuenta nueva DEBE quedar pendiente y NO DEBE poder marcar.
- **FR-004**: La admin DEBE poder ver las cuentas pendientes, aprobarlas y confirmar o cambiar su rol.
- **FR-005**: La persona DEBE iniciar sesión con su DNI y su contraseña.
- **FR-005a**: Tras 5 intentos fallidos seguidos, el inicio de sesión de esa cuenta DEBE bloquearse por 15 minutos.
- **FR-006**: Cada persona que administra DEBE usar una cuenta exclusiva, creada por un operador autorizado con contraseña independiente. La cuenta de personal conserva su rol laboral y su historial.
- **FR-006a**: La admin DEBE poder desactivar una cuenta o pausarla entre dos fechas. Mientras tanto la persona NO DEBE poder marcar ni generar faltas, y su historial DEBE conservarse.

**Marcación**

- **FR-007**: La persona con cuenta aprobada DEBE poder marcar desde la pantalla inicial, sin elegir un tipo de asistencia.
- **FR-008**: El personal operario DEBE registrar solo su entrada. El personal administrativo DEBE registrar entrada y salida.
- **FR-008a**: El sistema DEBE calcular los minutos de tiempo extra como la diferencia entre la salida y el fin del horario, que es 18:30 por defecto.
- **FR-009**: Cada marcación DEBE guardar la persona, la hora y la ubicación disponible. La persona NO DEBE poder escribir ni cambiar la hora.
- **FR-010**: La marcación DEBE funcionar sin conexión para una cuenta aprobada con sesión activa, y guardarse en el teléfono antes de confirmarse.
- **FR-011**: Las marcaciones sin enviar DEBEN enviarse automáticamente al volver la conexión, sin perderse ni duplicarse.
- **FR-011a**: Cada marcación guardada en el teléfono DEBE conservar la cuenta que la hizo, y solo DEBE enviarse con la sesión de esa cuenta.
- **FR-011b**: Una segunda marcación de la misma clase y día DEBE guardarse como repetida y quedar observada.
- **FR-012**: Una marcación sin conexión DEBE guardar la hora del teléfono y la hora de recepción.
- **FR-013**: Si no hay ubicación, la marcación DEBE guardarse y quedar observada, indicando que faltó la ubicación.
- **FR-014**: La ubicación DEBE capturarse solo al marcar. NO DEBE existir seguimiento continuo ni en segundo plano.
- **FR-015**: La persona DEBE poder ver si cada marcación ya se envió.

**Validación**

- **FR-016**: Toda marcación de personal operario o administrativo DEBE quedar pendiente hasta que una admin la apruebe o la rechace.
- **FR-017**: La admin DEBE poder ver las marcaciones de todas las personas, con sus horas, ubicación y observaciones, desde la misma app Android. DEBE poder filtrarlas por estado, persona, fecha, observadas y sin tipo.
- **FR-018**: Al aprobar una entrada, la admin DEBE asignar el tipo: Proyecto, Oficina o Cita médica. Si el tipo es Proyecto, DEBE elegir el proyecto de la lista.
- **FR-018a**: La admin DEBE poder mantener la lista de proyectos. Un proyecto ya usado en una marcación NO DEBE perderse del registro.
- **FR-019**: Al rechazar, la admin DEBE escribir un motivo. Si rechaza una entrada, ese día DEBE registrarse como falta injustificada, aunque sea sábado o domingo.
- **FR-019a**: Aprobar una salida DEBE considerar su tiempo extra. Rechazarla NO DEBE considerarlo y NO DEBE generar falta.
- **FR-020**: Una marcación pendiente NO DEBE impedir que la persona marque en otro día.
- **FR-021**: La cuenta de administración solo DEBE acceder a funciones de gestión. La asistencia se registra desde la cuenta de personal y queda pendiente de validación. Las autoaprobaciones históricas conservan su autoría.

**Faltas**

- **FR-022**: Si termina el día sin marcación de una cuenta de personal activa, el sistema DEBE registrar una falta injustificada. Para personal operario aplica todos los días. Para personal administrativo aplica de lunes a viernes.
- **FR-023**: Si después llega una marcación sin conexión de ese día, la falta DEBE anularse con rastro.

**Historial y correcciones**

- **FR-024**: Cada persona DEBE ver solo sus marcaciones y faltas, con fecha, hora, estado, tipo y motivo de rechazo.
- **FR-025**: Una marcación NO DEBE borrarse ni sobrescribirse.
- **FR-026**: Solo una admin DEBE poder corregir si un día es falta o no. La hora NO DEBE corregirse. Toda corrección DEBE conservar el original y guardar motivo, autor y fecha.

**Privacidad**

- **FR-027**: La ubicación de una marcación DEBE ser visible solo para esa persona y para una admin.
- **FR-028**: Cita médica DEBE guardarse solo como tipo. NO DEBE guardarse diagnóstico, especialidad ni nombre de la clínica.
- **FR-029**: El sistema NO DEBE pedir datos de cuenta distintos a los de FR-001.

**Comparación de diseños**

- **FR-030**: Mientras se comparan las propuestas, un botón en una esquina DEBE cambiar la pantalla actual entre los diseños generados por `ui-ux-pro-max`, `impeccable` y `frontend-design`, sin perder los datos de la pantalla.

### Entidades clave

- **Cuenta**: acceso de una persona a la app. El rol define si es operario, administrativo o admin. Una persona puede tener una cuenta de personal y otra de administración con el mismo DNI y contraseñas independientes.
- **Marcación**: registro de asistencia de una persona. Tiene horas, ubicación, estado de envío, estado de validación, tipo y observación.
- **Proyecto**: nombre de un proyecto de la lista que mantiene la admin. Una marcación aprobada como Proyecto apunta a uno.
- **Falta**: día sin marcación de una persona. Puede quedar anulada.
- **Corrección**: decisión de una admin sobre si un día es falta o no. Conserva el dato original, el motivo, el autor y la fecha.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Una persona con sesión activa completa una marcación en menos de 10 segundos.
- **SC-002**: El 100 % de las marcaciones hechas sin conexión llegan una sola vez cuando vuelve la conexión.
- **SC-003**: El 100 % de las correcciones conservan el dato original, el motivo, el autor y la fecha.
- **SC-004**: Una admin valida una marcación en menos de 30 segundos.
- **SC-005**: Una persona completa su registro en menos de 3 minutos.
- **SC-006**: El 90 % del personal marca sin ayuda en su primer intento.
- **SC-007**: Con el servidor encendido, el 100 % de los días sin marcación quedan registrados como falta antes de la primera hora del día siguiente. Si estuvo apagado, se registran al arrancar.

## Supuestos

- Cada persona usa su propio teléfono Android y tiene una sola cuenta.
- El día calendario se calcula con la hora de Perú.
- Para marcar sin conexión, la persona ya inició sesión al menos una vez con conexión.
- En desarrollo, la API y PostgreSQL corren en la PC y el teléfono llega a ellas con un túnel de VS Code.
- El horario del personal administrativo termina a las 18:30. Por ahora es el mismo para todos.
- La recuperación de contraseñas queda fuera de esta versión. Se definirá después.
- Los registros se conservan al menos cinco años, según el D.S. 004-2006-TR. La empresa debe confirmar este plazo.
- Quedan fuera de esta versión: foto al marcar, notificaciones y aplicaciones para iOS.
