# 📚 Scriptorium Integration — Document Index

> **Purpose**: Central index for all Scriptorium ↔ MCPGallery integration documentation.  
> **Maintained by**: @ox (Scriptorium), Zeus Architect (MCPGallery)  
> **Last update**: 2025-12-30

---

## Quick Navigation

| Document | Type | Description |
|----------|------|-------------|
| [SCRIPTORIUM_QUICKREF.md](SCRIPTORIUM_QUICKREF.md) | 📋 Quick Start | How to start services, validate, and get help |
| [CARTA_REQUERIMIENTOS_SCRIPTORIUM.md](CARTA_REQUERIMIENTOS_SCRIPTORIUM.md) | 📨 Requirements | Questions from Zeus → Scriptorium |
| [../RESPUESTA_SCRIPTORIUM.md](../RESPUESTA_SCRIPTORIUM.md) | ✅ Responses | Official answers from Scriptorium |
| [HANDOFFS_SCRIPTORIUM_AGENTS.md](HANDOFFS_SCRIPTORIUM_AGENTS.md) | 🤝 Protocol | How to invoke MCPGallery agents |
| [REUNION_REVISION_2025-12-30.md](REUNION_REVISION_2025-12-30.md) | 📅 Meeting | Sprint review notes |
| [ANALISIS_README_SCRIPTORIUM_DRY.md](ANALISIS_README_SCRIPTORIUM_DRY.md) | 📊 Analysis | DRY audit of README files |

---

## Related Resources

| Resource | Location | Description |
|----------|----------|-------------|
| **ADR-006** | [zeus/PLANIFICACION/ADR/](../../../zeus/PLANIFICACION/ADR/) | Architecture Decision Record |
| **E2E Checkpoints** | [test/e2e-scriptorium/](../../../test/e2e-scriptorium/) | Demo validation scenarios |
| **Main README** | [README-SCRIPTORIUM.md](../../../README-SCRIPTORIUM.md) | Entry point for Scriptorium users |

---

## Status Summary

| REQ | Question | Status |
|-----|----------|--------|
| REQ-01 | Plugin exists? | ✅ Yes, `mcp-presets` |
| REQ-02 | Formation file? | ✅ In backlog borradores |
| REQ-03 | mcp.json config? | ✅ devops-mcp-server configured |
| REQ-04 | Epic backlog? | ✅ SCRIPT-2.1.0 accessible |
| REQ-05 | Canonical name? | ✅ `mcp-presets` (plugin), `MCPGallery` (repo) |
| REQ-06 | Plugin → Zeus? | ✅ Yes, Zeus as gateway |
| REQ-07 | Discovery mechanism? | ✅ On-demand with graceful fallback |

---

## Next Steps

1. **Run E2E Checkpoints** → `test/e2e-scriptorium/DEMO_CHECKPOINTS_SCRIPTORIUM.md`
2. **Finalize ADR-006** → Approve and implement
3. **Complete plugin prompts** → `.github/plugins/mcp-presets/prompts/`

---

## Commit Convention

See [as_commit-message.prompt.md](../../prompts/as_commit-message.prompt.md) for MCPGallery commit format.
