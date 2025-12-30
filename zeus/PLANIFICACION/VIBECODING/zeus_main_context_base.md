# Zeus Main Context Base — Scriptorium Integration

## Project Overview

**Project**: Zeus - MCPGallery UI & Preset Catalog  
**Branch**: `integration/beta/scriptorium`  
**Goal**: MCP entry point for Aleph Scriptorium — catalog-only mode (no inference)

### Key Context
- **Ecosystem**: MCPGallery monorepo with 4 packages
- **Role**: UI for MCP preset selection and catalog management
- **Integration**: Submódulo of Aleph Scriptorium

## MCPGallery Ecosystem (4 Packages)

```
MCPGallery/
├── mcp-core-sdk/       # Base MCP Server + AlephScript Server (library)
├── mcp-mesh-sdk/       # DevOps + Launcher + Wiki + StateMachine (:3003+)
├── mcp-model-sdk/      # Preset Service - Catalog Only (:4001)
└── zeus/               # UI de gestión + Catálogo (:3012)
```

### Service Architecture (Catalog-Only Mode)

```
Zeus (:3012) ←→ Preset Service (:4001) ←→ MCP Mesh (:3003+)
     │                  │                        │
  UI Gallery       Catalog API             MCP Servers
  (no inference)   (no inference)      (invoked BY Copilot)
```

**Critical Insight**: MCPGallery manages the *catalog* — VS Code Copilot handles *inference*.

## Work Dynamics

### Micro-Sprint Methodology
- **Unit**: Request-based sprints (not calendar days)
- **Tracking**: Checkpoint-based progress
- **Documentation**: All changes tracked in ITERATIONS/
- **Collaboration**: Multi-agent with clear handoffs

### Agent Rules
1. **READ FIRST**: Current checkpoint status
2. **UPDATE**: Only assigned checkpoints
3. **DOCUMENT**: All work in iteration file
4. **HANDOFF**: Clear status updates for next agent

### File Permissions
- `zeus_main_context_base.md` - READ ONLY (user approval for edits)
- `agents.md` - EDITABLE (with user permission)  
- `zeus_main_checkpoint_list.md` - STATUS ONLY (no new items without approval)
- `iteration_template.md` - READ ONLY
- `ITERATIONS/` - CREATE sprint files as needed

## Technical Architecture

### Base Technology Stack
```
Technology: Node.js + Express.js + HyperAxe
Pattern: Modular architecture with catalog focus
Structure: backend/ + server/ + views/ + configs/ + models/
Mode: Catalog-only (AI inference disabled)
```

### Core Principles
1. **Catalog-Only**: No LLM inference — Copilot handles that
2. **Scriptorium Integration**: MCPGallery is MCP entry point
3. **Clean Code**: English comments, no legacy code
4. **Modular Design**: Clear separation of concerns  
5. **Configuration-Driven**: Feature flags and themes

### Directory Structure
```
zeus/
├── backend/          # API handlers (catalog-only mode)
├── server/           # Server infrastructure  
├── client/assets/    # Static files & themes
├── configs/          # Configuration management
├── models/           # Data models
├── views/            # HyperAxe templates
└── PLANIFICACION/    # Project documentation
```

### Active Views
1. **Home** (`/`) - Landing page with navigation
2. **Presets** (`/presets`) - Preset library & catalog  
3. **Editor** (`/editor`) - MCP server explorer
4. **Settings** (`/settings`) - Theme & configuration
5. **Stats** (`/stats`) - Usage metrics
6. **AI** (`/ai`) - ⚠️ DISABLED (catalog-only mode)

## Integration Requirements

### Preset Service Communication (Primary)
- **Endpoint**: `http://localhost:4001`
- **Catalog**: `GET /ai/ui/mcp/list`
- **Presets**: `GET /ai/ui/mcp/presets`
- **Create**: `POST /ai/ui/mcp/set`

### MCP Mesh SDK Integration
- **DevOps Server**: `:3003` - Primary MCP server
- **Wiki Server**: `:3002` - Wikipedia browsing
- **StateMachine**: `:3004` - X+1 state machine
- **Launcher**: `:3050` - Server orchestration

### VS Code Copilot Integration
- **Configuration**: `.vscode/mcp.json`
- **Pattern**: Copilot uses MCP servers directly
- **Presets**: Saved to `mcp-model-sdk/PRESETS/mcp_presets.json`

## Key Reference Files

- `PLANIFICACION/ADR-006_SCRIPTORIUM_INTEGRATION_UPGRADE.md` - Architecture decision
- `../../README-SCRIPTORIUM.md` - Ecosystem overview
- `../../.github/agents/` - AI development agents
- `../../.github/copilot-instructions.md` - Copilot context
