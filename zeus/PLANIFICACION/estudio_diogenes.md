# Diogenes Architecture Analysis

## Project Overview
**Project**: @krakenslab/oasis v0.4.9  
**Description**: Oasis Social Networking Project Utopia  
**License**: AGPL-3.0  
**Main Technology**: Node.js with SSB (Secure Scuttlebutt) protocol

## Architecture Pattern

### Core Structure
```
diogenes/
├── backend/           # Main backend services and handlers
├── client/            # Client-side assets and configurations
├── configs/           # Configuration management
├── models/            # Data models (40+ domain models)
├── server/            # SSB server and core infrastructure
└── views/             # View layer (39+ view modules)
```

### Key Technical Components

#### 1. **Server Architecture**
- **Main Entry Points**: 
  - `server/SSB_server.js`: SSB (Secure Scuttlebutt) protocol server
  - `backend/backend.js`: Main application backend (3363+ lines)
  - **Startup sequence**: SSB server starts first, then backend after 10s delay

#### 2. **Technology Stack**
- **Runtime**: Node.js
- **Protocol**: SSB (Secure Scuttlebutt) for decentralized social networking
- **Web Framework**: Express.js + Koa.js
- **Template Engine**: HyperAxe (functional HTML generation)
- **Database**: SSB-DB (distributed database)
- **Styling**: Theme-based CSS system

#### 3. **View System**
- **Template Function**: HyperAxe-based functional HTML generation
- **Pattern**: Each view is a separate `.js` file that exports view functions
- **Main Views Structure**:
  ```javascript
  const { div, h1, section, ... } = require("hyperaxe");
  const viewFunction = (data) => template(title, ...content);
  ```

#### 4. **Internationalization (i18n)**
- **Location**: `client/assets/translations/`
- **Structure**: 
  - `i18n.js`: Main i18n loader
  - `oasis_{lang}.js`: Language-specific files (en, es, fr, eu)
- **Usage**: Global `i18n` object available in views
- **Language switching**: Dynamic language setting via `setLanguage()` function

#### 5. **Theming System**
- **Location**: `client/assets/themes/`
- **Configuration**: `configs/oasis-config.json`
- **Themes Available**: Dark-SNH, Clear-SNH, Purple-SNH, Matrix-SNH
- **Implementation**: CSS-based with theme selector in settings

#### 6. **Configuration Management**
- **Main Config**: `configs/config-manager.js`
- **Pattern**: Modular configuration with feature flags
- **Settings**: Theme, language, wallet, AI integration, module toggles

#### 7. **Model Architecture**
- **Pattern**: Each domain has its own model file
- **Examples**: `banking_model.js`, `forum_model.js`, `wallet_model.js`
- **Total**: 40+ specialized models for different features

#### 8. **Routing & Navigation**
- **Navigation**: Dynamic menu generation based on module configuration
- **Pattern**: Feature toggles control which navigation links appear
- **Implementation**: `main_views.js` contains navigation logic

## Key Patterns to Emulate

### 1. **Modular Feature System**
```javascript
const renderModuleLink = () => {
  const moduleMod = getConfig().modules.moduleMod === 'on';
  return moduleMod 
    ? navLink({ href: "/path", emoji: "🔥", text: i18n.label }) 
    : ''; 
};
```

### 2. **Template Pattern**
```javascript
const viewFunction = ({ data }) => {
  return template(
    pageTitle,
    section(
      div({ class: "content" },
        // View content
      )
    )
  );
};
```

### 3. **Configuration-Driven UI**
- All features controllable via configuration
- Dynamic navigation based on enabled modules
- Theme system with hot-swapping capability

### 4. **File Organization**
- Single responsibility: one concern per file
- Clear separation: models, views, controllers, configs
- Modular architecture: easy to enable/disable features

## Integration Points for Zeus

### 1. **Styling Compatibility**
- Use similar theme structure and CSS organization
- Implement theme selector similar to diogenes settings
- Maintain visual consistency with diogenes themes

### 2. **Configuration Pattern**
- Adopt similar config-manager.js pattern
- Use feature flags for enabling/disabling functionality
- JSON-based configuration files

### 3. **View Architecture**
- Use HyperAxe or similar functional HTML generation
- Implement template() wrapper function pattern
- Separate view logic into individual files

### 4. **i18n System**
- Similar translation file structure
- Dynamic language switching capability
- Global i18n object pattern

### 5. **Navigation System**
- Configuration-driven navigation menu
- Emoji + text pattern for navigation items
- Feature flag integration for menu items

## Technical Dependencies Worth Adopting
- **HyperAxe**: For functional HTML generation
- **Express.js**: For HTTP server
- **Modular CSS**: Theme-based styling system
- **JSON Configuration**: For settings management

## Recommended Architecture for Zeus
Based on diogenes patterns, zeus should implement:
1. Similar directory structure (models/, views/, configs/, etc.)
2. HyperAxe-based templating system
3. Configuration-driven feature toggles
4. Theme system compatible with diogenes
5. Modular view architecture
6. i18n system with language switching
