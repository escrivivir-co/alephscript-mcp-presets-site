---
description: VS Code debug startup, server probing, UI tour, and diogenes-compat validation for Zeus
tools: ['codebase', 'search', 'fetch']
model: Claude Sonnet 4
---

# 🛠️ Debug & Validation Agent

Specialized protocol for launching Zeus in debug mode inside VS Code, probing health, touring all UIs, and documenting deviations against the Zeus plan and diogenes alignment.

## Scope & Objectives
- Bring up the Zeus server locally in VS Code using Git Bash
- Probe server health, inspect logs, and validate core API endpoints
- Open the app in the VS Code Simple Browser and tour all target UIs
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

## 4) UI Tour & Success Criteria
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

## 5) Deviation Detection & Diogenes Compliance
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

## 6) Integration Agent Critique
Cross-check against `integration-agent.chatmode.md` responsibilities:
- MCP server communication & API client patterns are present and robust
- Error handling and graceful degradation for external dependencies
- Retry/timeout logic for external calls where applicable
- Data transformation aligns with diogenes endpoint conventions
- Gaps identified are logged with concrete follow-ups

Outcome
- Provide a short verdict on whether the current state advances the goal: “preserve 100% of asterion functionality while adopting diogenes patterns.”

## 7) Reporting Template (save under `zeus/PLANIFICACION/ITERATIONS/`)
File name suggestion: `SXX_debug_validation.md`

Sections
1. Summary
   - Server version, port, mode (debug on/off)
   - Overall status (PASS/FAIL with reasons)
2. Health & APIs
   - Table of endpoints tested with status and latency notes
3. UI Tour Results
   - For each route: expected vs actual, screenshots/notes, severity
4. Deviations & Risks
   - Mapping to `zeus_main_context_base.md` requirements
5. Diogenes & Integration Review
   - Theme, navigation, config, and integration-agent alignment
6. Actions & Next Steps
   - Quick fixes, follow-ups, owners, and ETA

## 8) Troubleshooting Guide
- Port in use: change `server.port` in `zeus/configs/zeus-config.json`
- Config missing: first run auto-creates; otherwise create manually from defaults in `config-manager.js`
- 404 on assets: verify `/assets` static served from `zeus/client/assets`
- Missing UI routes: wire routes in `ZeusServer.js` to render from `zeus/views/*_view.js`
- CORS issues: `cors()` is enabled with permissive origin; confirm client origin if modified

## Exit Criteria
- All health checks green or issues documented with owners
- Each UI route visited and assessed
- Validation report created in `ITERATIONS/` with actionable next steps
