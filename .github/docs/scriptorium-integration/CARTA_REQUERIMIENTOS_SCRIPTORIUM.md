# 📨 Carta de Requerimientos al Equipo de Aleph Scriptorium

> **De**: Zeus Architect (MCPGallery)  
> **Para**: Product Owner, Scrum Master — Aleph Scriptorium  
> **Fecha**: 30 de diciembre de 2025  
> **Asunto**: Solicitud de información y propuestas de integración  
> **Referencia**: Reunión de Revisión SCRIPT-2.2.4

---

## 📋 Resumen Ejecutivo

Tras analizar la documentación de integración (4 README-SCRIPTORIUM.md), he identificado **referencias a recursos que no existen en MCPGallery** pero que se asume viven en el ecosistema Scriptorium.

Solicito **clarificación** sobre el estado de estos recursos y propongo **alternativas por defecto** en caso de que aún no existan.

---

## 🔴 REQUERIMIENTOS CRÍTICOS — Información Solicitada

### REQ-01: Estado del Plugin Bridge

**Contexto**: Múltiples documentos referencian:
```
@plugin_ox_mcppresets
ubicación: .github/plugins/mcp-presets/
agente: .github/agents/plugin_ox_mcppresets.agent.md
```

**Pregunta**: ¿Existe este plugin en Scriptorium? ¿En qué estado de desarrollo?

| Campo | Valor Esperado | Valor Actual |
|-------|----------------|--------------|
| Nombre | `plugin_ox_mcp-gallery` o `plugin_ox_mcppresets` | ❓ Desconocido |
| Ubicación | `.github/plugins/mcp-presets/` en ALEPH | ❓ No verificado |
| Funcionalidad | Consumir API de Zeus (:3012) | ❓ No especificado |

**Propuesta por defecto**: Si no existe, MCPGallery puede proporcionar:
- Especificación de API que el plugin debe consumir
- Mock/stub de plugin para desarrollo paralelo
- Contrato OpenAPI para endpoints de Zeus

---

### REQ-02: Archivo de Formación del Agente

**Referencia en README-SCRIPTORIUM.md**:
```
| Formación del agente | `08_Formacion_McpPresets_MCP_Server.md` |
```

**Pregunta**: ¿Este archivo existe en Scriptorium? ¿Qué contiene?

**Propuesta por defecto**: MCPGallery puede crear un archivo `AGENT_FORMATION.md` con:
- Capabilities del agente MCP
- Tools disponibles para Copilot
- Ejemplos de prompts efectivos

---

### REQ-03: Configuración mcp.json en ALEPH

**Contexto**: El DevOps MCP Server debe registrarse en `ALEPH/.vscode/mcp.json`

**Pregunta**: ¿Cuál es la estructura actual del mcp.json de ALEPH?

**Propuesta por defecto**:
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

**Necesito saber**: ¿Hay otros servidores MCP ya registrados? ¿Conflictos de nombres?

---

### REQ-04: Épica SCRIPT-2.2.4 — Alcance Definitivo

**Contexto**: README raíz menciona:
```
Épica activa: SCRIPT-2.2.4 (MCP Integration)
Backlog: ARCHIVO/DISCO/BACKLOG_BORRADORES/Diciembre_29_TypedPrompting_ContextManager/
```

**Pregunta**: ¿Puedo acceder al backlog detallado de esta épica?

**Necesito saber**:
- User stories priorizadas
- Criterios de aceptación del plugin
- Dependencias entre MCPGallery y otros componentes de Scriptorium

---

## 🟡 REQUERIMIENTOS IMPORTANTES — Clarificaciones

### REQ-05: Nomenclatura del Plugin

Los documentos usan nombres inconsistentes:
- `@plugin_ox_mcppresets`
- `plugin_ox_mcp-gallery`
- `mcp-presets`

**Pregunta**: ¿Cuál es el nombre canónico?

**Propuesta**: Adoptar `plugin_ox_mcp-gallery` para alinearse con el nombre del repositorio MCPGallery.

---

### REQ-06: Ownership de Endpoints

**Flujo documentado**:
```
Plugin Scriptorium → Zeus (:3012) → Preset Service (:4001) → MCP Mesh (:3003)
```

**Pregunta**: ¿El plugin consulta a Zeus o directamente a Preset Service?

| Opción | Pros | Contras |
|--------|------|---------|
| Plugin → Zeus | UI + API unificados, cache | Dependencia adicional |
| Plugin → Preset Service | Directo, menos hops | Bypass de Zeus |

**Propuesta**: Plugin → Zeus (mantener Zeus como gateway único)

---

### REQ-07: Mecanismo de Discovery

**Pregunta**: ¿Cómo sabe el plugin que MCPGallery está activo?

**Opciones**:
1. **Polling**: GET `/health` periódico
2. **Startup**: Check único al arrancar Scriptorium
3. **On-demand**: Check al invocar funcionalidad MCP
4. **mDNS/Bonjour**: Discovery automático en red local

**Propuesta por defecto**: Opción 3 (on-demand) con fallback graceful si no disponible.

---

## 🟢 PROPUESTAS DE MCPGALLERY

### PROP-01: Contrato de API para Plugin

MCPGallery se compromete a exponer estos endpoints estables:

```http
# Catálogo
GET /api/catalog
Response: { servers: [...], totalTools: n, totalResources: n }

# Presets
GET /api/presets
Response: { presets: [...] }

POST /api/presets
Body: { name, description, tools: [], resources: [], prompts: [] }
Response: { success: true, preset: {...} }

# Health
GET /health
Response: { status: "ok", version: "0.1.0" }
```

**Propuesta**: Publicar OpenAPI spec en `/api/docs` o archivo estático.

---

### PROP-02: Modo Offline/Fallback

Si el plugin no puede conectar a MCPGallery:

```json
{
  "fallback": {
    "mode": "static",
    "source": "bundled-catalog.json",
    "message": "MCPGallery no disponible. Usando catálogo estático."
  }
}
```

**Propuesta**: MCPGallery genera `bundled-catalog.json` con snapshot del catálogo.

---

### PROP-03: Evento de Sincronización

Cuando cambia el catálogo o presets:

```javascript
// MCPGallery emite (si hay WebSocket)
event: 'catalog:updated'
data: { timestamp, changedServers: [...] }

// O el plugin puede suscribirse a polling endpoint
GET /api/catalog/version
Response: { version: "abc123", lastModified: "..." }
```

---

### PROP-04: zeus/README-SCRIPTORIUM.md

Propongo crear este archivo para documentar:
- Endpoints de Zeus específicos para el plugin
- Configuración de temas
- Vistas disponibles
- Guía de integración

---

## 📊 Matriz de Responsabilidades Propuesta

| Recurso | Owner | Consumidor |
|---------|-------|------------|
| `devops-mcp-server` (:3003) | MCPGallery | VS Code Copilot |
| `preset_service` (:4001) | MCPGallery | Zeus, Plugin |
| `zeus` (:3012) | MCPGallery | Plugin, Usuario |
| `plugin_ox_mcp-gallery` | **Scriptorium** | @aleph agent |
| `ALEPH/.vscode/mcp.json` | **Scriptorium** | VS Code |
| `08_Formacion_*.md` | **Scriptorium** | Agents |

---

## 📅 Timeline Propuesto

| Semana | MCPGallery | Scriptorium |
|--------|------------|-------------|
| S1 (30 dic - 5 ene) | Publicar OpenAPI spec | Confirmar estado del plugin |
| S2 (6-12 ene) | Completar Zeus UI | Crear plugin stub |
| S3 (13-19 ene) | E2E testing | Integración inicial |
| S4 (20-26 ene) | Hardening | Testing conjunto |

---

## 🤝 Siguiente Paso Inmediato

**Solicito respuesta a los 7 requerimientos (REQ-01 a REQ-07)** antes de continuar con la implementación del Sprint 07.

Prioridad:
1. **REQ-01** (Plugin bridge) — Crítico para arquitectura
2. **REQ-04** (Épica backlog) — Necesario para planificación
3. **REQ-06** (Ownership endpoints) — Afecta diseño de API

---

**Atentamente,**

**Zeus Architect**  
MCPGallery Ecosystem  
`integration/beta/scriptorium`

---

*Documento generado: 2025-12-30*  
*Referencia: [ANALISIS_README_SCRIPTORIUM_DRY.md](ANALISIS_README_SCRIPTORIUM_DRY.md)*
