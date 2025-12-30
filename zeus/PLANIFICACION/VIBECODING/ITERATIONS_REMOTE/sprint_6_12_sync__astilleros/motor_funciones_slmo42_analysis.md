# Análisis: Motores de Funciones SLMo42 vs Vista AI Conversations

## Estado Actual de la Integración

### 🔌 Conexión Zeus → SLMo42
```
Zeus AI Conversations → `/api/ai/conversations/{id}/messages` → aiHandler.js → SLMo42 (4001)
```

**Configuración Actual:**
- **Endpoint**: `http://localhost:4001` (configurable en `zeus-config.json`)
- **Motor por defecto**: `node_llama_cpp_MCP_functions` (cuando se usa preset)
- **Sin preset**: Request básico sin flags de motor específico

### 📊 Motores Disponibles en SLMo42

| Motor | Uso Recomendado | Características | Parámetro Request |
|-------|----------------|-----------------|-------------------|
| **node_llama_cpp_functions** | Producción | Optimal performance, native optimization | `"node_llama_cpp_functions": true` |
| **llama_functions** | Desarrollo | Enhanced debugging, custom wrappers | `"llama_functions": true` |
| **llama_MCP_functions** | Híbrido | Manual MCP implementation | `"llama_MCP_functions": true` |
| **node_llama_cpp_MCP_functions** | MCP Nativo | Native node-llama-cpp MCP support | `"node_llama_cpp_MCP_functions": true` |

### 🎯 Implementación Actual en Zeus

**Frontend (`ai-chat.js`):**
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

**Backend (`aiHandler.js`):**
```javascript
if (presetName) {
  payload.node_llama_cpp_MCP_functions = true;  // HARDCODED!
  payload.presetName = presetName;
  payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url || "http://localhost:3003";
}
```

## 🚨 Problema Identificado

**Motor Hardcoded**: Zeus actualmente usa **siempre** `node_llama_cpp_MCP_functions` cuando hay un preset, sin opción de cambiar motor.

## 💡 Propuesta de Implementación: Selector de Motor

### Opción A: Selector Avanzado (Coste Alto)

**UI Addition en AI Conversations:**
```html
<div class="function-engine-selector">
  <label for="engine-selector">Function Engine:</label>
  <select id="engine-selector" class="form-control">
    <option value="auto">Auto (Default)</option>
    <option value="node_llama_cpp_functions">Production (Optimized)</option>
    <option value="llama_functions">Development (Debug)</option>
    <option value="llama_MCP_functions">MCP Manual</option>
    <option value="node_llama_cpp_MCP_functions">MCP Native</option>
  </select>
  <span class="help-text">Choose inference engine mode</span>
</div>
```

**Backend Modification:**
```javascript
// aiHandler.js - New engine selection logic
async sendMessageToSLMo42(message, options = {}) {
  const { conversationId, presetName, usePresetTools, engineType } = options;
  
  const payload = { input: message };
  
  // Engine selection logic
  const selectedEngine = engineType || this.getDefaultEngine(presetName);
  
  switch(selectedEngine) {
    case 'node_llama_cpp_functions':
      payload.node_llama_cpp_functions = true;
      payload.functionSets = ["fruits", "system"];
      break;
    case 'llama_functions':
      payload.llama_functions = true;
      payload.functionSets = ["fruits", "system"];
      break;
    case 'llama_MCP_functions':
      payload.llama_MCP_functions = true;
      payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url;
      break;
    case 'node_llama_cpp_MCP_functions':
    default:
      if (presetName) {
        payload.node_llama_cpp_MCP_functions = true;
        payload.presetName = presetName;
        payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url;
      }
  }
  
  // ... rest of implementation
}

getDefaultEngine(presetName) {
  if (presetName) {
    return 'node_llama_cpp_MCP_functions'; // MCP Native for presets
  }
  return 'node_llama_cpp_functions'; // Production for basic queries
}
```

**Configuración Addition (`zeus-config.json`):**
```json
{
  "ai": {
    "endpoint": "http://localhost:4001",
    "maxTokens": 2000,
    "temperature": 0.7,
    "defaultEngine": "auto",
    "engineSettings": {
      "production": "node_llama_cpp_functions",
      "development": "llama_functions",
      "mcpHybrid": "llama_MCP_functions",
      "mcpNative": "node_llama_cpp_MCP_functions"
    }
  }
}
```

### Opción B: Perfil de Usuario (Coste Medio)

**Settings Addition:**
```html
<!-- En Settings View -->
<div class="ai-engine-preferences">
  <h3>AI Engine Preferences</h3>
  <div class="form-group">
    <label>Default Function Engine:</label>
    <select name="defaultEngine">
      <option value="auto">Auto (Recommended)</option>
      <option value="production">Production Mode</option>
      <option value="development">Development Mode</option>
      <option value="mcp-native">MCP Native</option>
    </select>
  </div>
  <div class="form-group">
    <label>
      <input type="checkbox" name="showEngineSelector"> 
      Show engine selector in AI chat
    </label>
  </div>
</div>
```

### Opción C: Smart Auto-Detection (Coste Bajo)

**Implementation:**
```javascript
// Automatic engine selection based on context
getOptimalEngine(context) {
  const { hasPreset, isDebugMode, userPreference } = context;
  
  if (userPreference === 'development' || isDebugMode) {
    return 'llama_functions'; // Enhanced debugging
  }
  
  if (hasPreset) {
    return 'node_llama_cpp_MCP_functions'; // Native MCP for presets
  }
  
  return 'node_llama_cpp_functions'; // Production for simple queries
}
```

## 📊 Análisis Coste/Beneficio

### Opción A: Selector Avanzado
**Coste:** 🔴 Alto (3-4 días desarrollo)
- Frontend: Nuevo componente UI, validación, persistencia
- Backend: Lógica de selección compleja, configuración
- Testing: Todos los motores deben probarse

**Beneficio:** 🟢 Alto para desarrolladores avanzados
- Control total sobre motor de inferencia
- Debugging preciso según necesidades
- Flexibilidad máxima para testing

### Opción B: Perfil de Usuario  
**Coste:** 🟡 Medio (2 días desarrollo)
- Settings UI extensión
- Backend configuration handling
- User preference persistence

**Beneficio:** 🟡 Medio para usuarios técnicos
- Configuración una vez, uso automático
- No complica UI principal
- Balance entre control y simplicidad

### Opción C: Smart Auto-Detection
**Coste:** 🟢 Bajo (4-6 horas desarrollo)
- Solo backend logic modification
- No UI changes required
- Minimal configuration changes

**Beneficio:** 🟢 Alto para todos los usuarios
- Funciona automáticamente
- No requiere conocimiento técnico
- Mejora la experiencia sin complejidad

## 🎯 Recomendación

### Implementación Recomendada: **Opción C + B Híbrida**

**Fase 1 (Implementación inmediata):**
- Smart auto-detection con lógica inteligente
- Configuración en `zeus-config.json` para override
- Zero UI impact, máximo beneficio

**Fase 2 (Feature enhancement):**
- Agregar en Settings un selector simple:
  - "Auto (Recommended)"
  - "Development Mode" 
  - "Production Mode"

### Implementación Inmediata Propuesta

**Modificación en `aiHandler.js`:**
```javascript
async sendMessageToSLMo42(message, options = {}) {
  const { conversationId, presetName, usePresetTools } = options;
  
  const payload = { input: message };
  
  // Smart engine selection
  const engineType = this.selectOptimalEngine({
    hasPreset: !!presetName,
    isDebugMode: this.config.debug || false,
    userPreference: this.config.ai?.enginePreference || 'auto'
  });
  
  await this.applyEngineConfiguration(payload, engineType, presetName);
  
  // ... rest of existing implementation
}

selectOptimalEngine(context) {
  const { hasPreset, isDebugMode, userPreference } = context;
  
  // User override
  if (userPreference !== 'auto') {
    return userPreference;
  }
  
  // Smart selection
  if (isDebugMode) {
    return 'llama_functions'; // Enhanced debugging
  }
  
  if (hasPreset) {
    return 'node_llama_cpp_MCP_functions'; // Native MCP for presets
  }
  
  return 'node_llama_cpp_functions'; // Production for basic queries
}

async applyEngineConfiguration(payload, engineType, presetName) {
  switch(engineType) {
    case 'llama_functions':
      payload.llama_functions = true;
      payload.functionSets = ["fruits", "system"];
      break;
      
    case 'node_llama_cpp_MCP_functions':
      payload.node_llama_cpp_MCP_functions = true;
      if (presetName) {
        payload.presetName = presetName;
      }
      payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url || "http://localhost:3003";
      break;
      
    case 'llama_MCP_functions':
      payload.llama_MCP_functions = true;
      payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url || "http://localhost:3003";
      break;
      
    case 'node_llama_cpp_functions':
    default:
      payload.node_llama_cpp_functions = true;
      payload.functionSets = ["fruits", "system"];
      break;
  }
}
```

## 🔍 Conclusiones

1. **Problema Actual**: Motor hardcoded limita flexibilidad
2. **Solución Óptima**: Smart auto-detection + configuración opcional
3. **Coste Mínimo**: 4-6 horas para implementación básica inteligente
4. **Beneficio Máximo**: Mejor rendimiento automático sin complejidad UI
5. **Escalabilidad**: Base sólida para features avanzadas futuras

**Next Steps:**
- Implementar smart auto-detection inmediatamente
- Agregar configuración `enginePreference` en config
- Testing con diferentes escenarios (preset/no-preset, debug/production)
- Documentar comportamiento para usuarios