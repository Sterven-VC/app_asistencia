# Time Telemetry y Asistencia TMT

## La empresa

Time Telemetry se presenta como una empresa tecnológica que diseña, suministra e instala sistemas de instrumentación. Usa telemetría para recibir mediciones a distancia y automatiza su recolección para monitorear obras e instalaciones. Sus áreas incluyen geotecnia, estructuras, medio ambiente, recursos hídricos y geoespacial. [Perfil corporativo](https://www.timetelemetry.com/nosotros) · [Sitio de Telemetry en Perú](https://telemetry.com.pe/)

Su historia corporativa sitúa el inicio de la operación en 2008 bajo el nombre CATEL S.A., con servicios de control, automatización y telemetría para minería y construcción. En 2016, según ese relato, la operación se integró a Telemetry Mining Corporation. [Historia corporativa](https://telemetry.com.pe/index.php/la-compania/)

| Ámbito | Ejemplos que publica la empresa |
|---|---|
| Minería | Monitoreo de desplazamientos en taludes y medición del nivel freático en presas de relaves. |
| Obras civiles | Monitoreo de vibraciones durante la construcción de túneles e instalación de instrumentación en presas, puentes y vías. |
| Medio ambiente y agua | Estaciones automáticas para medir el nivel de ríos y la calidad del aire. |

[Catálogo de soluciones de monitoreo](https://www.timetelemetry.com/soluciones-de-monitoreo) · [Servicios de instalación y monitoreo](https://telemetry.com.pe/index.php/servicio-de-instalacion-de-instrumentacion-geotecnica/)

Fuentes públicas consultadas el 6 de noviembre de 2026. Los ejemplos describen servicios publicados por la empresa. El catálogo interno de proyectos para asistencia queda por confirmar.

## Alcance documentado de Asistencia TMT

- El personal trabaja en obra y en oficina. La app busca que pueda marcar asistencia rápidamente desde un teléfono Android. La admin valida cada marcación y asigna el tipo: **Proyecto**, **Oficina** o **Cita médica**.
- La empresa necesita consultar quién hizo la marcación, cuándo se hizo y qué lugar o categoría se registró. La admin lo consulta desde la misma app.
- El stack es React Native, TypeScript y Expo Router, con EAS Build para entregar el APK. En desarrollo, la API y PostgreSQL corren en la PC. El servidor del uso real sigue por definir.

Fuentes del proyecto [AGENTS.md](../AGENTS.md) y [DESIGN.md](../DESIGN.md).

## Preguntas para validar con Time Telemetry

- ¿El horario de salida de 18:30 aplica a todo el personal administrativo?
- ¿Qué plazo de conservación y qué datos exige el área legal para el registro?
- ¿Cómo se recupera la contraseña si una persona la olvida?
