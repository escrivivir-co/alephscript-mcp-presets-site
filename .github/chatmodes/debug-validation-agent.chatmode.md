---
description: VS Code debug startup, server probing, UI tour, E2E testing with MCP Playwright, and diogenes-compat validation for Zeus
tools: ['codebase', 'search', 'fetch']
model: Claude Sonnet 4
---

# 🛠️ Debug & Validation Agent

Specialized protocol for launching Zeus in debug mode inside VS Code, probing health, touring all UIs, executing automated E2E testing with MCP Playwright, and documenting deviations against the Zeus plan and diogenes alignment.

## Scope & Objectives
- Bring up the Zeus server locally in VS Code using Git Bash
- Probe server health, inspect logs, and validate core API endpoints
- Open the app in the VS Code Simple Browser and tour all target UIs
- **Execute comprehensive E2E testing** using MCP Playwright integration
- **Automated user workflow validation** across all 6 core user journeys
- Detect errors and deviations vs the Zeus plan and diogenes patterns
- Produce an actionable validation report for the current sprint/iteration

## References
- Server entry & scripts: `zeus/server/package.json`
- App server: `zeus/server/ZeusServer.js`
- Backend router: `zeus/backend/backend.js` ➜ mounts `zeus/server/api_routes.js` under `/api`
- Configuration manager: `zeus/configs/config-manager.js`
- Views (targets): `zeus/views/` (`home_view.js`, `ai_view.js`, `preset_view.js`, `editor_view.js`, `settings_view.js`, `stats_view.js`)
- Zeus Main Context: `../../zeus/PLANIFICACION/VIBECODING/zeus_main_context_base.md`
- Integration Agent context: `./integration-agent.chatmode.md`

## Pre-flight Checklist
- Node.js ≥ 18 is installed (see `engines` in `zeus/server/package.json`)
- Ensure no port conflict on the configured port (default 3000) per `zeus/configs/zeus-config.json`
- First run will auto-create `zeus/configs/zeus-config.json` if missing
- Optional: enable verbose logging by setting `{ "debug": true }` in `zeus/configs/zeus-config.json`

## 1) Launch in VS Code (Git Bash)
1. Open a VS Code terminal using Git Bash
2. Navigate to the server folder: `zeus/server`
3. Install dependencies if needed: `npm ci` (or `npm install`)
4. Start the server: `npm start` (or `npm run dev` for dev mode)
5. Wait for logs:
   - Expect: `Zeus server running on http://<host>:<port>` and `WebSocket server initialized ...`
   - If `debug: true`, the server will log the full configuration

Notes
- The server loads config from `zeus/configs/zeus-config.json`. Defaults are applied if the file is absent.
- Static assets are served from `/assets` (`zeus/client/assets`).

## 2) Probe Health & APIs (cURL)
Run targeted cURL checks. Expected HTTP 200 with JSON unless noted.
- Server health (Express app): `GET /health` ➜ `{ status: "ok", service: "zeus" }`
- Backend health (router): `GET /api/health` ➜ `{ status: "ok", service: "zeus-backend" }`
- Public config: `GET /api/config` ➜ exposes `features`, `theme`, `ui`
- Themes: `GET /api/themes`, `GET /api/theme`
- Stats overview: `GET /api/stats/overview`
- MCP servers: `GET /api/mcp/servers`
- Presets: `GET /api/presets` (supports query params like `search`, `page`, `limit`)

Failure handling
- If an endpoint fails, capture: route, status code, response body, and terminal stack traces
- Verify config toggles: features may gate certain endpoints (e.g., `features.mcpExplorer`)

## 3) Open in Simple Browser
- In VS Code, open Simple Browser to `http://localhost:<port>` (default 3000)
- Verify that assets load from `/assets` without 404s

## 4) UI Tour & Manual Validation
Visit each target UI. Record both expected and actual behavior.

1. Home (`/`)
   - Expected: HyperAxe-rendered home with diogenes-style navigation (emoji + text)
   - Current (as of ZeusServer.js): returns JSON placeholder `{ status: "initializing" }`
   - Action: Mark as deviation if HTML view is not rendered

2. Settings (`/settings`)
   - Expected: Renders HTML from `settings_view.js` with sections for theme, UI, features, AI, MCP, presets
   - Validate theme list against `ThemeHandler` and toggle behavior via `/api/theme/switch`

3. AI Conversation (`/ai`)
   - Expected: Chat UI backed by `/api/ai/*` endpoints (conversations CRUD, messages)
   - Validate: `GET /api/ai/conversations`, `POST /api/ai/conversations`, `POST /api/ai/conversations/:id/messages`

4. Preset Library (`/presets`)
   - Expected: Catalog UI backed by `/api/presets*` (list/search/sort, CRUD, import/export)
   - Validate: `GET /api/presets`, `POST /api/presets`, `PUT /api/presets/:id`, `DELETE /api/presets/:id`

5. MCP Editor (`/editor`)
   - Expected: Server browser backed by `/api/mcp/*` (servers, tools, resources, prompts, tool call)
   - Validate: `GET /api/mcp/servers`, `GET /api/mcp/servers/:id/tools`, `POST /api/mcp/servers/:id/call`

6. Statistics (`/stats`)
   - Expected: Dashboard fed by `/api/stats/*` (overview, usage, performance)
   - Validate: `GET /api/stats/overview`, `GET /api/stats/usage`, `GET /api/stats/performance`

For any missing UI route (404 or non-HTML), capture as deviation with severity and suggested fix (e.g., wire `views/*_view.js` in `ZeusServer.js`).

## 5) E2E Testing Protocol with MCP Playwright
Execute automated user workflow validation using MCP Playwright integration.

### E2E Test Setup
```bash
# Navigate to E2E test directory
cd zeus/test/e2e

# Install dependencies (if not already installed)
npm install

# Run E2E tests (headless mode)
node run-e2e-tests.js

# Run E2E tests (headed mode for debugging)
HEADED=true node run-e2e-tests.js
```

### E2E Test Coverage Matrix

| Test Phase | User Workflow | Automated Validation |
|------------|---------------|---------------------|
| **Phase 1** | Navigation Flow | Route accessibility, URL validation, nav highlighting |
| **Phase 2** | Theme System | Theme switching, persistence across routes, CSS loading |
| **Phase 3** | MCP Editor | Server connection, catalog display, tool selection |
| **Phase 4** | AI Conversation | Chat interface, message handling, preset integration |
| **Phase 5** | Preset Library | CRUD operations, search functionality, categorization |
| **Phase 6** | Settings Config | Form validation, configuration persistence, feature toggles |

### E2E Test Execution Flow
```
VS Code MCP Client → MCP Playwright Server → Browser Automation
       ↑                    ↑                       ↑
   Debug Agent         E2E Test Engine           Zeus UI (3012)
```

### E2E Success Criteria
- **100% Navigation Success**: All routes accessible with proper highlighting
- **Theme System Functional**: All themes switchable with persistence 
- **MCP Editor Operational**: Full catalog display and interaction workflow
- **AI Conversation Active**: Chat system responsive with message flow
- **Preset Management Working**: CRUD operations successful across all presets
- **Settings Configuration Functional**: All form interactions working properly

### E2E Failure Analysis
**Critical Failures** (Block deployment):
- Navigation system failures
- MCP integration breakdowns
- Core UI component failures

**Warnings** (Monitor but don't block):
- Theme switching issues
- Non-critical feature problems
- Performance degradation

### E2E Report Integration
E2E results are automatically integrated into the validation report with:
- **Test Execution Summary**: Pass/fail rates, duration, browser info
- **Detailed Results**: Per-phase results with issues categorization
- **User Flow Validation**: End-to-end user journey success metrics
- **Impact Analysis**: Critical vs warning categorization with recommendations

## 6) Deviation Detection & Diogenes Compliance
Use `zeus_main_context_base.md` as the contract:
- Views required: `/`, `/ai`, `/presets`, `/editor`, `/settings`, `/stats`
- Templating: HyperAxe with `template()` wrapper from `main_views`
- Navigation: emoji + text pattern, diogenes theme compatibility
- Configuration-driven behavior via `configs/config-manager.js`

Validation checklist
- [ ] All target UI routes render HTML via HyperAxe
- [ ] Endpoints respond with correct shapes and error handling
- [ ] Themes list matches diogenes-compatible set; switching works
- [ ] No TypeScript in Zeus codepaths (JS only), English-only text
- [ ] Feature flags gate features consistently

Diogenes compatibility review
- Compare layout and components to diogenes style (navigation, sections, themes)
- Confirm CSS variables and themes are interchangeable with diogenes themes
- Verify no hardcoded values; use config-driven toggles and endpoints

## 7) Integration Agent Critique
Cross-check against `integration-agent.chatmode.md` responsibilities:
- MCP server communication & API client patterns are present and robust
- Error handling and graceful degradation for external dependencies
- Retry/timeout logic for external calls where applicable
- Data transformation aligns with diogenes endpoint conventions
- Gaps identified are logged with concrete follow-ups

Outcome
- Provide a short verdict on whether the current state advances the goal: “preserve 100% of asterion functionality while adopting diogenes patterns.”

## 8) Reporting Template (save under `zeus/PLANIFICACION/ITERATIONS/`)
File name suggestion: `SXX_debug_validation.md`

Sections
1. Summary
   - Server version, port, mode (debug on/off)
   - Overall status (PASS/FAIL with reasons)
2. Health & APIs
   - Table of endpoints tested with status and latency notes
3. UI Tour Results
   - For each route: expected vs actual, screenshots/notes, severity
4. **E2E Test Results**
   - **Test Execution Summary**: Total cases, passed/failed, execution time, browser
   - **Detailed Results**: Phase-by-phase results with duration and issues
   - **User Flow Validation**: End-to-end user journey success metrics
   - **Impact Analysis**: Critical vs warning categorization with recommendations
5. Deviations & Risks
   - Mapping to `zeus_main_context_base.md` requirements
6. Diogenes & Integration Review
   - Theme, navigation, config, and integration-agent alignment
7. Actions & Next Steps
   - Quick fixes, follow-ups, owners, and ETA

## 9) External Services Documentation

### MCPGaia (MCP Server) - Port 3003
**Purpose**: Model Context Protocol server providing tools catalog
**Status**: Active with DevOps Manager architecture
**Features**:
- Plugin system with X+1 Control Plugin
- 20 tools available (prompts, resources, system control, simulator)
- 7 resources (project status, npm scripts, game state, runtime stats, etc.)
- 3 prompts (start-system, open-web-console, simulator-control)
- ProserpinaBot connection established

**Connection Logs Pattern**:
```
[INFO] DevOps: Manager architecture initialized
[INFO] Plugin X+1 Control Plugin (xplus1-control) registered
[INFO] Starting ProserpinaBot connection...
[INFO] Plugin X+1 Control Plugin initialized successfully
```

### SLMo42 (Inference + MCP Proxy) - Port 4001
**Purpose**: Dual service - conversational inference + REST proxy for MCPGaia
**Status**: Active with GPU optimization enabled
**Features**:
- **Inference Engine**: node-llama-cpp with Oasis42 model
- **MCP Proxy**: REST routes `/ai/ui/mcp/*` for Zeus integration
- **Presets**: 1 preset loaded ("PRESET_DEFAUL_ALL")
- **GPU Support**: Enabled with auto layer detection

**Connection Pattern**: `Zeus (3000) → SLMo42 (4001) → MCPGaia (3003)`

**UI Routes for Zeus Integration**:
- `GET /ai/ui/mcp/list` - Get complete catalog (used for mock creation)
- `GET /ai/ui/mcp/presets` - List all saved presets
- `GET /ai/ui/mcp/preset/:name` - Get specific preset
- `POST /ai/ui/mcp/set` - Create/update preset

**Mock Data**: Complete catalog available at `zeus/test/mock_mcp_catalog.json`

## 10) MCP Playwright Integration Setup

### VS Code MCP Configuration
Add to VS Code settings.json:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/test", "--mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "~/.cache/ms-playwright"
      }
    }
  }
}
```

### Installation Steps
```bash
# Install MCP Playwright if not available
npm install -g @playwright/test

# Initialize Playwright in Zeus project
cd zeus && npx playwright install

# Verify E2E test infrastructure
cd zeus/test/e2e && npm install
```

### E2E Test Execution Commands
```bash
# Run full debug protocol with E2E integration
./zeus/test/debug-protocol-main-script.sh

# Run E2E tests independently (headless)
cd zeus/test/e2e && node run-e2e-tests.js

# Run E2E tests with visible browser (debugging)
cd zeus/test/e2e && HEADED=true node run-e2e-tests.js

# Run individual test suites
cd zeus/test/e2e && npm run test:navigation
cd zeus/test/e2e && npm run test:themes
cd zeus/test/e2e && npm run test:editor
```

### Integration with Debug Protocol
The E2E testing integrates seamlessly with the existing debug protocol:

**Standard Protocol**: Health → APIs → UI Tour → Report
**E2E Protocol**: Health → APIs → UI Tour → **E2E Testing** → Report

E2E tests run after manual validation and provide automated verification of user workflows, significantly enhancing validation coverage and reliability.

## 11) Troubleshooting Guide
- Port in use: change `server.port` in `zeus/configs/zeus-config.json`
- Config missing: first run auto-creates; otherwise create manually from defaults in `config-manager.js`
- 404 on assets: verify `/assets` static served from `zeus/client/assets`
- Missing UI routes: wire routes in `ZeusServer.js` to render from `zeus/views/*_view.js`
- CORS issues: `cors()` is enabled with permissive origin; confirm client origin if modified
- MCP services unavailable: use mock catalog from `zeus/test/mock_mcp_catalog.json`
- SLMo42 connection issues: verify port 4001 and check GPU initialization logs
- **E2E Test Issues**: 
  - Playwright not installed: run `npx playwright install`
  - Browser launch failures: check `PLAYWRIGHT_BROWSERS_PATH` environment
  - Test timeout issues: increase timeout in test configuration
  - MCP integration failures: verify MCP Playwright server configuration in VS Code

## Exit Criteria
- All health checks green or issues documented with owners
- Each UI route visited and assessed manually
- **E2E testing completed** with comprehensive user workflow validation
- **6 core user journeys validated** via automated browser testing
- MCP integration tested (live services or mock data)
- External services connectivity documented
- **Enhanced validation report** created in `ITERATIONS/` with E2E results and actionable next steps
- **Quality gates met**: E2E pass rate ≥90% or critical failures documented with resolution plans
