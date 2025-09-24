# Zeus Architecture Plan

## Project Overview
**Project**: Zeus - MCP Mesh SDK Web Interface (Refactored)  
**Goal**: Clean production version of asterion following diogenes patterns  
**Technology**: Node.js + Express.js with diogenes-compatible architecture  
**Integration**: Designed for future integration with diogenes ecosystem

## Architecture Strategy

### Core Principle: **Diogenes Compatibility**
Zeus will adopt diogenes architectural patterns while preserving 100% of asterion functionality, ensuring seamless future integration and consistent user experience.

## Proposed Directory Structure

```
zeus/
├── backend/                    # Main backend services (diogenes pattern)
│   ├── backend.js             # Main application backend
│   ├── mcpHandler.js          # MCP server interaction handler
│   ├── presetHandler.js       # Preset management handler
│   ├── aiHandler.js           # AI conversation handler
│   └── themeHandler.js        # Theme management handler
├── server/                    # Server infrastructure (diogenes pattern)
│   ├── package.json           # Dependencies and scripts
│   ├── server_config.js       # Server configuration
│   └── ZeusServer.js          # Main server (similar to SSB_server.js)
├── client/                    # Client assets (diogenes pattern)
│   └── assets/
│       ├── images/            # Static images
│       ├── styles/            # CSS stylesheets
│       ├── themes/            # Theme CSS files
│       ├── js/                # Client-side JavaScript
│       └── translations/      # i18n files
│           ├── i18n.js        # Main i18n loader
│           └── zeus_en.js     # English translations
├── configs/                   # Configuration management (diogenes pattern)
│   ├── config-manager.js      # Main config manager
│   ├── zeus-config.json       # Main configuration
│   ├── ai-history.json        # AI conversation history
│   └── preset-config.json     # Preset configurations
├── models/                    # Data models (diogenes pattern)
│   ├── main_models.js         # Core model definitions
│   ├── preset_model.js        # Preset data model
│   ├── ai_model.js            # AI conversation model
│   ├── mcp_model.js           # MCP server model
│   └── theme_model.js         # Theme configuration model
├── views/                     # View layer (diogenes pattern)
│   ├── main_views.js          # Main template and navigation
│   ├── home_view.js           # Home/landing page view
│   ├── ai_view.js             # AI conversation view
│   ├── preset_view.js         # Preset library view
│   ├── editor_view.js         # MCP Explorer (renamed from explorer)
│   ├── settings_view.js       # Settings configuration view
│   ├── stats_view.js          # Statistics dashboard view
│   ├── error_views.js         # Error handling views
│   └── components/            # View components
│       ├── preset_components.js      # Preset-related components
│       ├── mcp_components.js         # MCP server components
│       ├── ai_components.js          # AI interface components
│       └── navigation_components.js  # Navigation components
└── PLANIFICACION/             # Planning documentation
    ├── estudio_diogenes.md    # ✅ Diogenes analysis
    ├── estudio_asterion.md    # ✅ Asterion analysis
    └── plan_zeus.md           # ✅ This architecture plan
```

## Technical Architecture

### 1. **Server Layer** (Following Diogenes Pattern)

#### Main Server (`server/ZeusServer.js`)
```javascript
// Similar to diogenes SSB_server.js structure
const express = require('express');
const path = require('path');
const config = require('./server_config');

const ZeusServer = {
    app: null,
    
    init() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        return this;
    },
    
    setupMiddleware() {
        // Static files, CORS, body parsing
    },
    
    setupRoutes() {
        // Route setup following diogenes pattern
    },
    
    start(port = 3011) {
        // Server startup logic
    }
};
```

#### Backend Layer (`backend/backend.js`)
```javascript
// Main application logic (diogenes pattern)
// Handles MCP integration, preset management, AI conversations
// Similar structure to diogenes backend.js but focused on MCP functionality
```

### 2. **View System** (HyperAxe + Diogenes Patterns)

#### Template System (`views/main_views.js`)
```javascript
const { html, head, body, div, nav, ... } = require('hyperaxe');
const { getConfig } = require('../configs/config-manager.js');

// i18n integration (diogenes pattern)
const i18nBase = require("../client/assets/translations/i18n");
let selectedLanguage = "en";
let i18n = {};

// Theme integration (diogenes pattern)
const getCurrentTheme = () => getConfig().themes?.current || "Dark-MCP";

// Navigation with feature toggles (diogenes pattern)
const renderNavigation = () => {
    const config = getConfig();
    return nav(
        ul(
            navLink({ href: "/", emoji: "🏠", text: i18n.home }),
            navLink({ href: "/ai", emoji: "🤖", text: i18n.ai }),
            navLink({ href: "/presets", emoji: "📋", text: i18n.presets }),
            navLink({ href: "/editor", emoji: "🔧", text: i18n.editor }), // Renamed from explorer
            navLink({ href: "/settings", emoji: "⚙️", text: i18n.settings })
        )
    );
};

// Main template wrapper (diogenes pattern)
const template = (titlePrefix, ...elements) => {
    // HyperAxe template generation with theme support
};
```

### 3. **Configuration Management** (Diogenes Pattern)

#### Config Manager (`configs/config-manager.js`)
```javascript
// Following diogenes config-manager.js pattern
const fs = require('fs');
const path = require('path');

let configCache = null;

const getConfig = () => {
    if (!configCache) {
        // Load and merge configurations
        configCache = {
            themes: { current: "Dark-MCP" },
            modules: {
                aiMod: 'on',
                presetsMod: 'on',
                editorMod: 'on',
                statsMod: 'on'
            },
            mcp: {
                catalogUrl: 'http://localhost:4001',
                servers: []
            },
            ai: {
                endpoint: 'http://localhost:4001/ai',
                defaultPrompt: 'You are a helpful assistant'
            }
        };
    }
    return configCache;
};
```

### 4. **Internationalization** (Diogenes Pattern)

#### Translation Structure
```javascript
// client/assets/translations/zeus_en.js
const en = {
    appTitle: 'Zeus - MCP Mesh SDK',
    home: 'Home',
    ai: 'AI Assistant',
    presets: 'Preset Library',
    editor: 'MCP Editor',
    settings: 'Settings',
    stats: 'Statistics',
    // ... all UI strings
};
module.exports = { en };
```

### 5. **Theme System** (Compatible with Diogenes)

#### Theme Configuration
```json
// configs/zeus-config.json
{
    "themes": {
        "current": "Dark-MCP",
        "available": [
            "Dark-MCP",
            "Clear-MCP", 
            "Purple-MCP",
            "Matrix-MCP",
            "Orange-Dark-MCP"
        ]
    }
}
```

## Feature Implementation Plan

### 1. **Home Page** (`/`)
- **View**: `views/home_view.js`
- **Features**: Landing page, navigation, theme preview
- **Template**: Uses main template with welcome content
- **Assets**: Static images, CSS animations

### 2. **AI Conversation** (`/ai`)
- **View**: `views/ai_view.js`
- **Components**: `views/components/ai_components.js`
- **Features**: 
  - Chat interface with conversation history
  - Preset context integration
  - Message persistence to diogenes endpoints
- **Backend**: `backend/aiHandler.js`

### 3. **Preset Library** (`/presets`)
- **View**: `views/preset_view.js`
- **Components**: `views/components/preset_components.js`
- **Features**:
  - Catalog display of saved presets
  - Preset selection and activation
  - Preset management (create, edit, delete)
- **Backend**: `backend/presetHandler.js`
- **Model**: `models/preset_model.js`

### 4. **MCP Editor** (`/editor`) - *Renamed from Explorer*
- **View**: `views/editor_view.js`
- **Components**: `views/components/mcp_components.js`
- **Features**:
  - MCP server browsing and discovery
  - Tool, resource, and prompt exploration
  - Interactive item selection for preset creation
  - Server capability analysis
- **Backend**: `backend/mcpHandler.js`
- **Model**: `models/mcp_model.js`

### 5. **Settings** (`/settings`)
- **View**: `views/settings_view.js`
- **Features**:
  - Theme selector (compatible with diogenes themes)
  - Language selector
  - MCP server configuration
  - AI endpoint configuration
- **Backend**: Uses config-manager.js

### 6. **Statistics** (`/stats`)
- **View**: `views/stats_view.js`
- **Features**:
  - Usage metrics
  - Performance data
  - System status

## Integration Strategy with Diogenes

### 1. **Visual Consistency**
- **Themes**: Use diogenes-compatible CSS themes
- **Navigation**: Similar emoji + text pattern
- **Typography**: Match diogenes font and spacing
- **Color Scheme**: Align with diogenes color variables

### 2. **Technical Compatibility**
- **HyperAxe**: Same templating engine as diogenes
- **Express.js**: Compatible server framework
- **Configuration**: Similar JSON-based config management
- **File Structure**: Mirror diogenes organization patterns

### 3. **API Integration**
- **Diogenes Endpoints**: Zeus will consume diogenes REST routes
- **Authentication**: Use diogenes auth patterns when available
- **Data Exchange**: JSON-based communication

### 4. **Deployment Strategy**
- **Standalone**: Zeus runs on independent port (3011)
- **Integration Ready**: Architecture supports future absorption
- **Shared Resources**: Can share themes and static assets

## Migration Checklist

### Phase 1: Foundation
- [ ] Setup basic directory structure
- [ ] Implement main server (ZeusServer.js)
- [ ] Create configuration management system
- [ ] Setup HyperAxe templating with theme support
- [ ] Implement i18n system

### Phase 2: Core Views
- [ ] Migrate home view with navigation
- [ ] Implement settings view with theme selector
- [ ] Create basic error handling views
- [ ] Setup static asset serving

### Phase 3: Advanced Features
- [ ] Migrate AI conversation interface
- [ ] Implement preset library functionality
- [ ] Create MCP editor (formerly explorer)
- [ ] Add statistics dashboard

### Phase 4: Integration
- [ ] Test diogenes API integration
- [ ] Verify theme compatibility
- [ ] Validate navigation consistency
- [ ] Performance optimization

### Phase 5: Quality Assurance
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Code cleanup and optimization
- [ ] Deployment validation

## Success Criteria

### Functional Requirements
- [ ] All asterion views working identically
- [ ] Theme system compatible with diogenes
- [ ] MCP server integration functional
- [ ] AI conversations with preset context
- [ ] Preset creation and management
- [ ] Settings persistence

### Technical Requirements
- [ ] Clean, maintainable codebase
- [ ] No Spanish comments or legacy code
- [ ] Consistent diogenes-style architecture
- [ ] Proper error handling
- [ ] Comprehensive logging

### Integration Requirements
- [ ] Visual consistency with diogenes
- [ ] API compatibility with diogenes endpoints
- [ ] Theme sharing capability
- [ ] Future absorption readiness

This architecture plan provides a clear roadmap for creating Zeus as a clean, production-ready version of asterion while maintaining full compatibility with diogenes patterns and ensuring seamless future integration.
