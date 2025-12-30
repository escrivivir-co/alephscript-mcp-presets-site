# Prompt: Generación de Commit Message — MCPGallery

> **Resumen**: Genera mensajes de commit conformes al protocolo DevOps de Aleph Scriptorium, adaptado al contexto MCPGallery.

---

## Formato

```
<tipo>(<scope>): <descripción en imperativo>

[cuerpo opcional: qué y por qué]

refs #<TASK-ID>
```

---

## Tipos y Scopes

| Tipo | Uso | Scopes MCPGallery |
|------|-----|-------------------|
| `feat` | Nueva funcionalidad | `zeus/ui`, `zeus/api`, `mesh`, `model`, `core` |
| `fix` | Corrección | `zeus/views`, `mesh/servers`, `model/presets` |
| `docs` | Solo documentación | `docs`, `readme`, `adr` |
| `refactor` | Reestructuración | `zeus/backend`, `mesh/sdk` |
| `chore` | Mantenimiento | `deps`, `config`, `scripts` |
| `test` | Tests E2E o unitarios | `e2e`, `zeus/test` |

### Scopes por Paquete

| Paquete | Prefijo | Ejemplos |
|---------|---------|----------|
| **zeus/** | `zeus/` | `zeus/ui`, `zeus/api`, `zeus/views`, `zeus/backend` |
| **mcp-mesh-sdk/** | `mesh/` | `mesh/servers`, `mesh/devops`, `mesh/launcher` |
| **mcp-model-sdk/** | `model/` | `model/presets`, `model/catalog` |
| **mcp-core-sdk/** | `core/` | `core/base`, `core/types` |
| **Raíz** | — | `docs`, `config`, `deps` |

---

## Procedimiento

### 1. Identificar cambios

```bash
git status && git diff --stat
```

### 2. Clasificar por paquete

| Cambios en | Scope principal |
|------------|-----------------|
| `zeus/` | `zeus/*` |
| `mcp-mesh-sdk/` | `mesh/*` |
| `mcp-model-sdk/` | `model/*` |
| `mcp-core-sdk/` | `core/*` |
| `.github/`, raíz | `docs`, `config` |

### 3. Generar mensaje

**Ejemplo Zeus UI**:
```
feat(zeus/ui): añadir vista de catálogo MCP con tabs

Nueva sección en Gallery que muestra tools/resources/prompts en pestañas.

refs #SCRIPT-2.2.4-S02
```

**Ejemplo Mesh Server**:
```
feat(mesh/devops): exponer endpoint health con metadata

refs #SCRIPT-2.2.4-T005
```

**Ejemplo Documentación**:
```
docs(readme): actualizar README-SCRIPTORIUM con servidores mesh

refs #SCRIPT-2.2.4-S03
```

---

## Reglas

- **Descripción**: máximo 72 chars, imperativo ("añadir", no "añadido")
- **Cuerpo**: qué y por qué, no cómo
- **Un commit por unidad lógica**
- **Task IDs**: usar formato `SCRIPT-X.X.X-SXX` o `SCRIPT-X.X.X-TXXX`

---

## Vinculación con Scriptorium

Este repo es submódulo de Aleph Scriptorium. Los commits deben:

1. Referenciar épicas del backlog Scriptorium (`SCRIPT-2.2.4`, etc.)
2. Seguir el protocolo DevOps definido en `ALEPH/.github/DEVOPS.md`
3. Actualizar `README-SCRIPTORIUM.md` si afecta integración

→ Para protocolo maestro: [ALEPH/.github/DEVOPS.md](../../DEVOPS.md)
