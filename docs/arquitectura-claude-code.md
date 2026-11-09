---
tags:
  - claude-code
  - dev
  - template
  - arquitectura
  - desarrollo
date: 2026-07-07
---
Guía de referencia para estructurar cualquier proyecto (apps, web, etc.) de forma que Claude Code mantenga contexto suficiente incluso cuando el sistema crece.

## Idea central

No existe un único archivo mágico. El patrón que escala es **contexto en capas**:

- `CLAUDE.md` es la puerta de entrada, no la enciclopedia.
- Todo lo que Claude necesita _a veces_ (no siempre) se delega a `docs/` o a `skills/`. 
- El archivo raíz **no debe crecer** con el proyecto — debe mantenerse corto (idealmente bajo 200 líneas).

## Estructura base de carpetas

```
mi-proyecto/
├── AGENTS.md              # Reglas compartidas, si también trabaja Codex
├── CLAUDE.md              # Contexto global, se carga SIEMPRE al iniciar sesión
├── .claude/
│   ├── settings.json      # Permisos y hooks compartidos (se versiona en git)
│   ├── settings.local.json # Ajustes personales (no se versiona)
│   └── skills/            # Conocimiento específico, se carga bajo demanda
│       └── mi-skill/
│           └── SKILL.md
├── docs/                   # Documentación profunda, referenciada, no cargada de entrada
│   ├── arquitectura.md
│   └── api-contracts.md
└── src/
    ├── CLAUDE.md            # Contexto específico del módulo (opcional)
    └── ...
```

## Plantilla de CLAUDE.md

```markdown
# Mi Proyecto

Breve descripción de qué hace el proyecto y quién lo usa.

## Stack
- Lenguaje: 
- Framework: 
- Testing: 

## Estructura
- `src/...` — descripción
- `src/...` — descripción

## Comandos
- `comando` — qué hace
- `comando` — qué hace

## Reglas importantes
- Nunca commitear API keys / secretos
- (otras reglas críticas del proyecto)

## Referencias (leer solo si aplica)
- Arquitectura completa: `docs/arquitectura.md`
- Contratos de API: `docs/api-contracts.md`
```

Las referencias van **sin `@`**: Claude abre el archivo cuando la tarea lo requiere. Un import como `@docs/arquitectura.md` no ahorra contexto, porque el archivo importado se carga junto con el `CLAUDE.md` que lo importa.

## CLAUDE.md anidados (para proyectos grandes)

Cuando el proyecto crece a varios módulos con lógica muy distinta, se puede poner un `CLAUDE.md` dentro de cada subcarpeta:

```
src/
├── CLAUDE.md              # contexto global de src/
├── strategies/
│   └── CLAUDE.md          # convenciones específicas de ese módulo
├── exchange/
│   └── CLAUDE.md          # detalles específicos de ese módulo
```

Claude Code carga al inicio el CLAUDE.md del directorio de trabajo y los de sus carpetas superiores. Los de subcarpetas se cargan bajo demanda, cuando trabaja con archivos de esa carpeta. Esto da contexto específico sin inflar el global.

## Skills como "memoria bajo demanda"

Para conocimiento que Claude necesita _a veces_ pero no en cada sesión (metodologías específicas, guías de estilo particulares, flujos de trabajo especializados), usar `.claude/skills/` en vez de meterlo en CLAUDE.md. Cada skill tiene su propio `SKILL.md` con una descripción rica en keywords para que Claude sepa cuándo activarla.

## Para tareas grandes: spec antes de código

Antes de programar algo grande:

1. Generar primero un `SPEC.md`, interrogando a Claude con preguntas de edge cases, tradeoffs, implementación técnica, UI/UX, etc.
2. Arrancar una sesión **nueva y limpia** solo para implementar contra ese spec.

Esto evita que el contexto de la sesión de "brainstorming" contamine la de "ejecución". Los specs más útiles son autocontenidos: nombran archivos e interfaces involucrados, indican qué queda fuera de alcance, y terminan con un paso de verificación end-to-end.

## `settings.json` y archivos sensibles

- **`.claude/settings.json`**: permisos (qué comandos puede correr sin pedir confirmación) y hooks que comparte todo el equipo.
- **`.claude/settings.local.json`**: ajustes personales para un proyecto. No se comparte con el equipo.
- **Archivos sensibles**: para bloquear la lectura de API keys o credenciales, usar `permissions.deny` en `settings.json`, con reglas como `Read(./.env)`.

## Proyectos con Claude y Codex

Codex lee `AGENTS.md`, no `CLAUDE.md`. Para no duplicar reglas, se escriben en `AGENTS.md` y `CLAUDE.md` las importa con `@AGENTS.md`.

## Checklist rápido para cada proyecto nuevo

- [ ] Correr `/init` en el proyecto — genera un CLAUDE.md base analizando la estructura actual
- [ ] Mantener CLAUDE.md corto y como índice, no como documentación completa
- [ ] Meter documentación pesada (arquitectura, contratos, metodologías) en `docs/` y referenciarla por su ruta, sin `@`
- [ ] Crear CLAUDE.md anidados para módulos con lógica muy distinta
- [ ] Mover conocimiento condicional a `skills/`
- [ ] Para features grandes: spec primero, sesión limpia para implementar
- [ ] Configurar `permissions.deny` para lo sensible
- [ ] Si también trabaja Codex, crear `AGENTS.md` e importarlo desde `CLAUDE.md`

## Fuente

Basado en la documentación oficial de Claude Code (code.claude.com/docs/en/best-practices) y prácticas de la comunidad.