# Frontend Design: "La mira"

- **Dirección.** El día se lee como una mira topográfica: regla graduada en E, con las cifras en el lado libre. Cada marcación es una lectura, con retícula naranja, hora grande y estado. El tramo entre entrada y salida se pinta en naranja.
- **Por qué.** La mira es un objeto del oficio de TMT y está hecha para leerse de lejos a pleno sol. Tinta grafito `#2E3338` sobre papel blanco da el máximo contraste, y el naranja queda solo para la acción y la lectura.
- **Composición.** La acción es una losa de borde a borde al alcance del pulgar, no un botón redondo. No hay tarjetas. En las listas por día, cada día es un tramo angosto de mira; Cuentas y Proyectos no la llevan porque no tienen eje de tiempo.
- **Tipografía.** Barlow Condensed 600/700 para horas, títulos y acciones, que caben grandes en 320 px. Barlow 500/600 para el texto. Se dejó Onest de lado para no hacer una lectura literal de DESIGN.md.
- **Sin consultar, 1.** "Sin señal" es una banda ámbar sólida con texto grafito (5.9:1), para que se vea al sol. Aprobar se bloquea con el texto "Elige el tipo" o "Elige el proyecto".
- **Sin consultar, 2.** Rechazar y Desactivar piden motivo en una hoja de confirmación. Cerrar sesión se confirma y avisa si hay marcaciones por enviar.
- **Sin consultar, 3.** La fecha de los filtros se elige entre los últimos 7 días o se escribe a mano. Las pausas se escriben como AAAA-MM-DD, porque no hay selector de fecha instalado.
- **Cambios ajenos conservados.** La corrección de faltas con `corregir(esFalta)`, el historial de validación y el cierre de hojas al terminar. Solo se cambió el separador "·" por comas.
