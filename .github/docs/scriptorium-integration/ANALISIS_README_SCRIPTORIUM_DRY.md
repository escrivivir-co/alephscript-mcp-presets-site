# 📊 Análisis de README-SCRIPTORIUM — Plan de Homogeneización DRY

> **Fecha**: 30 de diciembre de 2025  
> **Autor**: Zeus Architect  
> **Objetivo**: Analizar los 4 README-SCRIPTORIUM.md y proponer homogeneización

---

## 📋 Inventario de README-SCRIPTORIUM.md

| # | Ubicación | Líneas | Estado |
|---|-----------|--------|--------|
| 1 | `/README-SCRIPTORIUM.md` (raíz) | 266 | ✅ Completo, referencia central |
| 2 | `/mcp-core-sdk/README-SCRIPTORIUM.md` | ~80 | ⚠️ Básico, orientado a NovelistEditor |
| 3 | `/mcp-mesh-sdk/README-SCRIPTORIUM.md` | ~100 | ✅ Correcto, documenta servidores |
| 4 | `/mcp-model-sdk/README-SCRIPTORIUM.md` | 161 | ✅ Actualizado, catalog-only |
| 5 | `/zeus/README-SCRIPTORIUM.md` | ❌ | **NO EXISTE** |

---

## 🔍 Análisis por Documento

### 1. README-SCRIPTORIUM.md (Raíz) — DOCUMENTO MAESTRO

**Rol**: Punto de entrada, overview del ecosistema

**Secciones clave**:
- Opportunity Statement ✅
- Mapa del Ecosistema ✅
- Arquitectura de Integración ✅ (diagrama ASCII)
- Flujo de Descubrimiento ✅
- Vinculación con Scriptorium ⚠️ **REFERENCIAS FANTASMA**
- Arranque para Scriptorium ✅
- Zeus UI (Catálogo v0.1.0) ✅
- Changelog de Integración ✅

**Problemas detectados**:
```
| Recurso Scriptorium | Ubicación |
|---------------------|-----------|
| Plugin | `.github/plugins/mcp-presets/` |        ← NO EXISTE
| Bridge | `.github/agents/plugin_ox_mcppresets.agent.md` |  ← NO EXISTE
| Formación | `08_Formacion_McpPresets_MCP_Server.md` |     ← NO EXISTE
```

### 2. mcp-core-sdk/README-SCRIPTORIUM.md

**Rol**: Documentar biblioteca core

**Estado**: ⚠️ **DESALINEADO**
- Menciona NovelistEditor (otro proyecto del ecosistema)
- Puerto 3066 no corresponde a MCPGallery
- No menciona la integración Zeus/Preset Service

**Contenido útil**:
- AlephScriptServer (Socket.IO) - potencialmente útil
- AlephScriptClient - para tests
- Tipado TypeScript

**Acción requerida**: Clarificar rol en MCPGallery vs NovelistEditor

### 3. mcp-mesh-sdk/README-SCRIPTORIUM.md

**Rol**: Documentar mesh de servidores MCP

**Estado**: ✅ **CORRECTO**
- Tabla de servidores (DevOps, Launcher, Wiki, StateMachine)
- Scripts de arranque
- Vinculación con Scriptorium (mismas referencias fantasma)

**Contenido duplicado con raíz**:
- Tabla de servidores (parcialmente)
- Instrucciones de arranque

### 4. mcp-model-sdk/README-SCRIPTORIUM.md

**Rol**: Documentar Preset Service (catalog-only)

**Estado**: ✅ **ACTUALIZADO**
- Refleja correctamente la simplificación SLMo42
- API Endpoints documentados
- Dependencias mínimas

**Contenido duplicado con raíz**:
- Diagrama de arquitectura (más simple)
- Flujo de datos (5 pasos)

### 5. zeus/README-SCRIPTORIUM.md — ❌ NO EXISTE

**Problema**: Zeus es el componente UI principal y no tiene README-SCRIPTORIUM

**Nota en documento raíz**:
> **Nota DRY**: Zeus NO es un submódulo git (no tiene README-SCRIPTORIUM.md propio).

**Decisión a tomar**: ¿Mantener esta política o crear README-SCRIPTORIUM para Zeus?

---

## 🚨 Referencias Fantasma (NO EXISTEN)

| Referencia | Ubicación Citada | Estado |
|------------|------------------|--------|
| `@plugin_ox_mcppresets` | Múltiples lugares | ❌ No existe en MCPGallery |
| `.github/plugins/mcp-presets/` | README raíz | ❌ Directorio no existe |
| `.github/agents/plugin_ox_mcppresets.agent.md` | README raíz | ❌ Archivo no existe |
| `08_Formacion_McpPresets_MCP_Server.md` | README raíz | ❌ Archivo no existe |

**Interpretación**: Estos recursos están **en el lado de Scriptorium**, no en MCPGallery.
El README-SCRIPTORIUM.md asume que existen, pero MCPGallery no tiene visibilidad de ellos.

---

## 📐 Estructura Propuesta (DRY)

### Modelo Hub-and-Spoke

```
README-SCRIPTORIUM.md (RAÍZ)
├── Información del ecosistema completo (NO duplicar en hijos)
├── Diagrama de arquitectura (ÚNICO, canónico)
├── Tabla de puertos/servidores (ÚNICO)
├── Referencias a Scriptorium (clarificar qué existe)
└── Links a READMEs hijos para detalles

mcp-core-sdk/README-SCRIPTORIUM.md
├── Propósito específico del SDK
├── API de clases/funciones
├── Instrucciones de uso como dependencia
└── NO: arquitectura general (→ referir a raíz)

mcp-mesh-sdk/README-SCRIPTORIUM.md  
├── Catálogo de servidores MCP
├── Scripts de arranque
├── Configuración mcp.json
└── NO: duplicar arquitectura (→ referir a raíz)

mcp-model-sdk/README-SCRIPTORIUM.md
├── API REST endpoints
├── Gestión de presets
├── PRESETS/*.json schemas
└── NO: duplicar arquitectura (→ referir a raíz)

zeus/README-SCRIPTORIUM.md (NUEVO)
├── Endpoints UI/API
├── Vistas disponibles
├── Integración con Preset Service
└── Configuración zeus-config.json
```

---

## 🔧 Violaciones DRY Detectadas

| Contenido | Aparece en | Acción |
|-----------|------------|--------|
| Diagrama arquitectura | raíz + mcp-model-sdk | Mantener solo en raíz |
| Tabla de servidores | raíz + mcp-mesh-sdk | Detalles en mesh, resumen en raíz |
| Flujo de datos | raíz + mcp-model-sdk | Consolidar en raíz |
| Instrucciones arranque | raíz + mesh + model | Referencia cruzada |
| Vinculación Scriptorium | raíz + mesh | Mantener solo en raíz |

---

## 📌 Template Propuesto para README-SCRIPTORIUM Hijos

```markdown
# {nombre-sdk} — Integración con ALEPH Scriptorium

> **Submódulo**: `{nombre-sdk}`  
> **Padre directo**: MCPGallery  
> **Puerto**: {puerto}  
> **Rama**: `integration/beta/scriptorium`  
> **Versión**: {version}  
> **Fecha**: {fecha}

---

## Propósito

{Una oración describiendo el rol específico}

---

## Rol en el Ecosistema

→ Ver [MCPGallery/README-SCRIPTORIUM.md](../README-SCRIPTORIUM.md) para arquitectura completa.

{Bullet points de responsabilidades específicas}

---

## API/Interfaz

{Tabla de endpoints/clases/funciones}

---

## Uso

{Comandos específicos de este módulo}

---

## Changelog de Integración

{Tabla de cambios relevantes a Scriptorium}
```

---

## ✅ Acciones de Homogeneización

| # | Acción | Prioridad | Responsable |
|---|--------|-----------|-------------|
| 1 | Crear `zeus/README-SCRIPTORIUM.md` | Alta | Zeus Architect |
| 2 | Eliminar duplicados de arquitectura en hijos | Media | Zeus Architect |
| 3 | Clarificar referencias fantasma (plugin) | Alta | **Scriptorium Team** |
| 4 | Aplicar template uniforme a los 4 READMEs | Media | Zeus Architect |
| 5 | Documentar qué vive en Scriptorium vs MCPGallery | Alta | Ambos equipos |

---

## 📝 Siguiente Documento

→ [CARTA_REQUERIMIENTOS_SCRIPTORIUM.md](CARTA_REQUERIMIENTOS_SCRIPTORIUM.md)
