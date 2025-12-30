# ADR-006: MCPGallery Scriptorium Integration Upgrade

> **Status**: PROPOSED  
> **Decision Date**: 2025-12-30  
> **Authors**: Zeus Architect  
> **Scope**: MCPGallery ecosystem → Aleph Scriptorium integration

---

## 🎯 Executive Summary

MCPGallery has evolved from an isolated prototype to an integrated component of **Aleph Scriptorium**. This ADR documents the architectural changes required to:

1. **Recognize MCPGallery as the MCP entry point** for the SDK ecosystem (model, mesh, core)
2. **Disconnect Zeus from SLMo42 inference** (model inference cycle completed)
3. **Migrate VS Code Copilot Chat configuration** (chatmodes → agents)
4. **Define the MCP Presets Gallery use case** for Scriptorium users

---

## 📊 Current State Analysis

### Repository Structure (Validated 2025-12-30)

```
MCPGallery/                           # Aleph Scriptorium submódulo
├── .github/                          # ⚠️ NEEDS UPGRADE
│   ├── chatmodes/                    # → Will become 'agents/'
│   ├── instructions/                 # → Preserved, updated applyTo paths
│   ├── prompts/                      # → Preserved
│   └── copilot-instructions.md       # → Updated for Scriptorium context
├── mcp-core-sdk/                     # Base MCP Server + AlephScript Server
├── mcp-mesh-sdk/                     # DevOps + Launcher + Wiki + StateMachine
├── mcp-model-sdk/                    # Preset Service (NO INFERENCE - simplified)
├── zeus/                             # UI de gestión + Catálogo
└── package.json                      # npm workspaces configuration
```

### Service Architecture (Pre-Upgrade)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Zeus (:3012) ──HTTP──→ SLMo42 (:4001) ──MCP──→ MCPGaia (:3003) │
│       │                     │                        │            │
│       │                     │                        │            │
│   UI Gallery          Inference +              DevOps MCP        │
│   Presets            MCP Proxy                 Server            │
│                     (DEPRECATED)                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Findings

1. **SLMo42 Inference Deprecated**: `mcp-model-sdk/preset_service.mjs` confirms:
   ```
   Mode: Preset Management Only (No AI Inference)
   ```

2. **Zeus → SLMo42 Dependencies** (files to modify):
   - [zeus/backend/aiHandler.js](../../backend/aiHandler.js) - `sendMessageToSLMo42()`
   - [zeus/backend/mcpHandler.js](../../backend/mcpHandler.js) - `slmo42Endpoint`
   - [zeus/configs/zeus-config.json](../../configs/zeus-config.json) - `ai.endpoint`

3. **VS Code Copilot Chat Changes**: 
   - `chatmodes/` folder → `agents/` folder
   - File extension remains `.chatmode.md` for backward compatibility
   - New agent registration via VS Code settings

---

## 🏗️ Target Architecture

### Post-Upgrade Service Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TARGET ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐    ┌─────────────────┐    ┌──────────────────┐  │
│  │  Zeus (:3012)  │    │ Preset Service  │    │  MCP Mesh SDK    │  │
│  │  ════════════  │    │ (:4001)         │    │  (:3003+)        │  │
│  │                │    │ ═══════════════ │    │  ══════════════  │  │
│  │  • UI Gallery  │◄──►│ • /mcp/list     │◄──►│  • DevOps        │  │
│  │  • Presets     │    │ • /mcp/presets  │    │  • Wiki          │  │
│  │  • Themes      │    │ • /mcp/set      │    │  • StateMachine  │  │
│  │                │    │                 │    │  • Launcher      │  │
│  └────────────────┘    └─────────────────┘    └──────────────────┘  │
│           │                                             │            │
│           └──────────────── NO INFERENCE ───────────────┘            │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Aleph Scriptorium                           │  │
│  │   • VS Code Extension consumes MCPGallery endpoints           │  │
│  │   • Copilot Chat uses configured MCP servers from presets     │  │
│  │   • No direct LLM inference - uses Copilot as inference       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Use Case: MCP Presets Gallery for Scriptorium

### Primary Use Case

**Actor**: Aleph Scriptorium User  
**Goal**: Select and configure MCP presets for use with VS Code Copilot Chat

### Flow

```
1. User opens Scriptorium workspace
2. MCPGallery services auto-start (via npm scripts)
3. User navigates to Zeus UI (localhost:3012)
4. Zeus fetches MCP catalog from Preset Service (/ai/ui/mcp/list)
5. User explores available MCP servers, tools, resources, prompts
6. User creates/selects a preset (combination of capabilities)
7. Preset is saved to mcp-model-sdk/PRESETS/mcp_presets.json
8. VS Code Copilot Chat uses preset via .vscode/mcp.json configuration
9. Copilot has access to selected MCP tools during conversations
```

### Endpoints Used (Preset Service :4001)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ai/ui/mcp/list` | GET | Complete MCP catalog |
| `/ai/ui/mcp/presets` | GET | List saved presets |
| `/ai/ui/mcp/preset/:name` | GET | Get specific preset |
| `/ai/ui/mcp/set` | POST | Create/update preset |
| `/health` | GET | Service health check |

### Key Insight: No Inference Required

- **Zeus**: UI-only, no LLM calls
- **Preset Service**: Catalog management only
- **MCPGaia**: MCP protocol server (invoked by Copilot, not Zeus)
- **Inference**: Handled by VS Code Copilot (cloud-based)

---

## 🔄 Migration Plan: .github Folder Restructure

### Current Structure → Target Structure

```
.github/
├── chatmodes/                    →  agents/
│   ├── *.chatmode.md                 ├── *.chatmode.md (same format)
│   └── slmo42-agent.chatmode.md      └── DEPRECATED (remove or archive)
├── instructions/                 →  instructions/ (preserved)
│   └── *.instructions.md              └── *.instructions.md (update paths)
├── prompts/                      →  prompts/ (preserved)
│   └── *.prompt.md                    └── *.prompt.md (update references)
└── copilot-instructions.md       →  copilot-instructions.md (major update)
```

### Files to Archive/Remove

1. **`slmo42-agent.chatmode.md`** - Inference agent deprecated
2. References to SLMo42 inference in other agents

### Files to Update

1. **`copilot-instructions.md`** - Remove asterion/diogenes references, add Scriptorium context
2. **`zeus-architect.chatmode.md`** - Update for Scriptorium integration role
3. **`backend-agent.chatmode.md`** - Remove SLMo42 inference responsibilities
4. **`integration-agent.chatmode.md`** - Update service chain documentation
5. All `instructions/*.instructions.md` - Verify applyTo patterns

### New Files to Create

1. **`agents/scriptorium-integration-agent.chatmode.md`** - Scriptorium-specific agent
2. **`prompts/scriptorium-catalog-sync.prompt.md`** - Catalog synchronization workflow

---

## 📝 Zeus Code Changes Required

### 1. Disconnect SLMo42 Inference (aiHandler.js)

**Before**: `sendMessageToSLMo42()` sends inference requests  
**After**: Remove or stub AI inference methods (UI conversations are local-only or disabled)

### 2. Update MCPHandler (mcpHandler.js)

**Before**: `slmo42Endpoint` points to inference service  
**After**: Rename to `presetServiceEndpoint`, clarify it's catalog-only

### 3. Configuration Update (zeus-config.json)

```json
{
  "ai": {
    "endpoint": "http://localhost:4001",
    "mode": "catalog-only",           // NEW: clarify no inference
    "inferenceEnabled": false          // NEW: explicit flag
  }
}
```

### 4. Feature Flags Update

```json
{
  "features": {
    "aiConversations": false,          // Disable until Copilot integration
    "presetLibrary": true,
    "mcpExplorer": true,
    "themeSystem": true
  }
}
```

---

## 🎯 Implementation Phases

### Phase 1: Documentation & Planning (This ADR)
- [x] Analyze current codebase state
- [x] Document use case for MCP Presets Gallery
- [x] Plan .github restructure
- [ ] Stakeholder approval

### Phase 2: .github Migration
- [ ] Rename `chatmodes/` → `agents/`
- [ ] Archive `slmo42-agent.chatmode.md`
- [ ] Update `copilot-instructions.md` for Scriptorium
- [ ] Update all agent instructions for new context
- [ ] Create Scriptorium-specific agents

### Phase 3: Zeus Code Refactor
- [ ] Remove SLMo42 inference code from aiHandler.js
- [ ] Rename slmo42Endpoint → presetServiceEndpoint
- [ ] Update zeus-config.json with new flags
- [ ] Disable AI conversation UI (or repurpose for Copilot relay)
- [ ] Verify preset CRUD still works without inference

### Phase 4: Integration Testing
- [ ] Verify Zeus ↔ Preset Service communication
- [ ] Test preset creation/selection workflow
- [ ] Validate .vscode/mcp.json preset integration
- [ ] Confirm Copilot Chat can use presets

---

## 📚 Reference Documents

- [README-SCRIPTORIUM.md](../../README-SCRIPTORIUM.md) - Ecosystem overview
- [mcp-model-sdk/preset_service.mjs](../../../mcp-model-sdk/preset_service.mjs) - Simplified service
- [Sprint 6.10 Checkpoint](./VIBECODING/zeus_main_checkpoint_list.md) - Historical SLMo42 integration

---

## ✅ Decision

**Approved Actions:**

1. Proceed with .github folder restructure (chatmodes → agents)
2. Archive SLMo42 inference agent and related code
3. Update Zeus to catalog-only mode (no inference)
4. Create Scriptorium-specific integration documentation

**Rationale:**
- SLMo42 inference was experimental and is superseded by Copilot Chat
- MCPGallery's role is catalog/preset management, not inference
- VS Code Copilot handles LLM inference natively
- Simplification improves maintainability and reduces complexity

---

*This ADR serves as the canonical reference for the MCPGallery → Scriptorium integration upgrade.*
