# 🤝 Agent Handoffs — Scriptorium Integration

> **Version**: 1.0  
> **Date**: 2025-12-30  
> **Purpose**: Enable Scriptorium team to activate Zeus agents for collaborative work

---

## Overview

MCPGallery uses a specialized **agent system** for development. Each agent has specific responsibilities and can be activated by the Scriptorium team for collaborative tasks.

This document provides **handoff protocols** for each agent type.

---

## Available Agents

| Agent | File | Primary Responsibility |
|-------|------|------------------------|
| **Zeus Architect** | `zeus-architect.agent.md` | Architecture, ecosystem design |
| **Backend Agent** | `backend-agent.agent.md` | API, handlers, server logic |
| **Frontend Agent** | `frontend-agent.agent.md` | Views, UI, HyperAxe templates |
| **Config Agent** | `config-agent.agent.md` | Configuration, settings, themes |
| **Integration Agent** | `integration-agent.agent.md` | Cross-component coordination |
| **MCPGaia Agent** | `mcpgaia-agent.agent.md` | MCP server operations |
| **Debug Agent** | `debug-validation-agent.agent.md` | Testing, E2E, validation |
| **Validation Agent** | `validation-agent.agent.md` | Quality gates, code review |

---

## Handoff Protocol: Zeus Architect

### When to Activate
- Architecture decisions affecting Scriptorium integration
- New endpoint design for plugin communication
- Cross-package coordination (mesh, model, zeus)

### Activation Command
```
@zeus-architect Review integration architecture for [specific need]
```

### Required Context
1. Current ALEPH workspace structure
2. Plugin requirements or constraints
3. Existing mcp.json configuration

### Expected Deliverables
- ADR (Architecture Decision Record) if significant change
- Updated documentation
- Implementation plan for other agents

### Example Handoff
```markdown
## Handoff: Zeus Architect — Plugin Endpoint Design

**From**: Scriptorium Team
**Context**: TypedPrompts plugin needs specific preset format
**Need**: Design API contract for preset export

**Current State**:
- Zeus exposes GET /api/presets/:name
- Plugin expects specific JSON structure

**Questions**:
1. Should we add query parameters for filtering?
2. What authentication (if any) for plugin?
3. Rate limiting considerations?

**Attachments**:
- Current TypedPrompts plugin spec
- Expected JSON format sample
```

---

## Handoff Protocol: Backend Agent

### When to Activate
- New API endpoints needed
- Handler modifications for integration
- Database/persistence changes

### Activation Command
```
@backend-agent Implement [endpoint/handler] for Scriptorium integration
```

### Required Context
1. Endpoint specification (method, path, body, response)
2. Data flow (which services involved)
3. Error handling requirements

### Expected Deliverables
- Implemented handler in `backend/`
- Updated routes in `server/ZeusServer.js`
- API documentation

### Example Handoff
```markdown
## Handoff: Backend Agent — Preset Export Endpoint

**From**: Zeus Architect
**Context**: TypedPrompts needs preset export in specific format

**Specification**:
- Endpoint: GET /api/export/preset/:name
- Response: { tools: [], resources: [], prompts: [], metadata: {} }
- Format differs from standard GET /api/presets/:name

**Implementation Notes**:
- Transform standard preset to export format
- Include server URLs for each tool
- Add timestamp and version

**Files to Modify**:
- backend/presetHandler.js — new export function
- server/ZeusServer.js — new route
```

---

## Handoff Protocol: Frontend Agent

### When to Activate
- UI changes for Scriptorium workflows
- New views or components
- Theme adjustments

### Activation Command
```
@frontend-agent Implement [view/component] for Scriptorium UX
```

### Required Context
1. Wireframe or mockup (if available)
2. User flow description
3. Data requirements (what API provides)

### Expected Deliverables
- HyperAxe view in `views/`
- CSS in `client/assets/styles/`
- Client-side JS if needed

### Example Handoff
```markdown
## Handoff: Frontend Agent — Preset Export Button

**From**: Integration Agent
**Context**: Add "Export for TypedPrompts" button to preset library

**Specification**:
- Button in preset card actions
- Triggers download of export-format JSON
- Styled consistently with current theme

**User Flow**:
1. User sees preset card
2. Clicks "Export for TypedPrompts"
3. Browser downloads preset-name-export.json

**Files to Modify**:
- views/preset_view.js — add button component
- client/assets/js/presets.js — download handler
```

---

## Handoff Protocol: Integration Agent

### When to Activate
- Cross-component workflows
- Service communication issues
- E2E integration validation

### Activation Command
```
@integration-agent Coordinate [workflow] between Zeus and Scriptorium
```

### Required Context
1. Components involved
2. Data flow between components
3. Expected vs actual behavior

### Expected Deliverables
- Integration analysis
- Coordination with specialized agents
- E2E test specification

### Example Handoff
```markdown
## Handoff: Integration Agent — Demo Checkpoint Validation

**From**: Scriptorium Team
**Context**: Validate Demo Checkpoints A-E

**Request**:
1. Execute all demo checkpoints
2. Document pass/fail status
3. Coordinate fixes with appropriate agents

**Priority**: HIGH (blocking Scriptorium integration)
```

---

## Handoff Protocol: MCPGaia Agent

### When to Activate
- MCP server configuration
- Tool/resource/prompt discovery issues
- MCP protocol questions

### Activation Command
```
@mcpgaia-agent Debug MCP [server/tool/resource] for Scriptorium
```

### Required Context
1. Server name and port
2. Expected vs actual behavior
3. Logs if available

### Expected Deliverables
- MCP server diagnosis
- Configuration fixes
- Integration recommendations

### Example Handoff
```markdown
## Handoff: MCPGaia Agent — StateMachine Server Integration

**From**: Backend Agent
**Context**: Adding StateMachine to catalog for Demo Pack

**Request**:
1. Verify StateMachine server exposes tools correctly
2. Add to mcp_servers.json
3. Validate catalog includes its tools

**Server Info**:
- Name: state-machine-server
- Port: 3004
- Expected tools: state_get, state_transition, state_list
```

---

## Handoff Protocol: Debug Agent

### When to Activate
- E2E testing needed
- Integration validation
- Bug investigation

### Activation Command
```
@debug-agent Execute [test protocol] for Scriptorium validation
```

### Required Context
1. Test scenario description
2. Expected outcomes
3. Environment setup

### Expected Deliverables
- Test execution report
- Pass/fail documentation
- Issue tickets if failures found

### Example Handoff
```markdown
## Handoff: Debug Agent — Demo Checkpoints E2E

**From**: Integration Agent
**Context**: Execute Demo Checkpoints before Scriptorium handoff

**Request**:
1. Run all 5 demo checkpoints (A-E)
2. Use MCP Playwright for automation where possible
3. Document results in DEMO_CHECKPOINTS_SCRIPTORIUM.md

**Environment**:
- All 3 services running (mesh, model, zeus)
- Clean preset state
```

---

## Cross-Team Communication

### MCPGallery → Scriptorium
When Zeus agents complete work affecting Scriptorium:

```markdown
## Completion Notice: [Task Name]

**Agent**: [Agent Name]
**Date**: YYYY-MM-DD
**Status**: ✅ COMPLETED

**Summary**:
[Brief description of what was done]

**Deliverables**:
- [File/endpoint/feature 1]
- [File/endpoint/feature 2]

**Testing Done**:
- [Test 1]: PASS
- [Test 2]: PASS

**Next Steps for Scriptorium**:
1. [Action item 1]
2. [Action item 2]

**Questions/Blockers**:
- [Any pending items]
```

### Scriptorium → MCPGallery
When Scriptorium team needs Zeus agent help:

```markdown
## Request: [Task Name]

**From**: Scriptorium Team
**Priority**: HIGH / MEDIUM / LOW
**Target Agent**: [Agent Name or "Zeus Architect for triage"]

**Context**:
[What's the current situation?]

**Request**:
[What do you need?]

**Constraints**:
[Any limitations or requirements?]

**Timeline**:
[When is this needed?]

**Attachments**:
[Any relevant files, specs, screenshots]
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              AGENT ACTIVATION QUICK REFERENCE               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ARCHITECTURE → @zeus-architect                             │
│  API/BACKEND  → @backend-agent                              │
│  UI/VIEWS     → @frontend-agent                             │
│  CONFIG       → @config-agent                               │
│  INTEGRATION  → @integration-agent                          │
│  MCP SERVERS  → @mcpgaia-agent                              │
│  TESTING      → @debug-agent                                │
│  QUALITY      → @validation-agent                           │
│                                                             │
│  NOT SURE?    → @zeus-architect (will triage)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Owner**: Zeus Architect  
**Last Updated**: 2025-12-30  
**Version**: 1.0
