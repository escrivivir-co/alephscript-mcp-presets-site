# MCPGallery — Integración con ALEPH Scriptorium

> **Submódulo**: MCPGallery  
> **Rama de integración**: `integration/beta/scriptorium`  
> **Versión**: 0.1.0  
> **Épica activa**: SCRIPT-2.1.0 (TypedPrompting Context Manager)  
> **Fecha**: 2025-12-30

---

## 🎯 Opportunity Statement

**Problema**: Los agentes AI necesitan acceder a herramientas MCP de forma dinámica, pero actualmente no hay un catálogo centralizado que permita descubrir servidores activos, explorar sus capabilities y crear presets reutilizables.

**Solución**: Un ecosistema de 3 capas (Mesh → Presets → UI) donde Zeus actúa como **fuente de verdad del catálogo** para el plugin del Scriptorium.

**Valor**: Los usuarios del Scriptorium podrán:
1. Descubrir automáticamente servidores MCP activos en la mesh
2. Explorar tools, resources y prompts disponibles
3. Crear presets personalizados de capabilities
4. Usar DevOps MCP Server directamente desde Copilot Chat

---

## 🗺️ Mapa del Ecosistema

| Componente | Puerto | Función | README |
|------------|--------|---------|--------|
| **mcp-mesh-sdk** | 3003+ | Mesh de servidores MCP | [→](mcp-mesh-sdk/README-SCRIPTORIUM.md) |
| **mcp-model-sdk** | 4001 | Preset Service (REST) | [→](mcp-model-sdk/README-SCRIPTORIUM.md) |
| **zeus** | 3012 | UI de Gestión + Catálogo | [→](zeus/README.md) |

### Servidores MCP en la Mesh (mcp-mesh-sdk)

| Servidor | Puerto | Clase | Descripción |
|----------|--------|-------|-------------|
| `devops-mcp-server` | 3003 | DevOpsServer | DevOps automation (default, `npm start`) |
| `wiki-browser-server` | 3002 | MCPWikiBrowserServer | Wikipedia browsing |
| `state-machine-server` | 3004 | MCPStateMachineServer | X+1 state machine |
| `launcher-server` | 3050 | MCPLauncherServer | Server orchestration |
| `prolog-mcp-server` | 3006 | MCPPrologServer | Prolog logic inference |
| `typed-prompt-mcp-server` | 3020 | MCPTypedPromptServer | Schema validation & ontology |
| `xplus1-server` | 3001 | — | X+1 control |

---

## 🔄 Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SCRIPTORIUM MCP ECOSYSTEM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                MCP-MESH-SDK (DevOps Server :3003)                 │   │
│  │                ══════════════════════════════════                 │   │
│  │  → MCP Server REAL que VS Code Copilot puede invocar              │   │
│  │  → Registrado en ALEPH/.vscode/mcp.json                           │   │
│  │  → Expone: tools/list, resources/list, prompts/list               │   │
│  └────────────────────────────▲─────────────────────────────────────┘   │
│                               │                                          │
│                               │ MCP Protocol (SDK Client)                │
│                               │                                          │
│  ┌────────────────────────────┼─────────────────────────────────────┐   │
│  │         MCP-MODEL-SDK (Preset Service :4001)                      │   │
│  │         ════════════════════════════════════                      │   │
│  │  → Extrae metadata de DevOps (tools/resources/prompts)            │   │
│  │  → Gestiona presets (CRUD en PRESETS/mcp_presets.json)            │   │
│  │  → Expone REST: /ai/ui/mcp/* para Zeus                            │   │
│  └────────────────────────────▲─────────────────────────────────────┘   │
│                               │                                          │
│                               │ REST (axios)                             │
│                               │                                          │
│  ┌────────────────────────────┼─────────────────────────────────────┐   │
│  │                    ZEUS (UI :3012)                                │   │
│  │                    ════════════════                               │   │
│  │  → UI para explorar catálogo de servers MCP                       │   │
│  │  → Crear/editar presets                                           │   │
│  │  → FUENTE DE VERDAD del catálogo para el plugin                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               │                                          │
│                               │ Plugin consulta vía HTTP                 │
│                               ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              @plugin_ox_mcppresets (Scriptorium)                  │   │
│  │              ═══════════════════════════════════                  │   │
│  │  → Consume catálogo de Zeus (GET localhost:3012/api/catalog)      │   │
│  │  → Lista servidores activos en la mesh                            │   │
│  │  → Informa a @aleph qué tools están disponibles                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 Flujo de Descubrimiento

```
1. STARTUP SEQUENCE:
   $ cd mcp-mesh-sdk && npm start     → DevOps Server en :3003
   $ cd mcp-model-sdk && npm start    → Preset Service en :4001
   $ cd zeus && npm start             → UI en :3012

2. CATÁLOGO DISPONIBLE:
   Zeus consulta → mcp-model-sdk → mcp-mesh-sdk
   Zeus expone catálogo consolidado a quien lo pida

3. PLUGIN SCRIPTORIUM:
   @plugin_ox_mcppresets → GET Zeus :3012 → obtiene catálogo
   → Informa a @aleph qué servers/tools hay activos

4. COPILOT INVOCA TOOLS:
   Usuario en Copilot Chat → invoca tool de DevOps
   VS Code usa mcp.json → conecta a :3003 → ejecuta tool
```

---

## 🔗 Vinculación con Scriptorium

| Recurso Scriptorium | Ubicación |
|---------------------|-----------|
| Plugin | `.github/plugins/mcp-presets/` |
| Bridge | `.github/agents/plugin_ox_mcppresets.agent.md` |
| Backlog activo | `ARCHIVO/DISCO/BACKLOG_BORRADORES/Diciembre_29_TypedPrompting_ContextManager/` |
| Épica | SCRIPT-2.1.0 (TypedPrompting Context Manager) |
| Formación del agente | `08_Formacion_McpPresets_MCP_Server.md` |

---

## 📚 Documentación de Integración

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **VibeCoding Checkpoint List** | [zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md](zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md) | Tracking de sprints |
| **Context Base** | [zeus/PLANIFICACION/VIBECODING/zeus_main_context_base.md](zeus/PLANIFICACION/VIBECODING/zeus_main_context_base.md) | Arquitectura y quick ref |
| **Agents Collaboration** | [zeus/PLANIFICACION/VIBECODING/agents.md](zeus/PLANIFICACION/VIBECODING/agents.md) | Handoffs y protocolos |
| **E2E Checkpoints** | [test/e2e-scriptorium/DEMO_CHECKPOINTS_SCRIPTORIUM.md](test/e2e-scriptorium/DEMO_CHECKPOINTS_SCRIPTORIUM.md) | Validación demo |
| **Test Log** | [test/e2e-scriptorium/TEST_LOG_2025-12-30.md](test/e2e-scriptorium/TEST_LOG_2025-12-30.md) | Resultados E2E |
| **Commit Protocol** | [.github/prompts/as_commit-message.prompt.md](.github/prompts/as_commit-message.prompt.md) | Formato de commits |

---

## 🏗️ ADR-006: Decisión Arquitectónica de Integración

> **Status**: APPROVED (2025-12-30)  
> **Scope**: MCPGallery → Aleph Scriptorium

### Problema

MCPGallery evolucionó de prototipo aislado a componente integrado del Scriptorium. Se requería:
1. Desconectar Zeus de SLMo42 (inferencia deprecada)
2. Migrar chatmodes → agents (actualización VS Code Copilot)
3. Definir MCPGallery como entry point MCP

### Decisión

| Aspecto | Antes | Después |
|---------|-------|---------|
| Inferencia | Zeus → SLMo42 (:4001) | ❌ Ninguna (Copilot la maneja) |
| Modo | Full AI chat | Catalog-only |
| Agentes | `.github/chatmodes/` | `.github/agents/` |
| Rol | Prototipo autónomo | Entry point MCP del Scriptorium |

### Endpoints de Catálogo (Preset Service :4001)

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/ai/ui/mcp/list` | GET | Catálogo completo MCP |
| `/ai/ui/mcp/presets` | GET | Lista de presets guardados |
| `/ai/ui/mcp/preset/:name` | GET | Obtener preset específico |
| `/ai/ui/mcp/set` | POST | Crear/actualizar preset |

### Key Insight: No Inference

- **Zeus**: UI-only, NO llamadas LLM
- **Preset Service**: Gestión de catálogo ONLY
- **MCP Mesh**: Servidores MCP reales (invocados POR Copilot)
- **Inferencia**: VS Code Copilot Chat (cloud-based)

---

## 🚀 Arranque para Scriptorium

### Instalación

```bash
# Desde ALEPH raíz
git submodule update --init --recursive

# Posicionar en rama de integración
cd MCPGallery
git checkout integration/beta/scriptorium
```

### Arranque del Sistema Completo

```bash
# Terminal 1: DevOps MCP Server (el que Copilot usa)
cd MCPGallery/mcp-mesh-sdk && npm install && npm start
# → ✅ DevOps MCP Server ready on port 3003

# Terminal 2: Preset Service (extractor de metadata)
cd MCPGallery/mcp-model-sdk && npm install && npm start
# → ✅ MCP Preset Service running on port 4001

# Terminal 3: Zeus UI (catálogo visual)
cd MCPGallery/zeus && npm install && npm start
# → ✅ Zeus server running on http://localhost:3012
```

### Validación Rápida

```bash
# Health checks
curl http://localhost:3003/health  # mesh (DevOps Server)
curl http://localhost:4001/health  # presets
curl http://localhost:3012/health  # zeus

# Catálogo MCP
curl http://localhost:4001/ai/ui/mcp/list | jq '.serversCount, .totalTools'
```

---

## 🌐 Zeus UI (Catálogo v0.1.0)

Zeus es la UI de gestión que actúa como **fuente de verdad del catálogo MCP**.

> **Nota DRY**: Zeus NO es un submódulo git (no tiene README-SCRIPTORIUM.md propio).

### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | UI principal |
| `GET` | `/api/catalog` | Catálogo de servidores MCP |
| `GET` | `/api/presets` | Lista de presets guardados |
| `POST` | `/api/presets` | Crear/actualizar preset |
| `DELETE` | `/api/presets/:name` | Eliminar preset |

### Integración con Plugin

```bash
# El plugin @plugin_ox_mcppresets consulta Zeus
curl http://localhost:3012/api/catalog
curl http://localhost:3012/api/presets
```

### Estructura

```
zeus/
├── server/          # Backend Express
├── client/          # Frontend assets
├── views/           # Templates EJS
├── configs/         # Configuración
└── package.json     # v0.1.0
```

---

## ⚙️ Configuración MCP en VS Code

El DevOps Server se registra en `MCPGallery/.vscode/mcp.json`:

```jsonc
{
  "servers": {
    "devops-mcp-server": {
      "type": "http",
      "url": "http://localhost:3003"
    }
  }
}
```

Para usarlo desde ALEPH, copiar o referenciar esta configuración en `ALEPH/.vscode/mcp.json`.

---

## 📋 Backlog Activo

→ Ver [mcp-model-sdk/README-SCRIPTORIUM.md](mcp-model-sdk/README-SCRIPTORIUM.md) para el backlog detallado de Sprints 1-4.

**Resumen**:
| Sprint | Objetivo | Estado |
|--------|----------|--------|
| S1 | Simplificar mcp-model-sdk | ⏳ En progreso |
| S2 | Validar circuito completo | ⏳ Pendiente |
| S3 | Resilencia y discovery | ⏳ Pendiente |
| S4 | Export/Import presets | ⏳ Pendiente |

---

## 📝 Changelog de Integración

| Fecha | Cambio |
|-------|--------|
| 2025-12-30 | Reorganizar documentación: mover archivos de PLANIFICACION a estructura DRY |
| 2025-12-30 | Crear .github/docs/scriptorium-integration/ con INDEX.md |
| 2025-12-30 | Mover ADR-006 a zeus/PLANIFICACION/ADR/ |
| 2025-12-30 | Mover DEMO_CHECKPOINTS a test/e2e-scriptorium/ |
| 2025-12-30 | Actualizar épica activa a SCRIPT-2.1.0 |
| 2025-12-30 | Crear README-SCRIPTORIUM.md (este archivo) |
| 2025-12-30 | Eliminar src/presets-mcp-server.ts (usar DevOps Server en su lugar) |
| 2025-12-30 | Documentar flujo Zeus → Plugin |
| 2025-12-30 | Añadir tabla de servidores MCP en la mesh |
| 2025-12-30 | Registrar devops-mcp-server en ALEPH/.vscode/mcp.json |

---

## 🔮 Extensión Futura

Cuando la mesh tenga más servidores MCP:

1. Se registran en `mcp-model-sdk/PRESETS/mcp_servers.json`
2. mcp-model-sdk los descubre y extrae metadata
3. Zeus los muestra en el catálogo
4. El plugin del Scriptorium los lista automáticamente
5. Se añaden a `mcp.json` para que Copilot los invoque

**El patrón es extensible**: añadir servidor → aparece en catálogo → disponible en Copilot.
