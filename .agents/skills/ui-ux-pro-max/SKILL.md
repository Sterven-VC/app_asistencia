---
name: ui-ux-pro-max
description: "Consulta patrones de UX, accesibilidad e interacción táctil y pautas de React Native para resolver dudas concretas de interfaz en Asistencia TMT."
---

# UI/UX Pro Max para Asistencia TMT

Lee AGENTS.md y DESIGN.md en la raíz del proyecto. Usa DESIGN.md como fuente para los tokens, los componentes y la adaptación a React Native.

Desde la raíz del proyecto, ejecuta la búsqueda que responda a la duda de diseño. El buscador y los datos compartidos están en .claude/skills/ui-ux-pro-max.

    python -B .claude/skills/ui-ux-pro-max/scripts/search.py "touch accessibility" --domain ux -n 3
    python -B .claude/skills/ui-ux-pro-max/scripts/search.py "form accessibility" --stack react-native -n 3

Consulta la [guía original](../../../.claude/skills/ui-ux-pro-max/SKILL.md) para ver otros dominios y opciones del buscador. Aplica los resultados que encajen con la tarea y con el sistema de diseño del proyecto.
