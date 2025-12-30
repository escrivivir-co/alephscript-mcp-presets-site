# 📋 Scriptorium Integration Quick Reference

> **For**: Aleph Scriptorium Team  
> **From**: Zeus Architect  
> **Date**: 2025-12-30  
> **Version**: 1.0

---

## 🚀 Quick Start for Scriptorium Team

### 1. Start MCPGallery Services

```bash
# From ALEPH workspace
cd MCPGallery

# Option A: Start all services
npm run start:all

# Option B: Start individually
npm run start:mesh   # DevOps MCP Server :3003
npm run start:model  # Preset Service :4001
npm run start:zeus   # Zeus UI :3012
```

### 2. Validate Services

```bash
curl http://localhost:3003/health  # → {"status":"ok"}
curl http://localhost:4001/health  # → {"status":"ok"}
curl http://localhost:3012/health  # → {"status":"ok"}
```

### 3. Access Zeus UI

Open: http://localhost:3012

---

## 📦 Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Demo Checkpoints** | E2E validation | `zeus/PLANIFICACION/DEMO_CHECKPOINTS_SCRIPTORIUM.md` |
| **Agent Handoffs** | Activate Zeus agents | `zeus/PLANIFICACION/HANDOFFS_SCRIPTORIUM_AGENTS.md` |
| **Requirements** | Pending responses | `zeus/PLANIFICACION/CARTA_REQUERIMIENTOS_SCRIPTORIUM.md` |
| **Checkpoint List** | Sprint tracking | `zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md` |

---

## 🎯 Demo Checkpoints Summary

| # | What to Test | Expected Result |
|---|--------------|-----------------|
| **A** | Add devops-mcp-server to `.vscode/mcp.json` | Copilot sees MCP tools |
| **B** | Query `/ai/ui/mcp/list` | Returns 20+ tools |
| **C** | Start Preset Service | Logs show server scan |
| **D** | Create "Aleph Scriptorium Demo Pack" in Zeus | Preset saved to JSON |
| **E** | Fetch preset via `/api/presets/:name` | TypedPrompts can consume |

---

## 🤝 Need Help? Activate an Agent

```
@zeus-architect    → Architecture questions
@backend-agent     → API/endpoint issues
@frontend-agent    → UI/view problems
@integration-agent → E2E testing
@mcpgaia-agent     → MCP server issues
@debug-agent       → Testing/validation
```

See [HANDOFFS_SCRIPTORIUM_AGENTS.md](HANDOFFS_SCRIPTORIUM_AGENTS.md) for detailed protocols.

---

## ⏳ Pending Your Response

7 requirements await your input:

1. **REQ-01**: Does `plugin_ox_mcp-gallery` exist?
2. **REQ-02**: Where is `08_Formacion_McpPresets_MCP_Server.md`?
3. **REQ-03**: Current `ALEPH/.vscode/mcp.json` structure?
4. **REQ-04**: SCRIPT-2.2.4 epic backlog access?
5. **REQ-05**: Canonical plugin name?
6. **REQ-06**: Plugin → Zeus or Plugin → Preset Service?
7. **REQ-07**: Discovery mechanism preference?

→ Full details: [CARTA_REQUERIMIENTOS_SCRIPTORIUM.md](CARTA_REQUERIMIENTOS_SCRIPTORIUM.md)

---

## 📞 Contact Points

- **Zeus Architect**: Architecture, ecosystem coordination
- **Integration Agent Indra**: E2E testing, validation
- **MCPGaia Agent**: MCP server operations

---

*¡Esperamos vuestra respuesta para continuar la integración!*
