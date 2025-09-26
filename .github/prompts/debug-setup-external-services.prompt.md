---
title: "Debug Setup External Services"
description: "Initialize MCPGaia and SLMo42 services integration for Zeus debug validation protocol"
category: "debugging"
variables:
  - name: "ZEUS_PORT"
    description: "Zeus server port (default: 3012)"
    required: false
  - name: "MCPGAIA_PORT"
    description: "MCPGaia server port (default: 3003)"
    required: false
  - name: "SLMO42_PORT"
    description: "SLMo42 service port (default: 4001)"
    required: false
---

# Debug Setup External Services

Setup and validate external services integration for Zeus Debug & Validation Agent protocol.

## Service Architecture Overview

```
Zeus ({{ZEUS_PORT:3012}}) → SLMo42 ({{SLMO42_PORT:4001}}) → MCPGaia ({{MCPGAIA_PORT:3003}})
     ↑                        ↑                           ↑
   Web UI                 REST Proxy                 MCP Server
```

## Quick Setup Checklist

### 1. MCPGaia (MCP Server) - Port {{MCPGAIA_PORT:3003}}
**Service Type**: Model Context Protocol server with DevOps Manager architecture

**Expected Status Indicators**:
- ✅ `[INFO] DevOps: Manager architecture initialized`
- ✅ `[INFO] Plugin X+1 Control Plugin (xplus1-control) registered`
- ✅ `[INFO] Starting ProserpinaBot connection...`
- ✅ `[INFO] Plugin X+1 Control Plugin initialized successfully`

**Capabilities**:
- 20 tools (prompt/resource CRUD, system control, simulation)
- 7 resources (project status, npm scripts, game state, runtime stats)
- 3 prompts (start-system, open-web-console, simulator-control)

### 2. SLMo42 (Inference + MCP Proxy) - Port {{SLMO42_PORT:4001}}
**Service Type**: node-llama-cpp inference + REST proxy for MCPGaia

**Expected Status Indicators**:
- ✅ `💾 MCPUIRoutes: 1 preset(s) cargados desde disco`
- ✅ `🚀 AI Service Configuration: GPU Enabled: YES`
- ✅ `📋 MCPUIRoutes: UI routes registered (list/set/presets/preset/:name)`
- ✅ `✅ Conectado a servidor MCP en: http://localhost:{{MCPGAIA_PORT:3003}}`
- ✅ `✅ Registered server: localhost (20 tools)`

**Key Endpoints**:
- `GET /ai/ui/mcp/list` - Complete catalog (for Zeus integration)
- `GET /ai/ui/mcp/presets` - Saved presets list
- `POST /ai/ui/mcp/set` - Create/update presets
- `POST /ai` - Conversational inference with Oasis42 model

### 3. Zeus Server - Port {{ZEUS_PORT:3012}}
**Service Type**: Zeus MCP Mesh SDK Web Interface

**Configuration File**: `zeus/configs/zeus-config.json`
```json
{
  "server": { "port": {{ZEUS_PORT:3012}} },
  "mcp": {
    "servers": [{
      "devops-mcp-server": {
        "type": "http",
        "url": "http://localhost:{{MCPGAIA_PORT:3003}}"
      }
    }]
  },
  "ai": {
    "endpoint": "http://localhost:{{SLMO42_PORT:4001}}"
  }
}
```

## Validation Protocol

### Service Health Checks
1. **MCPGaia Health**: Verify 20 tools registered and ProserpinaBot connected
2. **SLMo42 Health**: Confirm GPU enabled and MCP server connection established  
3. **Zeus Health**: Test `/health` endpoint and config loading

### Integration Testing
1. **Catalog Access**: `curl http://localhost:{{SLMO42_PORT:4001}}/ai/ui/mcp/list`
2. **Zeus API**: `curl http://localhost:{{ZEUS_PORT:3012}}/api/health`
3. **MCP Proxy**: Verify Zeus can reach MCPGaia via SLMo42

### Mock Data Fallback
If external services unavailable, use:
- **Mock Catalog**: `zeus/test/mock_mcp_catalog.json`
- **Contains**: Complete catalog structure (20 tools, 7 resources, 3 prompts)
- **Usage**: Load in Zeus backend for offline testing

## Debug & Validation Agent Protocol

Once services are validated, proceed with:

1. **Launch Zeus**: `cd zeus && npm start` 
2. **Health Check**: Verify all endpoints respond correctly
3. **UI Tour**: Test all routes (`/`, `/ai`, `/presets`, `/editor`, `/settings`, `/stats`)
4. **Integration Test**: Validate MCP catalog integration
5. **Report Generation**: Create validation report in `zeus/PLANIFICACION/ITERATIONS/`

## Troubleshooting

### Common Issues
- **Port Conflicts**: Change ports in respective config files
- **Service Discovery**: Verify services start in correct order (MCPGaia → SLMo42 → Zeus)
- **GPU Issues**: Check SLMo42 GPU initialization logs
- **MCP Connection**: Verify MCPGaia is accessible from SLMo42

### Mock Data Switch
If live services fail:
1. Update Zeus backend to load `zeus/test/mock_mcp_catalog.json`
2. Disable external service calls in MCP handlers
3. Continue validation with offline data

## Expected Outcomes

- ✅ All three services running and healthy
- ✅ Service integration chain working (Zeus → SLMo42 → MCPGaia)
- ✅ MCP catalog accessible via REST proxy
- ✅ Mock data available as fallback
- ✅ Debug validation protocol ready to execute

## References

- **Chat Mode**: `.github/chatmodes/debug-validation-agent.chatmode.md`
- **Mock Data**: `zeus/test/mock_mcp_catalog.json`
- **Sprint Documentation**: `zeus/PLANIFICACION/VIBECODING/ITERATIONS/sprint_05_debug_setup.md`
- **Zeus Config**: `zeus/configs/zeus-config.json`