# Changelog — MCPGallery

Todos los cambios notables de este ecosistema están documentados aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.1.0] — 2025-12-30

### Añadido

- **package.json** con workspaces para los 4 submódulos
- **README-SCRIPTORIUM.md** — Documentación de integración con ALEPH Scriptorium
- **CHANGELOG.md** — Este archivo

### Submódulos sincronizados

| Submódulo | Versión | Cambios |
|-----------|---------|---------|
| mcp-core-sdk | 1.0.0 | `.gitignore` actualizado, README-SCRIPTORIUM.md mejorado |
| mcp-mesh-sdk | 1.0.0 | Scripts start:launcher/wiki/state, README-SCRIPTORIUM.md |
| mcp-model-sdk | 1.0.0 | README-SCRIPTORIUM.md, preset_service.mjs |
| zeus | 0.1.0 | (pendiente README-SCRIPTORIUM.md) |

### Estructura

```
MCPGallery/                     # v0.1.0
├── mcp-core-sdk/              # v1.0.0 - Biblioteca base
├── mcp-mesh-sdk/              # v1.0.0 - Mesh de servidores MCP
├── mcp-model-sdk/             # v1.0.0 - Preset Service
├── zeus/                      # v0.1.0 - UI de gestión
├── package.json               # Workspaces
├── README-SCRIPTORIUM.md      # Integración
└── CHANGELOG.md               # Este archivo
```

### Servidores MCP

| Servidor | Puerto | Comando |
|----------|--------|---------|
| DevOpsServer | 3003 | `npm start` |
| MCPLauncherServer | 3050 | `npm run start:launcher` |
| MCPWikiBrowserServer | 3002 | `npm run start:wiki` (via mcp-mesh-sdk) |
| MCPStateMachineServer | 3004 | `npm run start:state` (via mcp-mesh-sdk) |
| Preset Service | 4001 | `npm run start:model` |
| Zeus UI | 3012 | `npm run start:zeus` |

---

## [Unreleased]

### Por hacer

- [ ] README-SCRIPTORIUM.md para zeus
- [ ] Tests E2E del flujo Zeus → model → mesh
- [ ] Integración con `.vscode/mcp.json` dinámico

---

## Versionado de Submódulos

Los submódulos mantienen su propio versionado semántico:

- **MAJOR**: Cambios incompatibles en API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs

La versión de MCPGallery (padre) se incrementa cuando:
- Se sincroniza una nueva versión de cualquier submódulo
- Se añade nueva funcionalidad al orquestador
