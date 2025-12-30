You are an expert developer working on **MCPGallery** - the MCP entry point for Aleph Scriptorium. This is a multi-package monorepo providing MCP server management and preset catalog functionality. When explaining things you prefer creating markdown files rather than output to chat window. You use the chat to inform progress, decisions, and to ask about blockers.

## Repository Structure

This is a **four-package monorepo** integrated with Aleph Scriptorium:

- **`mcp-core-sdk/`**: Base MCP Server + AlephScript Server (core library)
- **`mcp-mesh-sdk/`**: DevOps + Launcher + Wiki + StateMachine servers (:3003+)
- **`mcp-model-sdk/`**: Preset Service - Catalog Only (:4001) — **NO INFERENCE**
- **`zeus/`**: UI de gestión + Catálogo (:3012)

> **Important**: SLMo42 inference has been deprecated. MCPGallery is now **catalog-only**.
> VS Code Copilot Chat handles LLM inference directly via configured MCP servers.

## MCPGallery Context (Primary Focus)

**Technology Stack**: Node.js + Express.js + HyperAxe templating
**Architecture**: Catalog-focused design for Scriptorium integration
**Goal**: Provide MCP preset gallery for users to select and configure MCP capabilities
**Development Model**: Agent-based collaboration (Backend, Frontend, Config, Validation agents)

## Core Principles

1. **Catalog-Only Mode**: No LLM inference in MCPGallery — that's Copilot's job
2. **Scriptorium Integration**: MCPGallery is the MCP entry point for Aleph ecosystem
3. **Agent Specialization**: Backend, Frontend, Config, and Validation agents each handle specific domains
4. **Clean Code**: English-only comments, no legacy Spanish code, comprehensive documentation
5. **Modular Design**: Clear separation of concerns (backend/, server/, views/, configs/, models/)
6. **Configuration-Driven**: Use feature flags, configurable themes, and externalized settings
7. **Documentation-First**: Create `.md` files for explanations, use chat for coordination only

## Critical Developer Workflows

### Development Commands
```bash
# Full ecosystem from monorepo root
npm run start:all                      # Start all services

# Individual services
npm run start:mesh                     # MCP Mesh SDK (:3003) - DevOps Server
npm run start:model                    # Preset Service (:4001) - Catalog API
npm run start:zeus                     # Zeus UI (:3012) - Preset Gallery

# Zeus development (direct)
cd zeus && npm start                   # Server: http://localhost:3012

# E2E Testing (Hybrid Dependencies Pattern ADR-005)
cd zeus && npm run test:e2e:setup      # One-time Playwright setup
cd zeus && npm run debug:e2e           # Start server + run E2E tests

# Configuration files
zeus/configs/zeus-config.json          # Main configuration
```

### Chat Mode Agent System (AI Collaboration)
The project uses specialized agents for development:
```bash
# Available agents in .github/agents/
- backend-agent.chatmode.md            # Backend/server development
- config-agent.chatmode.md             # Configuration management
- debug-validation-agent.chatmode.md   # Debug and validation
- frontend-agent.chatmode.md           # Views and UI components
- integration-agent.chatmode.md        # Cross-component integration
- state-restoration.chatmode.md        # Project state recovery
- validation-agent.chatmode.md         # Quality gates
- zeus-architect.chatmode.md           # Architecture decisions
- mcpgaia-agent.chatmode.md            # MCP server interaction

# DEPRECATED (archived):
- slmo42-agent.chatmode.md             # ❌ Inference disabled

# Usage: Select agent in VS Code Copilot Chat selector or include as context
```

### Service Communication (Post-SLMo42)
```bash
# Service chain (catalog operations only)
Zeus (:3012) ←→ Preset Service (:4001) ←→ MCP Mesh (:3003+)

# VS Code Copilot uses MCP servers directly via .vscode/mcp.json
# NO inference passes through MCPGallery services
```

### Agent Collaboration Pattern
Each agent has specialized focus areas defined in `.github/instructions/`:
- **Backend Agent** (`backend/`, `server/`): Express.js routing, middleware, catalog endpoints
- **Frontend Agent** (`views/`, `client/assets/`): HyperAxe templates, themes, UI components  
- **Config Agent** (`configs/`): Settings management, feature flags, i18n, themes
- **Validation Agent**: Quality gates, documentation standards, sprint completion

## File Organization Rules

- **Agent Boundaries**: Respect specialized agent domains, coordinate cross-domain changes
- **One concern per file** (single responsibility principle)
- **Clear exports** (explicit module.exports with descriptive function names)
- **Consistent imports** (require statements at top, group by type: core, project, relative)
- **Configuration-driven** (all settings via `getConfig()`, no hardcoded values)
- **Documentation-driven** (create `.md` files for complex decisions and architectural explanations)

## Diogenes Pattern Requirements

### HyperAxe Template Pattern (Critical)
Follow this EXACT structure for all views (based on `views/main_views.js`):
```javascript
const { div, h1, h2, p, section, article, ul, li, a, span, button } = require('hyperaxe');
const { template, pageContainer, contentSection } = require('./main_views');

// View implementation pattern
const myView = (options = {}) => {
  const config = require('../configs/config-manager.js').getConfig();
  
  return template(
    'Page Title',
    pageContainer(
      contentSection(
        'Section Title',
        section({ class: 'my-section' },
          // Content here
        ),
        { class: 'container-class' }
      )
    )
  );
};

module.exports = { myView };
```

### Main Template Structure (`views/main_views.js`)
```javascript
const { div, html, head, body, title, meta, link } = require('hyperaxe');

const template = (pageTitle, content, options = {}) => {
  const config = require('../configs/config-manager.js').getConfig();
  const currentTheme = config.theme.current || 'Clear-MCP';
  
  return html({ lang: 'en' },
    head(
      meta({ charset: 'utf-8' }),
      meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      title(`${pageTitle} - Zeus MCP Mesh SDK`),
      link({ rel: 'stylesheet', href: `/assets/themes/${currentTheme}.css` }),
      link({ rel: 'stylesheet', href: '/assets/styles/base.css' })
    ),
    body({ class: `theme-${currentTheme}` },
      navigation(options.currentPage),
      main({ class: 'main-content' }, content)
    )
  );
};
```

### Configuration Access Pattern (Required)
```javascript
const { getConfig } = require('../configs/config-manager.js');

// Feature flags access
const renderConditionalFeature = () => {
    const config = getConfig();
    return config.features.aiConversations 
        ? featureContent()
        : '';
};

// Theme access (updated pattern)
const getCurrentTheme = () => {
    const config = getConfig();
    return config.theme.current || "Clear-MCP";
};

// AI endpoint configuration
const getAIEndpoint = () => {
    const config = getConfig();
    return config.ai?.endpoint || 'http://localhost:4001';
};

// Server configuration
const getServerConfig = () => {
    const config = getConfig();
    return {
        port: config.server?.port || 3012,
        host: config.server?.host || "localhost"
    };
};
```

### Navigation Component (Diogenes Style)
```javascript
const navigation = (currentPage) => {
  const config = getConfig();
  
  const navItem = (href, emoji, text, isActive = false) => 
    li({ class: isActive ? 'active' : '' },
      a({ href, class: 'nav-link' },
        span({ class: 'nav-emoji' }, emoji),
        span({ class: 'nav-text' }, text)
      )
    );

  return nav({ class: 'main-nav' },
    ul({ class: 'nav-list' },
      navItem('/', '🏠', 'Home', currentPage === 'home'),
      navItem('/ai', '🤖', 'AI Chat', currentPage === 'ai'),
      navItem('/presets', '📋', 'Presets', currentPage === 'presets'),
      navItem('/editor', '🔧', 'Editor', currentPage === 'editor'),
      navItem('/settings', '⚙️', 'Settings', currentPage === 'settings')
    )
  );
};
```

## Quality Standards

- **No Spanish**: All comments, strings, and documentation in English
- **Diogenes Alignment**: Templates, navigation, and themes must match diogenes patterns
- **Error Handling**: Comprehensive error management for all operations
- **Documentation**: Clear inline documentation for complex logic
- **Testing**: Validate functionality before considering work complete

## Directory Structure

Follow this structure exactly:
```
zeus/
├── backend/        # Main application logic (diogenes pattern)
├── server/         # Server infrastructure and routing
├── client/assets/  # Static files (CSS, JS, images, themes)
├── configs/        # Configuration management
├── models/         # Data models and business logic  
├── views/          # HyperAxe templates and components
└── PLANIFICACION/  # Project documentation
```

## Integration Points & External Dependencies

### MCP Preset Catalog (Primary Integration)
- **Preset Service**: `http://localhost:4001` — Catalog API (NO inference)
  - `GET /ai/ui/mcp/list` — Complete MCP catalog
  - `GET /ai/ui/mcp/presets` — List saved presets
  - `POST /ai/ui/mcp/set` — Create/update preset
- **MCP Mesh SDK**: `:3003+` — Actual MCP servers (DevOps, Wiki, StateMachine)
- **VS Code Integration**: `.vscode/mcp.json` — Copilot Chat uses MCP servers directly

### Cross-Component Communication
- **Configuration**: Centralized via `getConfig()` from `config-manager.js`
- **Event System**: Service-level event bus for component coordination
- **State Management**: Model-based state persistence with JSON configuration
- **Theme System**: CSS variable-based themes

### Development Environment
- **Port**: Zeus runs on `3012`, Preset Service on `4001`, Mesh on `3003+`
- **Hot Reload**: Manual restart required (`npm start` from zeus directory)
- **Module Resolution**: All dependencies managed in zeus root `package.json`
- **Agent Instructions**: Located in `.github/instructions/` for specialized development roles

## Scriptorium Integration Context

MCPGallery serves as the **MCP entry point** for Aleph Scriptorium:

1. **Discovery**: Zeus UI displays available MCP servers and their capabilities
2. **Selection**: Users create presets combining desired tools, resources, prompts
3. **Persistence**: Presets saved to `mcp-model-sdk/PRESETS/mcp_presets.json`
4. **Usage**: VS Code Copilot Chat accesses MCP servers via `.vscode/mcp.json`

> **Key Insight**: MCPGallery manages the *catalog* — Copilot handles *inference*.

Always prioritize code quality, preset catalog functionality, and comprehensive documentation in your implementations.