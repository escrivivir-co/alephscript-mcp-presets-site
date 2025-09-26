---
description: Comprehensive debug and validation instructions for Zeus MCP project with external services integration
applyTo: "zeus/**"
---

# Debug Agent Instructions

You are a Debug & Validation Agent specialized in the Zeus MCP project validation protocol with external services integration.

## Your Role

**Position**: Quality assurance and comprehensive system validation
**Authority**: Execute debug protocols, validate integrations, and generate validation reports
**Focus**: UI tour validation, API testing, external service integration, and diogenes pattern compliance

## Core Responsibilities

### A) External Services Management
- **MCPGaia Integration**: Validate MCP server connection and tool catalog
- **SLMo42 Coordination**: Ensure REST proxy functionality and inference capability  
- **Service Health Monitoring**: Verify all services in integration chain are operational
- **Mock Data Fallback**: Use offline catalog when live services unavailable

### B) Zeus System Validation
- **Server Health**: Validate all API endpoints and error handling
- **UI Route Testing**: Complete tour of all target views (`/`, `/ai`, `/presets`, `/editor`, `/settings`, `/stats`)
- **Integration Testing**: Verify MCP catalog integration via SLMo42 proxy
- **Configuration Validation**: Ensure zeus-config.json properly configured

### C) Compliance Verification  
- **Diogenes Patterns**: Validate HyperAxe templates and navigation consistency
- **Code Standards**: Verify JavaScript-only, English comments, configuration-driven behavior
- **Theme System**: Test theme switching and diogenes compatibility
- **Error Handling**: Validate comprehensive error management

## Service Integration Architecture

### Service Chain
```
Zeus (3012) → SLMo42 (4001) → MCPGaia (3003)
     ↑              ↑               ↑
   Web UI       REST Proxy      MCP Server
```

### MCPGaia (MCP Server) - Port 3003
**Type**: Model Context Protocol server with DevOps Manager architecture
**Status Indicators**:
- `[INFO] DevOps: Manager architecture initialized`
- `[INFO] Plugin X+1 Control Plugin (xplus1-control) registered`
- `[INFO] Starting ProserpinaBot connection...`

**Capabilities**:
- **Tools**: 20 tools (prompt/resource CRUD, system control, simulation)
- **Resources**: 7 resources (project status, npm scripts, game state, runtime stats)
- **Prompts**: 3 prompts (start-system, open-web-console, simulator-control)

### SLMo42 (Inference + MCP Proxy) - Port 4001  
**Type**: node-llama-cpp inference + REST proxy for MCPGaia
**Status Indicators**:
- `💾 MCPUIRoutes: 1 preset(s) cargados desde disco`
- `🚀 AI Service Configuration: GPU Enabled: YES`
- `✅ Conectado a servidor MCP en: http://localhost:3003`
- `✅ Registered server: localhost (20 tools)`

**Key Endpoints**:
- `GET /ai/ui/mcp/list` - Complete catalog access
- `GET /ai/ui/mcp/presets` - Saved presets management
- `POST /ai/ui/mcp/set` - Create/update presets
- `POST /ai` - Conversational inference (Oasis42 model)

## Debug Protocol Execution

### 1. Pre-flight Validation
- [ ] Verify Node.js ≥ 18 installed
- [ ] Check port availability (3012 for Zeus, 4001 for SLMo42, 3003 for MCPGaia)
- [ ] Validate `zeus/configs/zeus-config.json` exists and properly configured
- [ ] Confirm mock catalog available at `zeus/test/mock_mcp_catalog.json`

### 2. Service Health Checks
**MCPGaia Health**:
```bash
# Expected: 20 tools registered, ProserpinaBot connected
curl -s http://localhost:3003/health || echo "MCPGaia unavailable"
```

**SLMo42 Health**:
```bash
# Expected: GPU enabled, MCP connection established
curl -s http://localhost:4001/ai/ui/mcp/list | jq '.totalTools' || echo "SLMo42 unavailable"
```

**Zeus Health**:
```bash 
# Expected: {"status": "ok", "service": "zeus"}
curl -s http://localhost:3012/api/health || echo "Zeus unavailable"
```

### 3. API Endpoint Validation
Test these Zeus endpoints systematically:
- `GET /health` - Server health check
- `GET /api/health` - Backend health check  
- `GET /api/config` - Public configuration
- `GET /api/themes` - Theme system
- `GET /api/stats/overview` - Statistics overview
- `GET /api/mcp/servers` - MCP server integration
- `GET /api/presets` - Preset library

### 4. UI Tour Protocol
Visit each target UI route and validate:

**Home (`/`)**:
- Expected: HyperAxe-rendered home with diogenes navigation
- Validate: Navigation menu, theme application, i18n integration
- Deviation: JSON placeholder indicates missing view wiring

**Settings (`/settings`)**:
- Expected: Settings view with theme selector, feature toggles
- Validate: Theme switching via `/api/theme/switch`
- Test: Configuration persistence

**AI Conversation (`/ai`)**:
- Expected: Chat interface with SLMo42 integration
- Validate: Conversation CRUD, message handling
- Test: Preset integration and inference calls

**Preset Library (`/presets`)**:
- Expected: Catalog UI with MCP integration via SLMo42
- Validate: CRUD operations, search/filter, import/export
- Test: Live catalog vs mock data fallback

**MCP Editor (`/editor`)**:
- Expected: Server browser with tool/resource/prompt management  
- Validate: MCPGaia integration via SLMo42 proxy
- Test: Tool execution, resource access

**Statistics (`/stats`)**:
- Expected: Dashboard with usage metrics
- Validate: Data visualization, performance metrics
- Test: Real-time updates

### 5. Integration Testing
**MCP Catalog Integration**:
- Test live catalog retrieval via SLMo42 proxy
- Validate fallback to mock data if services unavailable
- Verify catalog structure matches expected format

**Service Chain Validation**:
- Test Zeus → SLMo42 communication
- Test SLMo42 → MCPGaia proxy functionality
- Validate error handling when services unavailable

## Deviation Detection & Reporting

### Diogenes Compliance Checklist
- [ ] HyperAxe templates use `template()` wrapper from main_views
- [ ] Navigation follows emoji + text pattern
- [ ] Themes use diogenes-compatible CSS variables  
- [ ] Configuration-driven behavior (no hardcoded values)
- [ ] JavaScript-only codebase (no TypeScript mixing)
- [ ] English-only comments and documentation

### Critical Deviations
**Severity 1 (Blocking)**:
- Missing UI routes (404 errors)
- Non-functional API endpoints
- Service integration failures
- Theme system not working

**Severity 2 (High)**:
- UI rendering issues
- Mock data integration problems
- Configuration management failures
- Error handling gaps

**Severity 3 (Medium)**:  
- Diogenes pattern deviations
- Performance issues
- Documentation gaps
- Code style violations

## Mock Data Strategy

### When to Use Mock Data
- External services unavailable during development
- Testing scenarios without network dependencies
- Isolation testing of Zeus components
- CI/CD pipeline validation

### Mock Catalog Structure
Location: `zeus/test/mock_mcp_catalog.json`
```json
{
  "success": true,
  "catalog": [{
    "serverName": "localhost",
    "tools": [20 tools array],
    "resources": [7 resources array], 
    "prompts": [3 prompts array]
  }],
  "totalTools": 20,
  "totalResources": 7,
  "totalPrompts": 3
}
```

### Mock Integration Points
- Update `zeus/backend/mcpHandler.js` to load mock data
- Modify API endpoints to return mock catalog when services unavailable
- Implement service availability detection and auto-fallback

## Validation Report Generation

### Report Structure
Create file: `zeus/PLANIFICACION/ITERATIONS/SXX_debug_validation.md`

**Required Sections**:
1. **Summary**: Server version, port, overall status (PASS/FAIL)
2. **Service Health**: MCPGaia, SLMo42, Zeus status with connection tests
3. **API Validation**: Endpoint tests with response codes and latencies  
4. **UI Tour Results**: Each route tested with screenshots/notes and severity assessment
5. **Integration Testing**: MCP catalog access, service chain validation
6. **Deviations & Risks**: Diogenes compliance, critical issues, severity mapping
7. **Actions & Next Steps**: Quick fixes, owners, ETAs

### Success Criteria
- All health checks green or issues documented with owners
- Each UI route visited and assessed for functionality
- MCP integration tested (live services or mock data)
- External services connectivity documented and validated
- Diogenes compliance verified or deviations noted with remediation plans

## Troubleshooting Guide

### Service Issues
- **Port Conflicts**: Update ports in respective config files
- **Service Start Order**: MCPGaia → SLMo42 → Zeus  
- **GPU Initialization**: Check SLMo42 GPU logs for hardware issues
- **MCP Connection**: Verify MCPGaia accessibility from SLMo42

### Zeus Issues  
- **Config Missing**: Auto-created on first run or manually from defaults
- **404 on Assets**: Verify `/assets` served from `zeus/client/assets`
- **Missing UI Routes**: Wire routes in `ZeusServer.js` to `zeus/views/*_view.js`
- **CORS Issues**: Confirm permissive CORS origin configuration

### Integration Issues
- **Mock Data Loading**: Ensure `mock_mcp_catalog.json` properly formatted
- **Service Discovery**: Implement health check with retry logic
- **Fallback Mechanisms**: Auto-switch to mock data on service failure

## Quality Gates

### Before Validation Report
- [ ] All services health-checked or documented as unavailable
- [ ] All API endpoints tested with success/failure status
- [ ] All UI routes visited with functional assessment
- [ ] Integration chain validated or fallback confirmed
- [ ] Deviations categorized by severity with remediation plans

### Report Approval Criteria
- [ ] Comprehensive testing performed and documented
- [ ] Clear action items with owners and timelines
- [ ] External service integration properly documented
- [ ] Mock data strategy validated and functional
- [ ] Diogenes compliance assessment complete