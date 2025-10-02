# Implementación: Selector de Motor de Funciones - Opción Estática

## 🎯 Modificaciones Requeridas (Coste Mínimo)

### 1. Configuración Zeus (zeus-config.json)
```json
{
  "ai": {
    "endpoint": "http://localhost:4001",
    "maxTokens": 2000,
    "temperature": 0.7,
    "engines": {
      "node_llama_cpp_functions": {
        "name": "Production",
        "emoji": "⚡",
        "description": "High performance, optimized for production",
        "cost": "Low",
        "speed": "High",
        "type": "standard"
      },
      "llama_functions": {
        "name": "Development", 
        "emoji": "🔍",
        "description": "Enhanced debugging with detailed logging",
        "cost": "Medium",
        "speed": "Medium", 
        "type": "development"
      },
      "node_llama_cpp_MCP_functions": {
        "name": "MCP Native",
        "emoji": "📡",
        "description": "Native MCP support with preset integration",
        "cost": "Medium",
        "speed": "High",
        "type": "mcp"
      },
      "llama_MCP_functions": {
        "name": "MCP Hybrid",
        "emoji": "🔀", 
        "description": "Manual MCP implementation with custom logic",
        "cost": "High",
        "speed": "Medium",
        "type": "mcp_advanced"
      }
    },
    "defaultEngine": "auto",
    "autoSelection": {
      "withPreset": "node_llama_cpp_MCP_functions",
      "withoutPreset": "node_llama_cpp_functions",
      "debugMode": "llama_functions"
    }
  }
}
```

### 2. Frontend - AI Chat HTML Addition
```html
<!-- En views/ai.js, dentro del template de AI Conversations -->
<div class="engine-selector-container">
  <div class="form-group">
    <label for="engine-selector" class="form-label">
      🚀 Function Engine:
    </label>
    <select id="engine-selector" class="form-control">
      <option value="auto">Auto (Smart Selection)</option>
    </select>
    <div class="engine-info" id="engine-info">
      <small class="text-muted">Automatically selects optimal engine based on context</small>
    </div>
  </div>
</div>
```

### 3. Frontend - JavaScript Update (ai-chat.js)
```javascript
class AIChat {
  constructor() {
    // ... existing properties ...
    this.engines = null;
    this.selectedEngine = 'auto';
  }

  async init() {
    // ... existing init code ...
    await this.loadEngineConfig();
    this.setupEngineSelector();
  }

  async loadEngineConfig() {
    try {
      // Load from Zeus config (could be made dynamic later)
      const response = await fetch('/api/config/engines');
      const data = await response.json();
      if (data.success) {
        this.engines = data.engines;
        this.autoSelection = data.autoSelection;
      }
    } catch (error) {
      console.warn('Could not load engine config, using defaults');
      // Fallback static configuration
      this.engines = {
        "node_llama_cpp_functions": {
          "name": "Production",
          "emoji": "⚡",
          "description": "High performance, optimized"
        },
        "llama_functions": {
          "name": "Development",
          "emoji": "🔍", 
          "description": "Enhanced debugging"
        },
        "node_llama_cpp_MCP_functions": {
          "name": "MCP Native",
          "emoji": "📡",
          "description": "Native MCP + presets"
        },
        "llama_MCP_functions": {
          "name": "MCP Hybrid",
          "emoji": "🔀",
          "description": "Manual MCP implementation"
        }
      };
      this.autoSelection = {
        "withPreset": "node_llama_cpp_MCP_functions",
        "withoutPreset": "node_llama_cpp_functions"
      };
    }
  }

  setupEngineSelector() {
    const selector = document.getElementById('engine-selector');
    if (!selector || !this.engines) return;

    // Clear and populate options
    selector.innerHTML = '<option value="auto">Auto (Smart Selection)</option>';
    
    Object.entries(this.engines).forEach(([id, engine]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${engine.emoji} ${engine.name}`;
      option.title = engine.description;
      selector.appendChild(option);
    });

    // Bind events
    selector.addEventListener('change', (e) => {
      this.handleEngineSelection(e.target.value);
    });

    // Set initial selection
    this.handleEngineSelection('auto');
  }

  handleEngineSelection(engineType) {
    this.selectedEngine = engineType;
    const infoDiv = document.getElementById('engine-info');
    if (!infoDiv) return;

    let infoText = '';
    if (engineType === 'auto') {
      infoText = 'Automatically selects optimal engine based on context (presets, debug mode)';
    } else {
      const engine = this.engines[engineType];
      if (engine) {
        infoText = `${engine.description} - Cost: ${engine.cost || 'Unknown'}, Speed: ${engine.speed || 'Unknown'}`;
      }
    }
    
    infoDiv.innerHTML = `<small class="text-muted">${infoText}</small>`;
  }

  async sendMessage() {
    // ... existing message preparation code ...

    // Build request payload
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
    if (this.selectedEngine && this.selectedEngine !== 'auto') {
      payload.engineType = this.selectedEngine;
      console.log(`🎯 User selected engine: ${this.selectedEngine}`);
    } else {
      console.log('🎯 Using auto engine selection');
    }

    // ... rest of send logic remains the same ...
  }

  // Helper method to show current engine selection in status
  showEngineStatus(engineUsed) {
    const statusDiv = document.querySelector('.ai-processing-status');
    if (statusDiv && engineUsed) {
      const engine = this.engines[engineUsed];
      if (engine) {
        const engineSpan = statusDiv.querySelector('.engine-indicator') || document.createElement('span');
        engineSpan.className = 'engine-indicator';
        engineSpan.innerHTML = `<small style="opacity: 0.7;">Engine: ${engine.emoji} ${engine.name}</small>`;
        statusDiv.appendChild(engineSpan);
      }
    }
  }
}
```

### 4. Backend - Config Endpoint (server/routes/config.js)
```javascript
const express = require('express');
const router = express.Router();
const { getConfig } = require('../../configs/config-manager');

// GET /api/config/engines - Return available engines configuration
router.get('/engines', (req, res) => {
  try {
    const config = getConfig();
    const engineConfig = config.ai?.engines || {};
    const autoSelection = config.ai?.autoSelection || {};
    
    res.json({
      success: true,
      engines: engineConfig,
      autoSelection: autoSelection,
      defaultEngine: config.ai?.defaultEngine || 'auto'
    });
  } catch (error) {
    console.error('Error fetching engine config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load engine configuration'
    });
  }
});

module.exports = router;
```

### 5. Backend - AI Handler Update (aiHandler.js)
```javascript
class AIHandler {
  
  async sendMessageToSLMo42(message, options = {}) {
    const { conversationId, presetName, usePresetTools, engineType } = options;
    
    const payload = { input: message };
    
    // Smart engine selection with user override
    const context = {
      hasPreset: !!presetName,
      isDebugMode: process.env.NODE_ENV === 'development',
      userPreference: engineType // This comes from frontend now
    };
    
    const selectedEngine = this.selectOptimalEngine(context);
    console.log(`🎯 Selected engine: ${selectedEngine} (user: ${engineType || 'auto'}, preset: ${!!presetName})`);
    
    await this.applyEngineConfiguration(payload, selectedEngine, presetName);
    
    // ... rest of SLMo42 communication ...
    
    // Return metadata including engine used for frontend display
    return {
      // ... existing response ...
      metadata: {
        engineUsed: selectedEngine,
        hasPreset: !!presetName,
        // ... other metadata
      }
    };
  }

  /**
   * Enhanced engine selection with user preference support
   */
  selectOptimalEngine(context) {
    const { hasPreset, isDebugMode, userPreference } = context;
    
    // User override takes precedence (except 'auto')
    if (userPreference && userPreference !== 'auto') {
      console.log(`🎯 Engine selection: User preference '${userPreference}'`);
      return userPreference;
    }
    
    // Auto selection logic (existing logic enhanced)
    if (isDebugMode) {
      console.log('🎯 Engine selection: Debug mode → llama_functions');
      return 'llama_functions';
    }
    
    if (hasPreset) {
      console.log('🎯 Engine selection: Has preset → node_llama_cpp_MCP_functions'); 
      return 'node_llama_cpp_MCP_functions';
    }
    
    console.log('🎯 Engine selection: Default → node_llama_cpp_functions');
    return 'node_llama_cpp_functions';
  }

  // Existing applyEngineConfiguration method remains the same
}
```

### 6. CSS Styling (client/assets/styles/ai-chat.css)
```css
.engine-selector-container {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.engine-selector-container .form-group {
  margin-bottom: 0.5rem;
}

.engine-selector-container .form-label {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

#engine-selector {
  font-size: 0.9rem;
  padding: 0.5rem;
}

.engine-info {
  margin-top: 0.5rem;
}

.engine-indicator {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .engine-selector-container {
    padding: 0.5rem;
    margin-bottom: 0.75rem;
  }
}
```

## 🎯 Ventajas de Esta Implementación

### ✅ Ventajas Técnicas:
- **Bajo costo de desarrollo** (2-3 horas)
- **Mínimo riesgo** (no modifica lógica crítica)
- **Fácil testing** (configuración estática)
- **Backward compatible** (auto = comportamiento actual)

### ✅ Ventajas UX:
- **Selector intuitivo** con emojis y descripciones
- **Información contextual** en tiempo real
- **Comportamiento por defecto** familiar (auto)
- **Feedback visual** del motor usado

### ✅ Ventajas Arquitecturales:
- **Preparación para futuro** (fácil migrar a dinámico)
- **Separación clara** de responsabilidades
- **Configuración centralizada** en zeus-config.json
- **Extensible** (agregar nuevos motores fácilmente)

## 🚀 Proceso de Testing

### 1. Configuración Base
```bash
# 1. Agregar engines config a zeus-config.json
# 2. Reiniciar Zeus server
cd zeus && npm start
```

### 2. Testing Manual
```javascript
// 1. Probar selector "Auto" (comportamiento actual)
// 2. Probar cada motor específico
// 3. Verificar logs en backend (engine selection)
// 4. Verificar respuesta incluye metadata.engineUsed
```

### 3. Validación SLMo42
```bash
# Verificar que cada flag llega correctamente
curl -X POST http://localhost:4001/ai \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "llama_functions": true}'
```

## 📊 Estimación de Trabajo

| Componente | Tiempo | Prioridad |
|------------|--------|-----------|
| Config JSON | 15 min | Alta |
| Frontend UI | 45 min | Alta |  
| Frontend JS | 60 min | Alta |
| Backend Config Route | 30 min | Media |
| Backend AI Handler | 45 min | Alta |
| CSS Styling | 30 min | Baja |
| Testing | 60 min | Alta |

**Total Estimado: 4.5 horas** (incluyendo testing completo)

Esta implementación proporciona funcionalidad completa de selección de motor con el menor coste posible, manteniendo la flexibilidad para evolucionar hacia opciones más dinámicas en el futuro.