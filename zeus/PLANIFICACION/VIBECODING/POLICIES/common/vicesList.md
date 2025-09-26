## Vices List Updates

### New Vices Added:
- S03-2025-09-26: Configuration drift between implementation and config files leads to runtime failures
- S03-2025-09-26: Documentation updates lagging behind implementation creates false project state
- S03-2025-09-26: Delayed standardization of CSS variables causes inconsistent theming
- S03-2025-09-26: Checkpoint status not updated in real-time obscures project progress


- **Template Gaps**: None identified - template worked well.
- **Checkpoint Issues**: Planning checkpoints could be more granular for complex analysis phases.
- **Standard Ambiguities**: None at this stage.
- **Process Bottlenecks**: None encountered.
- **Tool Limitations**: Semantic search initially limited but resolved with targeted reading.

## S04 Sprint 04 Vices (Settings Implementation)

### Technical Vices
- **Hardcoded configuration values**: Despite having comprehensive config-manager.js, introduced hardcoded URLs (localhost:4001) violating configuration-driven principle
- **Default value inconsistency**: Mixed config-driven and hardcoded defaults in same application
- **Configuration oversight**: During multi-component implementation, existing config patterns weren't consistently applied

### Process Vices
- **Quality gate gaps**: Configuration consistency not caught during development phase
- **Standard enforcement**: Configuration-driven principle needs stronger emphasis during implementation

## S05 Sprint 05 Vices (Advanced Views Implementation)

### Process Vices
**NONE IDENTIFIED** - Sprint 05 demonstrated exceptional quality standards across all dimensions

## S06 Sprint 06 Vices (Integration Agent & Routing Fixes)

### Technical Vices
- Residual hardcoded localhost placeholders detected in settings view and tests (now fixed)
- Navigation link mismatch for MCP Editor (/mcp vs /editor) causing route inconsistency (fixed)

### Process Vices
- Integration validation was introduced late (now institutionalized as Phase 6.5)
