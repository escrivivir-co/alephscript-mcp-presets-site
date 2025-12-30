# 🎯 Demo Checkpoints — MCPGallery × Aleph Scriptorium

> **Version**: 1.0  
> **Date**: 2025-12-30  
> **Status**: 📋 READY FOR VALIDATION  
> **Owner**: Zeus Architect + Scriptorium Team

---

## Purpose

This document defines **5 end-to-end demo scenarios** that validate the complete integration between MCPGallery and Aleph Scriptorium. Each checkpoint should be executable by the Scriptorium team to verify the integration works as expected.

---

## Prerequisites

### MCPGallery Services
```bash
# From MCPGallery root
cd MCPGallery

# Terminal 1: MCP Mesh (DevOps Server)
npm run start:mesh
# Expected: ✅ DevOps MCP Server ready on port 3003

# Terminal 2: Preset Service
npm run start:model
# Expected: ✅ MCP Preset Service running on port 4001

# Terminal 3: Zeus UI
npm run start:zeus
# Expected: ✅ Zeus server running on http://localhost:3012
```

### Health Validation
```bash
curl http://localhost:3003/health  # mesh
curl http://localhost:4001/health  # presets
curl http://localhost:3012/health  # zeus
```

---

## Checkpoint A: MCP Server Configuration for VS Code Copilot

**Goal**: Scriptorium can activate and configure MCP servers from the mesh for use in VS Code GitHub Copilot Chat.

### Steps

1. **Locate mcp.json configuration**
   ```bash
   # In ALEPH workspace
   cat .vscode/mcp.json
   ```

2. **Add DevOps MCP Server**
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

3. **Reload VS Code window** (Cmd+Shift+P → "Reload Window")

4. **Verify in Copilot Chat**
   - Open Copilot Chat panel
   - Type: `@devops-mcp-server /tools`
   - Expected: List of available DevOps tools

### Validation Criteria
- [ ] mcp.json contains devops-mcp-server entry
- [ ] VS Code recognizes the MCP server
- [ ] Copilot Chat can invoke tools from the server

### Status
- [ ] **PASS** / **FAIL** / **BLOCKED**
- Notes: _________________

---

## Checkpoint B: MCP Mesh Servers Public Tools

**Goal**: Common servers in the mesh are available and publish their tools, resources, and prompts.

### Steps

1. **Query catalog from Preset Service**
   ```bash
   curl http://localhost:4001/ai/ui/mcp/list | jq
   ```

2. **Expected response structure**
   ```json
   {
     "success": true,
     "catalog": [{
       "serverName": "devops-mcp-server",
       "serverUrl": "http://localhost:3003",
       "tools": [...],
       "resources": [...],
       "prompts": [...]
     }],
     "totalTools": 20,
     "totalResources": 7,
     "totalPrompts": 3
   }
   ```

3. **Verify key tools exist**
   - `git_status` — Git operations
   - `npm_run` — NPM script execution
   - `file_read` — File system access

### Validation Criteria
- [ ] Catalog returns non-empty tools array
- [ ] At least 10 tools available
- [ ] Resources and prompts are present

### Status
- [ ] **PASS** / **FAIL** / **BLOCKED**
- Notes: _________________

---

## Checkpoint C: Model Catalog Scanning

**Goal**: Scriptorium can start the Preset Service to scan available servers and prepare the catalog.

### Steps

1. **Start Preset Service with logging**
   ```bash
   cd mcp-model-sdk
   npm start 2>&1 | tee catalog_scan.log
   ```

2. **Expected startup logs**
   ```
   ✅ Preset Service starting...
   📡 Scanning MCP servers from mcp_servers.json...
   🔍 Connecting to devops-mcp-server at http://localhost:3003...
   ✅ Found 20 tools, 7 resources, 3 prompts
   ✅ Catalog ready. Listening on port 4001
   ```

3. **Add additional server to scan**
   ```bash
   # Edit PRESETS/mcp_servers.json
   {
     "servers": {
       "devops-mcp-server": {
         "type": "http",
         "url": "http://localhost:3003"
       },
       "state-machine-server": {
         "type": "http",
         "url": "http://localhost:3004"
       }
     }
   }
   ```

4. **Restart and verify expanded catalog**

### Validation Criteria
- [ ] Preset Service starts without errors
- [ ] Logs show successful server scanning
- [ ] Multiple servers can be configured

### Status
- [ ] **PASS** / **FAIL** / **BLOCKED**
- Notes: _________________

---

## Checkpoint D: Zeus UI Demo Pack Creation

**Goal**: Start Zeus, receive catalog, and create "Aleph Scriptorium Demo Pack" with tools from DevOps and StateMachine servers.

### Steps

1. **Open Zeus UI**
   ```bash
   open http://localhost:3012
   ```

2. **Navigate to Editor view** (`/editor`)
   - Verify catalog is displayed
   - See list of servers and their tools

3. **Navigate to Presets view** (`/presets`)
   - Click "Create New Preset"
   - Fill form:
     - **Name**: `Aleph Scriptorium Demo Pack`
     - **Description**: `Demo preset with DevOps and StateMachine tools`
     - **Category**: `Development`

4. **Select tools for preset**
   - From DevOps: `git_status`, `git_commit`, `npm_run`
   - From StateMachine: `state_get`, `state_transition`

5. **Select resources**
   - `project://status` — Current project status
   - `runtime://stats` — Runtime statistics

6. **Select prompts**
   - `start-system` — System initialization prompt

7. **Save preset**
   - Click "Save Preset"
   - Verify success notification

8. **Validate persistence**
   ```bash
   cat mcp-model-sdk/PRESETS/mcp_presets.json | jq '.presets[] | select(.name=="Aleph Scriptorium Demo Pack")'
   ```

### Validation Criteria
- [ ] Zeus displays catalog from Preset Service
- [ ] Preset creation form works
- [ ] Preset saved to mcp_presets.json
- [ ] Preset contains selected tools/resources/prompts

### Status
- [ ] **PASS** / **FAIL** / **BLOCKED**
- Notes: _________________

---

## Checkpoint E: TypedPrompts Plugin Integration

**Goal**: Aleph Scriptorium's TypedPrompts plugin can consume a Zeus preset for its prompt editor.

### Steps

1. **Export preset for plugin consumption**
   ```bash
   curl http://localhost:3012/api/presets/Aleph%20Scriptorium%20Demo%20Pack | jq
   ```

2. **Expected response**
   ```json
   {
     "name": "Aleph Scriptorium Demo Pack",
     "description": "Demo preset with DevOps and StateMachine tools",
     "tools": [
       { "name": "git_status", "server": "devops-mcp-server" },
       { "name": "git_commit", "server": "devops-mcp-server" },
       { "name": "npm_run", "server": "devops-mcp-server" },
       { "name": "state_get", "server": "state-machine-server" },
       { "name": "state_transition", "server": "state-machine-server" }
     ],
     "resources": [...],
     "prompts": [...]
   }
   ```

3. **Plugin integration points**
   - **Endpoint**: `GET /api/presets/:name`
   - **Format**: JSON with tools, resources, prompts arrays
   - **Usage**: TypedPrompts can list available tools for prompt editor

4. **TypedPrompts consumption example**
   ```javascript
   // In TypedPrompts plugin
   const preset = await fetch('http://localhost:3012/api/presets/Aleph%20Scriptorium%20Demo%20Pack');
   const data = await preset.json();
   
   // Available tools for prompt templates
   const tools = data.tools.map(t => t.name);
   // ['git_status', 'git_commit', 'npm_run', 'state_get', 'state_transition']
   ```

### Validation Criteria
- [ ] Preset endpoint returns expected JSON structure
- [ ] Tools array contains correct tool names
- [ ] Plugin can fetch and parse preset data

### Status
- [ ] **PASS** / **FAIL** / **BLOCKED**
- Notes: _________________

---

## Summary Scorecard

| Checkpoint | Description | Status | Blocker |
|------------|-------------|--------|---------|
| **A** | MCP Server Configuration | ⬜ | - |
| **B** | Public Tools Available | ⬜ | - |
| **C** | Catalog Scanning | ⬜ | - |
| **D** | Demo Pack Creation | ⬜ | - |
| **E** | TypedPrompts Integration | ⬜ | - |

### Overall Status
- **Ready for Demo**: ⬜ YES / ⬜ NO
- **Blocking Issues**: _________________
- **Next Actions**: _________________

---

## Scriptorium Team Feedback

*(To be filled by Scriptorium team after demo execution)*

### What worked well?
- 

### What needs improvement?
- 

### Questions for Zeus team?
- 

### Priority adjustments?
- 

---

**Document Owner**: Zeus Architect  
**Scriptorium Contact**: _________________  
**Next Review**: After demo execution
