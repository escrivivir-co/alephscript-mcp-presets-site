You are an expert developer working on the Zeus MCP Presets Site - a multi-project repository containing three distinct but related codebases. When explaining things you prefer creating markdown files rather than output to chat window. You use the chat to inform progress, decisions, and to ask about blockers.

## Repository Structure

This is a **three-project monorepo** with distinct but related codebases:

- **`asterion/`**: Original TypeScript MCP Mesh SDK Web Interface (legacy, being refactored)
- **`diogenes/`**: Reference architecture with established patterns (Node.js + HyperAxe)
- **`zeus/`**: Clean production refactor of asterion, following diogenes patterns exactly

## Zeus Project Context (Primary Focus)

**Technology Stack**: Node.js + Express.js + HyperAxe templating
**Architecture**: Diogenes-compatible modular design with specialized agent collaboration
**Goal**: Preserve 100% of asterion functionality while adopting proven diogenes patterns
**Development Model**: Agent-based collaboration (Backend, Frontend, Config, Validation agents)

## Core Principles

1. **Diogenes Compatibility**: Mirror diogenes patterns exactly for seamless future integration
2. **Agent Specialization**: Backend, Frontend, Config, and Validation agents each handle specific domains
3. **Clean Code**: English-only comments, no legacy Spanish code, comprehensive documentation
4. **Modular Design**: Clear separation of concerns (backend/, server/, views/, configs/, models/)
5. **Configuration-Driven**: Use feature flags, configurable themes, and externalized settings
6. **Documentation-First**: Create `.md` files for explanations, use chat for coordination only

## Critical Developer Workflows

### Development Commands
```bash
# Zeus development (primary)
cd zeus && npm start                    # Server: http://localhost:3012
cd zeus && npm run dev                 # Same as start (no watch mode)

# Asterion analysis (reference only)
cd asterion && npm start              # Port varies, legacy TypeScript

# Configuration files path
zeus/configs/zeus-config.json         # Main configuration
```

### Agent Collaboration Pattern
Each agent has specialized focus areas defined in `.github/instructions/`:
- **Backend Agent** (`backend/`, `server/`): Express.js routing, middleware, MCP integration
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
Follow this EXACT structure for all views:
```javascript
const { html, head, body, div, nav, section, h1, ul, li, a, span } = require('hyperaxe');
const { getConfig } = require('../configs/config-manager.js');

// i18n integration (diogenes pattern) 
const i18nBase = require("../client/assets/translations/i18n");
let selectedLanguage = "en";
let i18n = {};

// Theme integration
const getCurrentTheme = () => getConfig().themes?.current || "Dark-MCP";

// Main template wrapper (REQUIRED pattern)
const template = (titlePrefix, ...elements) => {
    const config = getConfig();
    return html(
        head(
            title(`${titlePrefix} - Zeus MCP Interface`),
            link({ rel: 'stylesheet', href: `/themes/${getCurrentTheme()}.css` })
        ),
        body(...elements)
    );
};

// Component pattern
const myView = (data) => {
    return template('Page Title', 
        renderNavigation(),
        section({ class: 'content' },
            h1('My Content'),
            // View content here
        )
    );
};

module.exports = { myView };
```

### Configuration Access Pattern (Required)
```javascript
const { getConfig } = require('../configs/config-manager.js');

// Feature flags (diogenes style)
const renderConditionalFeature = () => {
    const config = getConfig();
    return config.modules.featureMod === 'on' 
        ? featureContent()
        : '';
};

// Theme access
const getCurrentTheme = () => getConfig().themes?.current || "Dark-MCP";

// MCP server configuration
const getMcpEndpoint = () => getConfig().mcp?.catalogUrl || 'http://localhost:4001';
```

### Navigation Component (Diogenes Style)
```javascript
const renderNavigation = () => {
    const config = getConfig();
    return nav({ class: 'main-nav' },
        ul(
            navLink({ href: "/", emoji: "🏠", text: i18n.home }),
            navLink({ href: "/ai", emoji: "🤖", text: i18n.ai }),
            navLink({ href: "/presets", emoji: "📋", text: i18n.presets }),
            navLink({ href: "/editor", emoji: "🔧", text: i18n.editor }),
            navLink({ href: "/settings", emoji: "⚙️", text: i18n.settings })
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

### MCP Server Communication
- **Catalog Service**: Default `http://localhost:4001` (configurable via `zeus/configs/zeus-config.json`)
- **AI Endpoint**: `/ai` route for AI conversation interface
- **External Services**: MCPGaia + SLMo42 integration patterns documented in debug agent instructions

### Cross-Component Communication
- **Configuration**: Centralized via `getConfig()` from `config-manager.js`
- **Event System**: Service-level event bus for component coordination
- **State Management**: Model-based state persistence with JSON configuration
- **Theme System**: CSS variable-based themes compatible with diogenes color schemes

### Development Environment
- **Port**: Zeus runs on `3012` (vs diogenes on different port)
- **Hot Reload**: Manual restart required (`npm start` from zeus directory)
- **Module Resolution**: All dependencies managed in zeus root `package.json`
- **Agent Instructions**: Located in `.github/instructions/` for specialized development roles

Always prioritize code quality, diogenes compatibility, and comprehensive documentation in your implementations.