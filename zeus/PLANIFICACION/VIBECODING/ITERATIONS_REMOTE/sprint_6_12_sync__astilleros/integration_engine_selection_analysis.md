# Análisis: Integración de Selección de Motor de Funciones SLMo42 con Vista AI Conversations

## 🔍 Estado Actual de la Integración

### 📊 Flujo Actual: Zeus → SLMo42
```
Frontend (ai-chat.js) → Backend (aiHandler.js) → SLMo42 (4001/ai)
     ↓                        ↓                       ↓
presetName + usePresetTools → Engine Selection → Function Handler Flags
```

### 🎯 Parámetros Actuales Enviados
**Frontend → Backend:**
```javascript
const payload = {
  message: message,
  role: 'user'
};

if (selectedPreset && selectedPreset !== '') {
  payload.presetName = selectedPreset;
  payload.usePresetTools = true;
}
```

**Backend → SLMo42:**
```javascript
// Hardcoded currently:
if (presetName) {
  payload.node_llama_cpp_MCP_functions = true;  // FIXED CHOICE
  payload.presetName = presetName;
  payload.mcpServerUrl = "http://localhost:3003";
}
```

## 💡 Análisis de Opciones para Incluir Selección de Motor

### Opción 1: A través del Catálogo MCP (Información del Server)
**Endpoint Current:** `GET /ai/ui/mcp/list` 

**Ventajas:**
- ✅ Ya existe endpoint de catálogo
- ✅ Información centralizada en SLMo42
- ✅ Puede incluir capacidades y motores disponibles

**Implementación:**
```json
{
  "success": true,
  "catalog": [{
    "serverName": "localhost",
    "serverInfo": {
      "name": "mcp-server",
      "version": "unknown",
      "url": "http://localhost:3003",
      "availableEngines": [
        {
          "name": "node_llama_cpp_functions",
          "type": "production",
          "description": "Optimized performance, native optimization",
          "features": ["high_performance", "stable"],
          "recommended": true
        },
        {
          "name": "llama_functions", 
          "type": "development",
          "description": "Enhanced debugging, custom wrappers",
          "features": ["debug_mode", "enhanced_logging"]
        },
        {
          "name": "llama_MCP_functions",
          "type": "hybrid",
          "description": "Manual MCP implementation",
          "features": ["mcp_manual", "custom_logic"]
        },
        {
          "name": "node_llama_cpp_MCP_functions",
          "type": "mcp_native", 
          "description": "Native node-llama-cpp MCP support",
          "features": ["mcp_native", "preset_support"]
        }
      ]
    },
    "tools": [...],
    "resources": [...],
    "prompts": [...]
  }]
}
```

### Opción 2: A través de Endpoint Específico de Motores
**Nuevo Endpoint:** `GET /ai/engines` o `GET /ai/ui/engines`

**Ventajas:**
- ✅ Separación clara de responsabilidades
- ✅ Información específica sin saturar catálogo MCP
- ✅ Fácil caching y actualización independiente

**Implementación:**
```json
{
  "success": true,
  "engines": [
    {
      "id": "node_llama_cpp_functions",
      "name": "Production Engine",
      "type": "production",
      "description": "Optimized for high-performance production workloads",
      "cost": "low",
      "speed": "high",
      "debugging": "basic",
      "mcpSupport": false,
      "recommended": "general"
    },
    {
      "id": "llama_functions",
      "name": "Development Engine", 
      "type": "development",
      "description": "Enhanced debugging with custom chat wrappers",
      "cost": "medium",
      "speed": "medium",
      "debugging": "enhanced", 
      "mcpSupport": false,
      "recommended": "debugging"
    },
    {
      "id": "node_llama_cpp_MCP_functions",
      "name": "MCP Native Engine",
      "type": "mcp_native",
      "description": "Native MCP support with preset integration", 
      "cost": "medium",
      "speed": "high",
      "debugging": "basic",
      "mcpSupport": true,
      "recommended": "presets"
    },
    {
      "id": "llama_MCP_functions",
      "name": "MCP Hybrid Engine",
      "type": "mcp_hybrid",
      "description": "Manual MCP implementation with custom logic",
      "cost": "high",
      "speed": "medium", 
      "debugging": "enhanced",
      "mcpSupport": true,
      "recommended": "custom_mcp"
    }
  ],
  "defaultEngine": "node_llama_cpp_functions",
  "autoSelection": {
    "withPreset": "node_llama_cpp_MCP_functions",
    "withoutPreset": "node_llama_cpp_functions",
    "debugMode": "llama_functions"
  }
}
```

### Opción 3: Configuración Zeus Estática (Menor Costo)
**Implementación en zeus-config.json:**
```json
{
  "ai": {
    "endpoint": "http://localhost:4001",
    "engines": {
      "node_llama_cpp_functions": {
        "name": "Production",
        "description": "High performance, optimized",
        "cost": "⚡ Fast",
        "type": "standard"
      },
      "llama_functions": {
        "name": "Development", 
        "description": "Enhanced debugging",
        "cost": "🔍 Debug",
        "type": "development"
      },
      "node_llama_cpp_MCP_functions": {
        "name": "MCP Native",
        "description": "Native MCP + presets",
        "cost": "📡 MCP",
        "type": "mcp"
      },
      "llama_MCP_functions": {
        "name": "MCP Hybrid",
        "description": "Manual MCP implementation", 
        "cost": "🔀 Custom",
        "type": "mcp_advanced"
      }
    },
    "defaultEngine": "auto",
    "autoSelection": {
      "withPreset": "node_llama_cpp_MCP_functions",
      "withoutPreset": "node_llama_cpp_functions"
    }
  }
}
```

## 🛠️ Implementación UI: Selector de Motor

### Design Pattern: Minimal Impact
```html
<!-- AI Conversations View Addition -->
<div class="engine-selector-container" style="margin-bottom: 1rem;">
  <div class="form-group compact">
    <label for="engine-selector" class="form-label small">
      🚀 Engine:
    </label>
    <select id="engine-selector" class="form-control compact">
      <option value="auto">Auto (Smart)</option>
      <option value="node_llama_cpp_functions">⚡ Production</option>
      <option value="llama_functions">🔍 Development</option>
      <option value="node_llama_cpp_MCP_functions">📡 MCP Native</option>
      <option value="llama_MCP_functions">🔀 MCP Hybrid</option>
    </select>
  </div>
  <div class="engine-info" id="engine-info">
    <small class="text-muted">Auto-selects optimal engine based on context</small>
  </div>
</div>
```

### JavaScript Integration Pattern
```javascript
// ai-chat.js modifications
class AIChat {
  
  async loadEngineInfo() {
    try {
      // Option 1: From MCP catalog
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      if (data.success && data.servers[0]?.availableEngines) {
        this.engines = data.servers[0].availableEngines;
      }
      
      // Option 2: From specific endpoint
      // const response = await fetch('/api/ai/engines');
      
      // Option 3: From static config
      // this.engines = config.ai.engines;
      
      this.populateEngineSelector();
    } catch (error) {
      console.warn('Could not load engine info, using defaults');
    }
  }
  
  populateEngineSelector() {
    const selector = document.getElementById('engine-selector');
    if (!selector || !this.engines) return;
    
    // Clear existing options except "auto"
    selector.innerHTML = '<option value="auto">Auto (Smart)</option>';
    
    this.engines.forEach(engine => {
      const option = document.createElement('option');
      option.value = engine.id || engine.name;
      option.textContent = `${engine.emoji || ''} ${engine.name}`;
      option.title = engine.description;
      selector.appendChild(option);
    });
    
    // Bind change event
    selector.addEventListener('change', (e) => {
      this.handleEngineSelection(e.target.value);
    });
  }
  
  handleEngineSelection(engineType) {
    const infoDiv = document.getElementById('engine-info');
    if (!infoDiv) return;
    
    if (engineType === 'auto') {
      infoDiv.innerHTML = '<small class="text-muted">Auto-selects optimal engine based on context</small>';
    } else {
      const engine = this.engines.find(e => e.id === engineType);
      if (engine) {
        infoDiv.innerHTML = `<small class="text-muted">${engine.description}</small>`;
      }
    }
  }
  
  async sendMessage() {
    // ... existing code ...
    
    // Get engine selection
    const engineSelector = document.getElementById('engine-selector');
    const selectedEngine = engineSelector?.value || 'auto';
    
    // Build payload with engine selection
    const payload = {
      message: message,
      role: 'user'
    };
    
    // Add MCP preset parameters
    if (selectedPreset && selectedPreset !== '') {
      payload.presetName = selectedPreset;
      payload.usePresetTools = true;
    }
    
    // Add engine selection (only if not auto)
    if (selectedEngine && selectedEngine !== 'auto') {
      payload.engineType = selectedEngine;
    }
    
    // ... rest of send logic ...
  }
}
```

### Backend Handler Update
```javascript
// aiHandler.js modifications
async sendMessageToSLMo42(message, options = {}) {
  const { conversationId, presetName, usePresetTools, engineType } = options;
  
  const payload = { input: message };
  
  // Smart engine selection with user override
  const context = {
    hasPreset: !!presetName,
    isDebugMode: process.env.NODE_ENV === 'development',
    userPreference: engineType
  };
  
  const selectedEngine = this.selectOptimalEngine(context);
  await this.applyEngineConfiguration(payload, selectedEngine, presetName);
  
  // ... rest of SLMo42 communication ...
}
```

## 📊 Comparación de Costes

| Opción | Desarrollo | Mantenimiento | Flexibilidad | UX Impact |
|--------|------------|---------------|--------------|-----------|
| **Catálogo MCP** | Alto | Medio | Alto | Bajo |
| **Endpoint Específico** | Medio | Bajo | Alto | Bajo |
| **Config Estática** | Bajo | Medio | Medio | Muy Bajo |

## 🎯 Recomendación

### Implementación Escalonada Recomendada:

**Fase 1: Config Estática (Inmediato)**
- ✅ Rápida implementación
- ✅ Bajo riesgo
- ✅ Funcionalidad completa

**Fase 2: Endpoint Específico (Post-Sprint)**
- ✅ Mayor flexibilidad
- ✅ Información dinámica
- ✅ Preparación para futuras funcionalidades

**Fase 3: Integración Completa (Futuro)**
- ✅ Catálogo unificado
- ✅ Auto-discovery de capacidades
- ✅ Experiencia de usuario óptima

### Próximos Pasos:
1. 🎯 Implementar Opción 3 (Config estática) para este sprint
2. 🚀 Agregar selector UI minimalista 
3. 🔧 Modificar ai-chat.js para enviar `engineType`
4. ⚙️ Actualizar aiHandler.js para usar selección
5. 🧪 Testing con diferentes motores

### Consideraciones de UX:
- **Selector por defecto**: "Auto" (comportamiento actual)
- **Información contextual**: Tooltip/descripción por motor
- **Feedback visual**: Indicador del motor activo
- **Configuración persistente**: Recordar selección del usuario