# UI/UX Pro Max: notas

- **Dirección:** "señalética de obra", con Exaggerated Minimalism y reglas Swiss (método `ui-ux-pro-max`, `--design-system`). La letra es enorme, con tinta sobre blanco y cero radios ni sombras. Un solo acento naranja de marca y reglas de 2 px como única estructura.
- **Por qué:** al sol y con guantes, una palabra de 60 a 96 px y un bloque de borde a borde se leen y se tocan sin apuntar. En Marcar, todo el bloque inferior es el botón y la palabra gigante dice qué toca.
- **Tipografía:** Archivo 900 para los carteles, Archivo 500/700 para la interfaz y JetBrains Mono para horas, DNI y coordenadas. El generador sugirió Cormorant/Montserrat, pensadas para lujo y moda; las descarté. JetBrains Mono viene del par "Developer Mono" del mismo método.
- **Estados:** placas sólidas con icono y texto, en vez de chips pálidos, para leerse al sol (pauta Inclusive Design del método). Vacío se muestra como un "0" grande; la carga, con filas esqueleto con pulso, la única animación continua.
- **Navegación:** tablero en vez de pestañas. El personal ve 2 celdas anchas; la admin, una rejilla de 3 x 2 con los 6 rótulos visibles y sin "Más".
- **Decisiones tomadas sin consultar:** el detalle de marcación muestra la hora del teléfono y la de recepción solo si `sin_conexion`. Aprobar queda deshabilitado mientras falte el tipo o el proyecto. Rechazar abre una hoja con el motivo y su consecuencia.
- **Más decisiones:** el día se recorre con flechas, más una celda que alterna entre "Hoy" y "Todas". Las fechas de pausa y corrección se escriben solo con números y el guion lo pone el campo. Hay vibración al pulsar Marcar y al guardarse una marca, solo en Android.
- **Paleta:** otra persona cambió las tintas de `tema.ts` a los grises de DESIGN.md (#2E3338 y #494949) y se respetó ese cambio.
