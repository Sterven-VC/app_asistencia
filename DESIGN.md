---
version: alpha
name: Time Telemetry
description: Identidad visual de Time Telemetry (TMT). Instrumentación y monitoreo automatizado. Un solo acento naranja sobre superficies neutras, tipografía Onest y datos legibles bajo el sol.
titulo: DESIGN
tipo: diseno
fase: transversal
estado: vigente
actualizado: 2026-11-06
tags:
  - diseno
  - marca
  - tmt
  - design-md
colors:
  primary: "#EF6535"
  primary-dark: "#DB3A14"
  tint: "#FDF0E8"
  on-primary: "#FFFFFF"
  on-header: "#1A1A1A"
  text: "#494949"
  text-secondary: "#6B6B6B"
  bg: "#FFFFFF"
  bg-alt: "#F9F9F9"
  border: "#E2E2E2"
  border-strong: "#C4C4C4"
  success: "#2E7D32"
  success-deep: "#1B5E20"
  success-bg: "#E8F5E9"
  warning: "#E8A33D"
  warning-text: "#8A5D00"
  warning-bg: "#FDF4E6"
  danger: "#C62828"
  danger-text: "#B3261E"
  danger-bg: "#FCEAE5"
  info-text: "#3C4A57"
  info-bg: "#EEF1F4"
  head-dark: "#2E3338"
  head-dark-sub: "#B9C0C7"
typography:
  page-title:
    fontFamily: Onest
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.2
  reading:
    fontFamily: Onest
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "'tnum' 1"
  h1:
    fontFamily: Onest
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: Onest
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
  h3:
    fontFamily: Onest
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: Onest
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-strong:
    fontFamily: Onest
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
  label:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  label-strong:
    fontFamily: Onest
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: Onest
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  caption-strong:
    fontFamily: Onest
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1
  micro:
    fontFamily: Onest
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1
rounded:
  sm: 4px
  inner: 9px
  control-web: 10px
  md: 12px
  lg: 14px
  tile: 20px
  panel: 24px
  full: 999px
spacing:
  space-1: 4px
  space-2: 8px
  space-3: 12px
  space-4: 16px
  space-5: 24px
  space-6: 32px
  space-7: 48px
  gutter: 16px
  gutter-web: 64px
  touch-min: 48px
  touch-recommended: 56px
  touch-gap: 8px
  input-height: 56px
  control-height-card: 48px
  head-height: 104px
  head-height-web: 88px
  crumbs-height-web: 48px
  foot-height-web: 72px
  layout-width: 375px
  layout-width-web: 1440px
components:
  page:
    backgroundColor: "{colors.bg-alt}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
  header:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.h1}"
    height: 104px
  header-web:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.h3}"
    height: 88px
  brand-band:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h2}"
  login-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-header}"
    height: 268px
  button-primary:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.lg}"
    height: 56px
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.lg}"
    height: 56px
  button-neutral:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.h3}"
    rounded: "{rounded.lg}"
    height: 56px
  button-quiet:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 56px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.lg}"
    height: 56px
  button-create:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    size: 56px
  button-icon:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.md}"
    size: 44px
  button-web:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.control-web}"
    height: 44px
    padding: 0 24px
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 56px
    padding: 0 16px
  input-error:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 56px
    padding: 0 16px
  card:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 16px
  list-row:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  list-row-selected:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  list-row-web:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 22px 24px
  avatar:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.md}"
    size: 44px
  menu-tile:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.tile}"
    size: 64px
  chip-accent:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.text}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  chip-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success-deep}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  chip-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  chip-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger-text}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  chip-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info-text}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  chip-neutral:
    backgroundColor: "{colors.bg-alt}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption-strong}"
    rounded: "{rounded.full}"
    padding: 3px 8px
  alert-info:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.text}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.text}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  alert-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger-text}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  badge-count:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    size: 18px
  progress-track:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.full}"
    height: 6px
  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    height: 6px
  progress-fill-waiting:
    backgroundColor: "{colors.warning}"
    rounded: "{rounded.full}"
    height: 6px
  progress-fill-complete:
    backgroundColor: "{colors.success}"
    rounded: "{rounded.full}"
    height: 6px
  sheet:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 16px
  sheet-handle:
    backgroundColor: "{colors.border-strong}"
    rounded: "{rounded.full}"
    width: 40px
    height: 4px
  toast:
    backgroundColor: "{colors.head-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
  toast-detail:
    backgroundColor: "{colors.head-dark}"
    textColor: "{colors.head-dark-sub}"
    typography: "{typography.caption}"
---

# Time Telemetry · DESIGN.md

> [!abstract] En una frase
> Superficies neutras, un solo acento naranja que se usa para actuar, Onest en tamaños generosos y el dato como protagonista.

> [!info] Cómo usar este archivo
> Sigue el formato [DESIGN.md](https://github.com/google-labs-code/design.md) (versión `alpha`): tokens en el YAML de arriba y explicación abajo. **Es la fuente de verdad del diseño de Asistencia TMT.** Si el código difiere, se corrige el código. Los ejemplos en CSS se traducen según `Adaptación a React Native`.

## Overview

### Quién es la marca

Time Telemetry (TMT) hace **instrumentación y monitoreo automatizado** en geotecnia, medio ambiente y geoespacial, sobre todo para minería y construcción. Su personal trabaja en obra y en oficina, así que la identidad tiene que transmitir precisión antes que novedad.

### Personalidad

| Es | No es |
|---|---|
| Técnica y exacta | Decorativa |
| Sobria y confiable | Fría o burocrática |
| Directa, sin relleno | Publicitaria |
| Industrial con buen acabado | Tosca o improvisada |

### Estilo visual

**Funcional moderno.** Tarjetas blancas sobre un gris casi blanco, borde fino, sombra apenas visible, esquinas de 12 px y letra grande. El color de marca aparece poco y siempre significa algo. La única pieza expresiva es la banda naranja de portada, con su degradado y su aro translúcido.

### Principios

1. **Nada redundante ni obvio.** Es la regla principal. Antes de poner un texto, un rótulo o un prefijo, se pregunta si dice algo que la persona no sabe ya por lo que ve. Si no, no va.
2. **El dato es el protagonista.** Una lectura es lo más grande y legible de la pantalla.
3. **El naranja se gana.** Se reserva para la acción principal y el estado activo. Lo demás es gris.
4. **El color nunca comunica solo.** Todo estado lleva además icono o texto.
5. **El contexto manda sobre la estética.** Si algo se ve bien en un monitor y falla bajo el sol, con guantes y con prisa, está mal.
6. **Ningún elemento se monta sobre otro.** Las alturas se miden, no se estiman.

## Colors

### Marca

| Token | Variable CSS | HEX | RGB | Uso |
|---|---|---|---|---|
| `primary` | `--color-primary` | `#EF6535` | 239, 101, 53 | Acento: bordes activos, foco, barras de avance, subrayado de navegación, cabecera del login |
| `primary-dark` | `--color-primary-dark` | `#DB3A14` | 219, 58, 20 | Fondo de botón, banda de portada, enlaces e iconos de acción |
| `tint` | `--color-tint-bg` | `#FDF0E8` | 253, 240, 232 | Fondo de avatar, elemento elegido, aviso informativo y chip de acento |
| `on-primary` | `--color-text-on-primary` | `#FFFFFF` | 255, 255, 255 | Texto sobre `primary-dark` |
| `on-header` | `--color-text-on-header` | `#1A1A1A` | 26, 26, 26 | Texto chico directo sobre `primary` |

### Neutros

| Token | Variable CSS | HEX | Uso |
|---|---|---|---|
| `text` | `--color-text` | `#494949` | Texto principal, títulos y valores |
| `text-secondary` | `--color-text-secondary` | `#6B6B6B` | Metadatos, ayudas, unidades e iconos neutros |
| `bg` | `--color-bg` | `#FFFFFF` | Tarjetas, cabeceras, campos y hojas |
| `bg-alt` | `--color-bg-alt` | `#F9F9F9` | Fondo de página |
| `border` | `--color-border` | `#E2E2E2` | Bordes de tarjeta y campo, separadores, riel de avance |
| `border-strong` | `--color-border-strong` | `#C4C4C4` | Botón neutro, casilla sin marcar, asa de hoja |

### Estados

Nunca toman el acento: el naranja significa acción, no advertencia.

| Estado | Significado | Sólido | Texto | Fondo |
|---|---|---|---|---|
| Éxito | Listo, aprobado, vigente | `success` `#2E7D32` | `success-deep` `#1B5E20` | `success-bg` `#E8F5E9` |
| Advertencia | Hay que saberlo o falta algo, no bloquea | `warning` `#E8A33D` | `warning-text` `#8A5D00` | `warning-bg` `#FDF4E6` |
| Peligro | Error, devuelto, irreversible | `danger` `#C62828` | `danger-text` `#B3261E` | `danger-bg` `#FCEAE5` |
| Espera | Depende de otra persona | n/a | `info-text` `#3C4A57` | `info-bg` `#EEF1F4` |

### Superficie oscura

`head-dark` `#2E3338` con `head-dark-sub` `#B9C0C7`. Solo para avisos flotantes. No es un modo oscuro: **TMT no tiene modo oscuro**.

### Contraste medido

Calculado con la fórmula WCAG 2.x. Texto normal pide 4.5:1; texto grande (24 px, o 19 px en negrita) e iconos piden 3:1.

| Combinación | Ratio | Sirve para |
|---|---|---|
| `text` sobre `bg` | 9.00 | Todo |
| `text` sobre `bg-alt` | 8.55 | Todo |
| `text` sobre `tint` | 8.06 | Todo |
| `text-secondary` sobre `bg` | 5.33 | Todo |
| `text-secondary` sobre `bg-alt` | 5.06 | Todo |
| `text-secondary` sobre `tint` | 4.77 | Todo |
| `on-primary` sobre `primary-dark` | 4.54 | Todo |
| `primary-dark` sobre `bg` | 4.54 | Todo |
| `on-header` sobre `primary` | 5.46 | Todo |
| `primary-dark` sobre `bg-alt` | 4.31 | Solo texto grande e iconos |
| `primary-dark` sobre `tint` | 4.06 | Solo texto grande e iconos |
| `on-primary` sobre `primary` | 3.19 | Solo texto grande e iconos |
| `primary` sobre `bg` | 3.19 | Solo bordes e iconos |
| `primary` sobre `tint` | 2.86 | Solo decoración |
| `warning` sobre `bg` | 2.16 | Nunca para texto: bordes y barras |

Los estados cumplen AA en su par: `success-deep` sobre `success-bg` 7.00, `warning-text` sobre `warning-bg` 5.28, `danger-text` sobre `danger-bg` 5.62, `info-text` sobre `info-bg` 8.02. `border` (1.30) y `border-strong` (1.74) son líneas de apoyo: un control nunca depende solo de su borde para reconocerse.

### Reglas de combinación

- **Texto chico sobre color:** fondo `primary-dark` con blanco. Sobre `primary` claro, `on-header`.
- **Texto de acento (`primary-dark`):** solo sobre `bg` blanco. Sobre `bg-alt` o `tint`, el texto va en `text`.
- **Icono sobre `tint`:** `primary-dark`, nunca `primary`.
- **`warning`:** relleno y borde. Si hay texto, va en `warning-text`.
- **Los tonos del logo no son tokens.** Su naranja es otro; ver `Logo`.

## Typography

### Familia

**Onest**. Se usan cuatro pesos: 400, 500, 600 y 700.

- Se incluye en la app con `@expo-google-fonts/onest`, un archivo por peso.
- Lo que Onest no trae, como la Ω, cae a la fuente del sistema.
- Es más ancha que la del sistema: los rótulos se miden a 320 px.
- No hay fuente monoespaciada en uso. Los números se alinean con cifras tabulares.

### Escala

| Token | Tamaño | Peso | Interlínea | Rol |
|---|---|---|---|---|
| `page-title` | 34 px | 700 | 1.2 | Título de página de escritorio |
| `reading` | 32 px | 700 | 1.2 | Valor de lectura destacado |
| `h1` | 24 px | 700 | 1.2 | Título de pantalla móvil |
| `h2` | 20 px | 700 | 1.2 | Título de hoja, saludo, título de subvista |
| `h3` | 17 px | 700 | 1.2 | Título de tarjeta y de sección, botón principal |
| `body` | 16 px | 400 | 1.5 | Texto general y **todo campo de entrada** |
| `body-strong` | 16 px | 700 | 1.5 | Nombre de una fila de lista |
| `label` | 14 px | 500 | 1.2 | Etiqueta de campo, subtítulo de cabecera |
| `label-strong` | 14 px | 700 | 1.2 | Botón secundario, pestaña activa |
| `caption` | 13 px | 400 | 1.5 | Metadatos, ayudas, unidades |
| `caption-strong` | 13 px | 600 | 1 | Chips y rótulos del menú |
| `micro` | 11 px | 700 | 1 | Contadores dentro de insignias |

Las cifras grandes de un tablero van a 40 px y 700, sin token propio.

### Títulos

- **Siempre en `text`, nunca en naranja.** La jerarquía la dan el tamaño y el peso.
- **Mayúscula inicial y resto en minúscula:** "Por revisar", "Equipos por confirmar".
- **Sin punto final** y sin dos puntos.
- **Una sola línea con "…"** en filas, tarjetas y cabeceras: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`. Dentro de un flex suma `min-width: 0`.
- **Sin mayúsculas sostenidas.** Las excepciones son las opciones de select, que imitan al ERP, y los títulos de sección de documentos impresos.

### Números

```css
.lectura, table td { font-variant-numeric: tabular-nums; }
```

Una lectura se compone de tres partes, y la unidad nunca falta:

| Parte | Estilo |
|---|---|
| Etiqueta ("Frecuencia") | `label` en `text-secondary` |
| Valor ("3421.5") | `reading` en `text`, tabular |
| Unidad ("Hz") | `caption` en `text-secondary` |

**Un decimal digitado no se redondea ni se rellena.** El valor que se escribió es el que se muestra.

## Layout

### Espaciado

Escala de 4 px. Los márgenes de la app móvil salen de aquí.

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4 px | Entre título y detalle |
| `space-2` | 8 px | Entre filas de lista y entre iconos |
| `space-3` | 12 px | Entre tarjetas de una vista, relleno vertical de fila |
| `space-4` | 16 px | Relleno de tarjeta y margen lateral |
| `space-5` | 24 px | Entre campos de un formulario |
| `space-6` | 32 px | Pie de pantalla, entre bloques mayores |
| `space-7` | 48 px | Separación máxima |

### Móvil: campo

| Medida | Valor |
|---|---|
| Ancho de referencia | 375 px, a pantalla completa en el teléfono |
| Corte | Desde 600 px la columna se fija en 375 px y se centra |
| Margen lateral | 16 px (ancho útil 343 px) |
| Cabecera | 104 px, blanca, con borde inferior `border` |
| Cuerpo | `bg-alt`, relleno 16 / 16 / 32 px |
| Control | 56 px de alto; 48 px dentro de una tarjeta |
| Toque | 48 px mínimo, 56 px recomendado, 8 px entre objetivos. Un control visual más chico amplía su área táctil a 48 px sin cambiar de tamaño |
| Acción principal | En la mitad inferior, al alcance del pulgar |
| Áreas seguras | `env(safe-area-inset-*)` en cabecera, portada y hojas |

**Portada:** banda de marca con saludo, campana y rejilla de 3 columnas (separación 16 × 8 px). Debajo, una hoja clara sube 20 px sobre la banda con esquinas de 24 px.

### Escritorio: oficina

Solo aplica si se construye una vista de escritorio. El APK usa la disposición móvil.

| Medida | Valor |
|---|---|
| Ancho máximo | 1440 px, centrado |
| Margen lateral | 64 px |
| Cabecera | 88 px, blanca: marca a la izquierda, navegación al centro, cuenta a la derecha |
| Migas | 48 px, `caption`, separador en `border-strong` |
| Cuerpo | Relleno 40 / 64 / 56 px |
| Encabezado de página | `page-title` + bajada `body` en `text-secondary`, 40 px debajo |
| Lista | Separación 16 px |
| Pie | 72 px, `caption` en `text-secondary` |
| Navegación | Separación 40 px; activa en `primary-dark`, 700, con subrayado de 3 px en `primary` |

Móvil y escritorio son **dos disposiciones para dos usos**, no una pantalla estirada. Comparten tokens, no estructura.

Por debajo de 600 px, el margen de 64 px pasa a 16 px y la navegación baja a su propia fila.

### Listas y rejillas

- Una lista en `display: grid` lleva `grid-template-columns: minmax(0, 1fr)`. Sin eso, un texto `nowrap` saca la tarjeta de la pantalla.
- Por debajo de 360 px se recorta el aire, no la letra.
- Las listas van de a 10 con ← →.

## Elevation & Depth

La profundidad es discreta. Hay tres planos: página, tarjeta y flotante.

| Nivel | Valor | Dónde |
|---|---|---|
| Plano | Sin sombra, borde 1 px | Campos, botones de ícono, estados vacíos |
| Tarjeta | `0 1px 3px rgba(73, 73, 73, 0.12)` | Tarjetas, filas de lista |
| Flotante | `0 4px 12px rgba(73, 73, 73, 0.18)` | Avisos flotantes |
| Desplegado | `0 8px 24px rgb(0 0 0 / 0.16)` | Texto desplegado sobre el cuerpo |
| Casilla de menú | `0 6px 16px rgb(0 0 0 / 0.14)` | Burbuja blanca sobre la banda |
| Hoja de menú | `0 -8px 32px rgb(0 0 0 / 0.18)` | Panel que sube desde abajo |

**Velos:** `rgba(0, 0, 0, 0.5)` detrás de una hoja. El menú del Inicio usa `rgb(20 20 20 / 0.32)` con `blur(6px)` y su hoja `rgb(255 255 255 / 0.9)` con `blur(24px)`. Es el único vidrio de la marca.

**Banda de marca:**

```css
background:
  radial-gradient(130% 90% at 105% -10%, color-mix(in srgb, var(--color-primary) 70%, transparent) 0%, transparent 60%),
  var(--color-primary-dark);
```

Lleva un aro de 200 × 200 px, borde de 28 px en `rgb(255 255 255 / 0.06)`, que asoma por la esquina superior derecha. El acento claro va donde no hay texto.

## Shapes

| Token | Valor | Dónde |
|---|---|---|
| `sm` | 4 px | Casillas |
| `inner` | 9 px | Pestaña dentro del segmentado |
| `control-web` | 10 px | Botón de escritorio |
| `md` | 12 px | **Radio por defecto:** tarjetas, campos, filas, avisos |
| `lg` | 14 px | Botón principal, hojas |
| `tile` | 20 px | Burbuja del menú, grupos de la hoja de menú |
| `panel` | 24 px | Esquinas superiores de portada y hoja de menú |
| `full` | 999 px | Chips, contadores, barras |

**Bordes:** 1 px normal; 1.5 px en botón secundario y zona de adjuntar (punteada); 2 px en foco y en el elemento que espera acción.

**Formas recurrentes:** píldora para estados, cuadrado redondeado para avatar (44 px) y casilla (64 px), círculo solo para campana y lápiz (48 px).

## Components

Las medidas base están en el YAML. Aquí va lo que el YAML no puede decir.

### Botones

| Tipo | Borde | Cuándo |
|---|---|---|
| Principal | Ninguno | Una sola acción principal por pantalla |
| Secundario | 1.5 px `primary` | Acción alternativa con marca |
| Neutro | 1 px `border-strong` | Cancelar, al lado de una decisión |
| Discreto | 1 px `border-strong` | Quitar o deshacer sin énfasis |
| Peligro | Ninguno | Irreversible, siempre con confirmación |
| Alta | 1.5 px punteado `primary` | "+ Agregar" al pie de una lista |
| Crear | Ninguno | "+" junto al buscador, con `aria-label` |
| Ícono | 1 px `border` | Acción de solo ícono. Activo: `tint` y borde `primary` |
| Escritorio | Transparente | Vista de escritorio. Fantasma: `bg`, borde `border-strong` |

**Estados:** presionado `scale(0.97)` y `brightness(0.92)`. Deshabilitado `opacity: 0.6`. En escritorio, deshabilitado pierde el color: fondo `border-strong` y texto `text-secondary`. Foco `outline: 2px solid primary`, separación 2 px. El ancho es 100 % en móvil.

### Campos

- **Etiqueta** `label` en `text`, 8 px sobre el control, 4 px de sangría. El asterisco va en `primary-dark`.
- **Control** con borde `border`; al enfocar, 2 px `primary`, compensando 1 px de relleno para que nada salte.
- **Unidad** a la derecha, dentro del campo, `caption` en `text-secondary`.
- **Error** con borde `danger`, fondo `danger-bg` y mensaje en texto.
- **Nunca menos de 16 px** en la letra del control.
- **Sin ejemplo en el placeholder.** El ejemplo va en el botón "?" junto a la etiqueta. Los buscadores sí llevan el suyo.
- **Sin selects nativos en móvil.** Se abre una hoja inferior con las opciones. Ningún select arranca con una opción puesta.
- **Buscador:** 56 px, icono en `text-secondary`, foco en `primary`.

### Tarjetas y filas

- **Tarjeta:** borde `border`, sombra de tarjeta, separación interna 12 px, título `h3`. Agrupa un bloque de campos.
- **Fila:** avatar 44 px, texto, chevrón. Nombre `body-strong`, detalle `caption`, y **el chip va debajo del texto**, no al lado del nombre.
- **Fila interactiva:** borde `primary` al pasar, `scale(0.985)` al tocar. Deshabilitada: `opacity: 0.55`, no se oculta.
- **Elemento elegido:** fondo `tint`, borde `primary`.
- **Elemento que espera acción:** borde 2 px `primary`, con un chip que lo diga.

### Chips

Píldora con borde de 1 px y un glifo delante, porque el color no va solo.

| Chip | Glifo | Borde | Ejemplo |
|---|---|---|---|
| Éxito | ✓ | `success` al 25 % | ✓ Vigente |
| Advertencia | ⚠ | `warning` al 35 % | ⚠ Fuera de rango |
| Peligro | ⚠ | `danger` al 30 % | ⚠ Extraviado |
| Espera | ● | `info-text` al 18 % | ● En revisión |
| Neutro | ○ | `border` | ○ Pendiente |
| En tránsito | → | `border` | → En camino |
| Acento | ● | `primary` | ● En curso |

Un chip no se parte nunca, salvo en su propia línea de una fila. Versión mini: 11 px, relleno 2 × 6 px.

### Avisos

| Aviso | Borde | Cuándo |
|---|---|---|
| Informativo | `primary` | Algo que cambió y hay que atender |
| Éxito | `success` | Algo ya resuelto |
| Advertencia | `warning` | Hay que saberlo; no bloquea |
| Error | `danger` | Falló la acción en curso |
| Notificación | `danger` | Algo que pasó, con botón "Cerrar" |

Siempre con glifo o icono. Un aviso bajo un campo va pegado a él (8 px arriba). Un párrafo que solo explica por qué la pantalla es así no es un aviso: casi siempre sobra.

### Navegación y contenedores

- **Cabecera móvil:** flecha de 40 px en la misma fila que el título. Título y subtítulo truncan, y al tocarlos se despliega el texto entero.
- **Segmentado:** caja `bg-alt` con relleno de 4 px, opciones de 40 px, activa blanca con borde `primary`. La píldora se desliza.
- **Hoja inferior:** radio `lg` arriba, asa de 40 × 4 px que de verdad cierra al arrastrar 80 px, dos botones al pie.
- **Casilla de menú:** burbuja blanca de 64 px con icono `primary-dark` y rótulo `caption-strong` en blanco, hasta dos renglones.
- **Barra de avance:** 6 px, relleno `primary`, y `success` al completar.
- **Estado vacío:** borde punteado, sin sombra, icono gris.
- **Carga:** filas esqueleto con la forma de lo que va a llegar, no un texto "Cargando…".

## Do's and Don'ts

### Sí

- Usa una sola acción principal por pantalla, en `primary-dark`.
- Toma todo color, tamaño y espacio de los tokens.
- Acompaña cada estado con icono o texto.
- Muestra siempre la unidad junto al número.
- Usa cifras tabulares en toda columna de datos.
- Escribe títulos en `text` y deja que el tamaño marque la jerarquía.
- Deja visible el foco de teclado.
- Respeta `prefers-reduced-motion`.
- Mide con `onLayout`, no a ojo.

### No

- No agregues textos que repitan el título, los campos o los chips.
- No escribas prefijos obvios: el código ya se reconoce como tag sin la palabra "Tag".
- No uses naranja para advertir.
- No pongas texto blanco chico sobre `#EF6535`.
- No uses `#DB3A14` para texto chico sobre `bg-alt` o `tint`.
- No uses `warning` como color de texto.
- No escribas un hex suelto en un componente.
- No uses el azul de Beemetry ni el gris pizarra de Externo: son otras marcas.
- No agregues degradados fuera de la banda de marca, ni modo oscuro.
- No uses sombras fuertes ni bordes gruesos para separar.
- No recolores ni deformes el logo, ni lo pongas sobre naranja.
- No uses emojis como iconos.
- No redondees un valor digitado.

## Logo

| Pieza | Archivo | Medida | Uso |
|---|---|---|---|
| Logo de Time Telemetry | `assets/images/logo-time-telemetry.png` | 533 × 160 px, proporción 3.33:1 | Cabeceras |
| Icono de la app | `assets/images/logo-tmt-app.png` | 1000 × 1000 px | Lanzador de Android |

**Anatomía del logo:** aro de reloj naranja con doce marcas, abierto abajo a la derecha, donde nace el travesaño de la T de TELEMETRY. Dentro, una antena gris con su señal. Debajo, una línea que termina en una traza sísmica, "Instrumentación y Monitoreo Automatizado" y "GEOTECNIA, AMBIENTAL, GEOESPACIAL".

**Colores medidos en el PNG:** naranja `#ED7D19`, gris `#909494`, gris oscuro `#585858`. Son del logo y no entran a la interfaz: el acento es `#EF6535`.

**Reglas:**

- Solo sobre fondo blanco o muy claro. No existe versión blanca.
- Sobre naranja va dentro de una forma blanca.
- 40 px de alto en la cabecera y un aire de la mitad de su altura alrededor.
- A 40 px el lema ya no se lee. Si importa, se escribe aparte como texto.

El icono del APK usa el símbolo aprobado en `docs/Logos Todos-03.png`. El logo horizontal de las cabeceras se conserva como PNG.

## Iconography

**Fuente:** [Lucide](https://lucide.dev), con la especificación de abajo.

### Especificación

| Propiedad | Valor |
|---|---|
| Lienzo | `viewBox="0 0 24 24"` |
| Estilo | Solo línea, sin relleno |
| Grosor | `stroke-width: 1.8` |
| Terminaciones | `stroke-linecap: round`, `stroke-linejoin: round` |
| Color | `currentColor`: el icono hereda del texto |
| Accesibilidad | `aria-hidden="true"`; el botón lleva `aria-label` |

```html
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="7" y="7" width="10" height="10" rx="2" />
  <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
</svg>
```

### Tamaños

| Tamaño | Dónde |
|---|---|
| 14–16 px | Dentro de chips y texto |
| 18 px | Acciones compactas |
| **20 px** | **Por defecto** (173 de 257 usos) |
| 22–24 px | Avatar, cabecera, campana |
| 28 px | Casilla de menú |
| 32–40 px | Estado destacado |

### Color y contenedor

| Contenedor | Medida | Fondo | Icono |
|---|---|---|---|
| Avatar de fila | 44 px, radio 12 | `tint` | `primary-dark` |
| Avatar de alerta | 44 px, radio 12 | `warning-bg` | `warning-text` |
| Estado vacío | 44 px, radio 12 | `bg-alt` | `text-secondary` |
| Botón de ícono | 44 px, radio 12 | `bg` | `primary-dark` |
| Casilla de menú | 64 px, radio 20 | `bg` o `tint` | `primary-dark` |
| Campana | 48 px, círculo | Blanco al 14 % | Blanco |

**Un concepto, un icono.** El mismo concepto usa siempre el mismo icono en toda la app.

**Glifos de texto:** ✓ ⚠ ● ○ ◐ → ↺ ⏳ se admiten dentro de chips y avisos. Para abrir un enlace externo va un icono, no `↗`, que cambia con la fuente del teléfono.

**Si falta un icono:** se dibuja con esta misma especificación. No se mezclan iconos rellenos ni otros grosores.

## Motion

Nada pasa de 300 ms: en obra nadie espera una animación.

| Token | Valor | Uso |
|---|---|---|
| `--dur-corta` | 180 ms | Título, velo, presión |
| `--dur-media` | 260 ms | Cambio de pantalla |
| `--dur-hoja` | 300 ms | Hoja inferior |
| `--ease-entrada` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Lo que entra frena al llegar |
| `--ease-salida` | `cubic-bezier(0.4, 0, 1, 1)` | Lo que sale acelera |

| Movimiento | Comportamiento |
|---|---|
| Pantalla | Desliza 28 px con fundido: desde la derecha al avanzar, desde la izquierda al volver |
| Hoja | Sube desde abajo frenando; sale más rápido |
| Lista | Las filas entran escalonadas, 30 ms entre sí, 150 ms como máximo |
| Toque | `scale(0.97)` en botones, `0.985` en lo ancho |
| Pestaña | La píldora se desliza a la opción elegida |

Solo se animan `transform` y `opacity`. Con `prefers-reduced-motion`, queda el fundido corto o nada.

## Voice

- **Español de Perú, de tú:** "Tus pendientes", "¿Estás seguro?".
- **Botones con verbo en infinitivo:** Guardar, Enviar, Marcar asistencia.
- **Chips cortos:** dos o tres palabras que digan el estado.
- **Errores que dicen qué pasó y qué hacer.** El mensaje real del sistema externo se muestra tal cual.
- **Un sí o no se responde con la acción:** "Salir sin guardar", no "Aceptar".
- **Nombres de empresa como en el padrón:** TIME TELEMETRY en documentos, Time Telemetry en pantalla, TMT como código.

## Adaptación a React Native

Los valores no cambian. Cambia cómo se escriben.

| En este archivo | En React Native |
|---|---|
| Interlínea 1.2 o 1.5 | `lineHeight` en píxeles: tamaño × interlínea. 16 px con 1.5 es `24` |
| Pesos de Onest | Una fuente cargada por peso. Cada token de texto elige su `fontFamily` |
| Cifras tabulares | `fontVariant: ['tabular-nums']` |
| Una línea con "…" | `numberOfLines={1}` y `ellipsizeMode="tail"` |
| Banda de marca | Degradado radial con `react-native-svg`, usando `primary` al 70 % |
| Presión `brightness(0.92)` | Capa negra al 8 % sobre el botón |
| Área táctil | `hitSlop` hasta llegar a 48 px |
| `env(safe-area-inset-*)` | `react-native-safe-area-context` |
| `aria-label` | `accessibilityLabel` |
| `aria-hidden` | `accessibilityElementsHidden` e `importantForAccessibility="no"` |
| `prefers-reduced-motion` | `AccessibilityInfo.isReduceMotionEnabled()` |
| `cubic-bezier(...)` | `Easing.bezier(...)` |
| `currentColor` en iconos | Prop `color` del icono |

Las sombras y el desenfoque se validan en un Android real. Si el desenfoque falla, queda el velo sin él.
