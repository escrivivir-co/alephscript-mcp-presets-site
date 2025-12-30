# MCPGallery Ecosystem Study — Scriptorium Integration

> **Replaces**: estudio_asterion.md, estudio_diogenes.md  
> **Context**: Aleph Scriptorium integration  
> **Date**: 2025-12-30

---

## Overview

This document consolidates the architecture analysis for the MCPGallery ecosystem, replacing the historical asterion/diogenes studies. MCPGallery is now integrated as a submódulo of Aleph Scriptorium.

---

## 1. MCPGallery Ecosystem Architecture

### Package Structure

```
MCPGallery/                           # Monorepo root
├── package.json                      # npm workspaces configuration
├── mcp-core-sdk/                     # Core MCP library
├── mcp-mesh-sdk/                     # MCP server implementations
├── mcp-model-sdk/                    # Preset Service (catalog-only)
└── zeus/                             # Web UI for catalog management
```

### Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Zeus UI | 3012 | Web interface for preset management |
| Preset Service | 4001 | Catalog API (no inference) |
| DevOps MCP | 3003 | Primary MCP server |
| Wiki MCP | 3002 | Wikipedia browsing server |
| StateMachine MCP | 3004 | X+1 game state server |
| Launcher MCP | 3050 | Server orchestration |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCPGallery Ecosystem                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐   │
│  │   Zeus UI   │────▶│ Preset Svc   │────▶│  MCP Mesh SDK   │   │
│  │   (:3012)   │     │   (:4001)    │     │   (:3003+)      │   │
│  │             │     │              │     │                 │   │
│  │  • Gallery  │     │  • /mcp/list │     │  • DevOps       │   │
│  │  • Presets  │     │  • /presets  │     │  • Wiki         │   │
│  │  • Editor   │     │  • /set      │     │  • StateMachine │   │
│  │  • Settings │     │              │     │  • Launcher     │   │
│  └─────────────┘     └──────────────┘     └─────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    mcp-core-sdk                              │ │
│  │           Base MCP Server + AlephScript Server               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Aleph Scriptorium                             │
│                                                                   │
│  • VS Code Extension consumes MCPGallery endpoints               │
│  • Copilot Chat uses MCP servers via .vscode/mcp.json            │
│  • Inference handled by Copilot (NOT MCPGallery)                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. mcp-core-sdk Analysis

### Purpose
Base library providing MCP server infrastructure and AlephScript server implementation.

### Key Components
- `BaseMCPServer.ts` - Abstract base class for MCP servers
- `AlephScriptServer.ts` - AlephScript-specific server implementation
- `types/` - TypeScript type definitions
- `utils/` - Shared utilities

### Usage
Other packages depend on this for core MCP functionality:
```json
"@alephscript/mcp-core-sdk": "file:../mcp-core-sdk"
```

---

## 3. mcp-mesh-sdk Analysis

### Purpose
Collection of MCP server implementations for the mesh network.

### Servers Implemented

| Server | Class | Port | Purpose |
|--------|-------|------|---------|
| DevOps | `DevOpsServer.ts` | 3003 | DevOps automation, prompts/resources CRUD |
| Wiki | `MCPWikiBrowserServer.ts` | 3002 | Wikipedia browsing |
| StateMachine | `MCPStateMachineServer.ts` | 3004 | X+1 game state management |
| Launcher | `MCPLauncherServer.ts` | 3050 | Server orchestration |

### Startup Commands
```bash
npm start                # DevOps server (default)
npm run start:wiki       # Wiki browser server
npm run start:state      # State machine server
npm run start:launcher   # Launcher server
```

### MCP Capabilities
- **Tools**: 20+ tools for CRUD operations, system control, simulation
- **Resources**: 7 resources (project status, npm scripts, game state, etc.)
- **Prompts**: 3 prompts for system operations

---

## 4. mcp-model-sdk Analysis

### Purpose
Preset management service providing REST API for MCP catalog operations.

### Mode: CATALOG-ONLY
```javascript
// preset_service.mjs
console.log('Mode: Preset Management Only (No AI Inference)');
```

**Critical**: This service does NOT perform LLM inference. VS Code Copilot handles inference.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/status` | GET | Detailed status |
| `/ai/ui/mcp/list` | GET | Complete MCP catalog |
| `/ai/ui/mcp/presets` | GET | List saved presets |
| `/ai/ui/mcp/preset/:name` | GET | Get specific preset |
| `/ai/ui/mcp/set` | POST | Create/update preset |

### Preset Storage
```
mcp-model-sdk/
└── PRESETS/
    ├── mcp_presets.json    # Saved presets
    └── mcp_servers.json    # Server registry
```

---

## 5. Zeus Analysis

### Purpose
Web UI for MCP preset gallery and catalog management.

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Templating**: HyperAxe (functional HTML)
- **Styling**: Theme-based CSS (5 themes)

### Directory Structure
```
zeus/
├── backend/          # API handlers (aiHandler, mcpHandler, presetHandler)
├── server/           # ZeusServer.js - Express server
├── views/            # HyperAxe templates
├── configs/          # Configuration (zeus-config.json)
├── models/           # Data models
├── client/assets/    # Static files, themes
└── PLANIFICACION/    # Documentation, VibeCoding
```

### Views

| Route | View | Status |
|-------|------|--------|
| `/` | Home | ✅ Active |
| `/presets` | Preset Library | ✅ Active |
| `/editor` | MCP Editor | ✅ Active |
| `/settings` | Settings | ✅ Active |
| `/stats` | Statistics | ✅ Active |
| `/ai` | AI Chat | ⚠️ Disabled (catalog-only) |

### Configuration (zeus-config.json)
```json
{
  "features": {
    "aiConversations": false,    // Disabled
    "presetLibrary": true,
    "mcpExplorer": true,
    "themeSystem": true
  },
  "catalog": {
    "endpoint": "http://localhost:4001",
    "mode": "catalog-only",
    "inferenceEnabled": false
  }
}
```

---

## 6. Historical Context

### Previous Studies (Archived)
- **estudio_asterion.md** - Original MCP Mesh SDK Web Interface analysis
- **estudio_diogenes.md** - Oasis Social Networking patterns analysis

### Key Learnings Preserved
1. **HyperAxe Templating** - Functional HTML generation pattern adopted
2. **Theme System** - CSS-based theming with 5 compatible themes
3. **Configuration-Driven** - Feature flags, JSON configuration
4. **Modular Architecture** - Clear separation of concerns

### Deprecated Patterns
- **SLMo42 Inference** - Replaced by VS Code Copilot
- **Asterion Hydration** - Resolved in Zeus implementation
- **Mixed TS/JS** - Standardized approach per package

---

## 7. Integration Patterns

### Scriptorium Integration
MCPGallery serves as the MCP entry point for Aleph Scriptorium:

1. **Discovery**: Zeus displays available MCP servers
2. **Selection**: Users create presets from MCP capabilities
3. **Persistence**: Presets saved to `mcp_presets.json`
4. **Usage**: Copilot Chat uses presets via `.vscode/mcp.json`

### VS Code MCP Configuration
```json
// .vscode/mcp.json
{
  "servers": {
    "devops-mcp-server": {
      "command": "npx",
      "args": ["tsx", "src/DevOpsServer.ts"],
      "cwd": "${workspaceFolder}/mcp-mesh-sdk"
    }
  }
}
```

---

## 8. Development Guidelines

### Starting Services
```bash
# From monorepo root
npm run start:all        # All services
npm run start:mesh       # MCP Mesh only (:3003)
npm run start:model      # Preset Service only (:4001)
npm run start:zeus       # Zeus UI only (:3012)
```

### Agent Development
Located in `.github/agents/`:
- `zeus-architect.agent.md` - Architecture decisions
- `backend-agent.agent.md` - Backend development
- `frontend-agent.agent.md` - UI development
- `config-agent.agent.md` - Configuration
- `validation-agent.agent.md` - Quality gates

### VibeCoding Protocol
Documentation in `zeus/PLANIFICACION/VIBECODING/`:
- `zeus_main_context_base.md` - Project context
- `zeus_main_checkpoint_list.md` - Progress tracking
- `ITERATIONS/` - Sprint documentation
