---
description: Instructions for Scriptorium team integration and cross-team collaboration
applyTo: "zeus/PLANIFICACION/**"
---

# Scriptorium Integration Instructions

These instructions guide cross-team collaboration between MCPGallery (Zeus) and Aleph Scriptorium.

## Integration Context

MCPGallery serves as the **MCP entry point** for Aleph Scriptorium. Zeus provides:
- Catalog discovery of MCP servers
- Preset management for tool combinations
- REST API for plugin consumption

## Key Documents for Scriptorium Team

### Quick Start
→ `zeus/PLANIFICACION/SCRIPTORIUM_QUICKREF.md`

### Detailed Documentation
| Document | Purpose |
|----------|---------|
| `zeus/PLANIFICACION/DEMO_CHECKPOINTS_SCRIPTORIUM.md` | E2E validation protocol |
| `zeus/PLANIFICACION/HANDOFFS_SCRIPTORIUM_AGENTS.md` | Agent activation guide |
| `zeus/PLANIFICACION/CARTA_REQUERIMIENTOS_SCRIPTORIUM.md` | Pending requirements |

## Agent Activation Protocol

When Scriptorium team needs Zeus help:

1. **Identify the right agent**:
   - Architecture → `@zeus-architect`
   - Backend/API → `@backend-agent`
   - UI/Views → `@frontend-agent`
   - Testing → `@debug-agent` or `@integration-agent`
   - MCP servers → `@mcpgaia-agent`

2. **Create handoff document** following template in HANDOFFS_SCRIPTORIUM_AGENTS.md

3. **Tag agent** in chat or issue

4. **Expect deliverables** as documented in handoff

## Demo Checkpoint Execution

Scriptorium team should execute Demo Checkpoints A-E:

| Checkpoint | What to Validate |
|------------|-----------------|
| A | MCP Server in VS Code mcp.json |
| B | Catalog tools available via API |
| C | Preset Service scans servers |
| D | Zeus UI creates demo pack |
| E | TypedPrompts consumes preset |

## Pending Requirements

MCPGallery awaits Scriptorium response on 7 requirements (REQ-01 to REQ-07).
See `zeus/PLANIFICACION/CARTA_REQUERIMIENTOS_SCRIPTORIUM.md`.

When responding:
1. Update the requirements document with responses
2. Update `zeus_main_checkpoint_list.md` to unblock sprints
3. Activate relevant agents for implementation

## Cross-Team Communication Pattern

### Scriptorium → MCPGallery
```markdown
## Request: [Task Name]

**From**: Scriptorium Team
**Priority**: HIGH / MEDIUM / LOW
**Target Agent**: [Agent Name]

**Context**: [Current situation]
**Request**: [What you need]
**Timeline**: [When needed]
```

### MCPGallery → Scriptorium
```markdown
## Completion Notice: [Task Name]

**Agent**: [Agent Name]
**Date**: YYYY-MM-DD
**Status**: ✅ COMPLETED

**Summary**: [What was done]
**Next Steps for Scriptorium**: [Action items]
```

## Service Architecture

```
Scriptorium Plugin → Zeus (:3012) → Preset Service (:4001) → MCP Mesh (:3003+)
```

- **Zeus**: UI + API gateway
- **Preset Service**: Catalog management
- **MCP Mesh**: Actual MCP servers (DevOps, Wiki, StateMachine)

## API Endpoints for Plugin

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Service health |
| `/api/catalog` | GET | Full MCP catalog |
| `/api/presets` | GET | List all presets |
| `/api/presets/:name` | GET | Get specific preset |
| `/api/presets` | POST | Create/update preset |

## Response Processing

When Scriptorium responds to requirements:

1. **Zeus Architect** reviews responses
2. Updates `zeus_main_checkpoint_list.md`
3. Creates implementation tasks
4. Assigns to appropriate agents
5. Notifies Scriptorium of progress
