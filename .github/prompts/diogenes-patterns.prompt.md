---
title: "Diogenes Pattern Implementation Guide"
description: "Step-by-step guide for implementing diogenes-compatible patterns in Zeus project"
category: "architecture"
---

# Diogenes Pattern Implementation Guide

Use this guide to ensure Zeus components follow diogenes architectural patterns exactly for seamless future integration.

## HyperAxe View Pattern (Required)

### Basic Template Structure
```javascript
const { html, head, body, div, nav, section, h1, ul, li, a, span } = require('hyperaxe');
const { getConfig } = require('../configs/config-manager.js');

// i18n integration (diogenes pattern)
const i18nBase = require("../client/assets/translations/i18n");
let selectedLanguage = "en";
let i18n = {};

// Initialize i18n
const initI18n = () => {
    const config = getConfig();
    selectedLanguage = config.i18n?.currentLanguage || "en";
    i18n = i18nBase.loadTranslations(selectedLanguage);
};

// Theme integration (diogenes pattern)
const getCurrentTheme = () => getConfig().themes?.current || "Dark-MCP";

// Main template wrapper (diogenes pattern)
const template = (titlePrefix, ...elements) => {
    initI18n();
    const theme = getCurrentTheme();
    
    return html(
        head(
            title(`${titlePrefix} - ${i18n.appTitle || 'Zeus MCP Interface'}`),
            link({ rel: 'stylesheet', href: `/themes/${theme}.css` }),
            meta({ charset: 'utf-8' }),
            meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' })
        ),
        body({ class: `theme-${theme}` },
            renderNavigation(),
            main({ class: 'content' }, ...elements)
        )
    );
};
```

### Navigation Component (Diogenes Style)
```javascript
// Navigation with feature toggles (diogenes pattern)
const renderNavigation = () => {
    const config = getConfig();
    initI18n();
    
    return nav({ class: 'main-nav' },
        ul(
            navLink({ href: "/", emoji: "🏠", text: i18n.navigation?.home || "Home" }),
            config.modules.aiMod === 'on' ? navLink({ 
                href: "/ai", 
                emoji: "🤖", 
                text: i18n.navigation?.ai || "AI" 
            }) : '',
            config.modules.presetsMod === 'on' ? navLink({ 
                href: "/presets", 
                emoji: "📋", 
                text: i18n.navigation?.presets || "Presets" 
            }) : '',
            config.modules.editorMod === 'on' ? navLink({ 
                href: "/editor", 
                emoji: "🔧", 
                text: i18n.navigation?.editor || "Editor" 
            }) : '',
            navLink({ 
                href: "/settings", 
                emoji: "⚙️", 
                text: i18n.navigation?.settings || "Settings" 
            })
        )
    );
};

const navLink = ({ href, emoji, text, current }) =>
    li(
        a(
            { href, class: current ? "current" : "" },
            span({ class: "emoji" }, emoji),
            nbsp,
            text
        )
    );
```

## Configuration Pattern (Diogenes Style)

### Config Manager Implementation
```javascript
// configs/config-manager.js (Following diogenes pattern exactly)
const fs = require('fs');
const path = require('path');

let configCache = null;
const configPath = path.join(__dirname, 'zeus-config.json');

const getConfig = () => {
    if (!configCache) {
        configCache = loadConfig();
    }
    return configCache;
};

const setConfig = (updates) => {
    configCache = { ...configCache, ...updates };
    saveConfig(configCache);
    return configCache;
};

const loadConfig = () => {
    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            return { ...getDefaults(), ...JSON.parse(configData) };
        }
    } catch (error) {
        console.warn('Error loading config, using defaults:', error.message);
    }
    return getDefaults();
};

const saveConfig = (config) => {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving config:', error.message);
    }
};

const getDefaults = () => ({
    app: {
        name: "Zeus - MCP Mesh SDK",
        version: "1.0.0",
        port: 3011
    },
    themes: {
        current: "Dark-MCP",
        available: ["Dark-MCP", "Clear-MCP", "Purple-MCP", "Matrix-MCP", "Orange-Dark-MCP"]
    },
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
    },
    i18n: {
        currentLanguage: "en",
        availableLanguages: ["en"]
    }
});

module.exports = { getConfig, setConfig };
```

### Feature Toggle Usage
```javascript
const { getConfig } = require('../configs/config-manager.js');

const renderConditionalFeature = (moduleName, content) => {
    const config = getConfig();
    return config.modules[moduleName] === 'on' ? content : '';
};

// Usage in views
const myView = () => {
    return template(
        'My Page',
        section(
            h1('My Content'),
            renderConditionalFeature('aiMod', 
                div({ class: 'ai-section' },
                    h2('AI Features'),
                    // AI content here
                )
            )
        )
    );
};
```

## Server Pattern (Diogenes Style)

### Main Server Structure
```javascript
// server/ZeusServer.js (Similar to diogenes SSB_server.js)
const express = require('express');
const path = require('path');
const { getConfig } = require('../configs/config-manager.js');

const ZeusServer = {
    app: null,
    server: null,
    
    init() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        return this;
    },
    
    setupMiddleware() {
        // Static files
        this.app.use(express.static(path.join(__dirname, '../client/assets')));
        
        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // CORS if needed
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    },
    
    setupRoutes() {
        // Main routes
        this.app.get('/', this.handleHome);
        this.app.get('/ai', this.handleAI);
        this.app.get('/presets', this.handlePresets);
        this.app.get('/editor', this.handleEditor);
        this.app.get('/settings', this.handleSettings);
        
        // API routes
        this.app.use('/api', require('./routes/api'));
        
        // Error handling
        this.app.use(this.handleError);
    },
    
    handleHome(req, res) {
        const { homeView } = require('../views/home_view');
        res.send(homeView());
    },
    
    handleError(err, req, res, next) {
        console.error('Server error:', err);
        const { errorView } = require('../views/error_views');
        res.status(500).send(errorView('Internal Server Error'));
    },
    
    start(port) {
        const config = getConfig();
        const serverPort = port || config.app.port || 3011;
        
        this.server = this.app.listen(serverPort, () => {
            console.log(`Zeus server running on port ${serverPort}`);
        });
        
        return this.server;
    },
    
    stop() {
        if (this.server) {
            this.server.close();
        }
    }
};

module.exports = ZeusServer;
```

## Theme System (Diogenes Compatible)

### CSS Theme Structure
```css
/* client/assets/themes/Dark-MCP.css */
:root {
    /* Diogenes-compatible CSS variables */
    --primary-bg: #1a1a1a;
    --secondary-bg: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --accent-color: #007acc;
    --border-color: #444444;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --error-color: #dc3545;
}

/* Base styles matching diogenes */
body {
    background-color: var(--primary-bg);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    margin: 0;
    padding: 0;
}

.main-nav {
    background-color: var(--secondary-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem;
}

.main-nav ul {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
}

.main-nav a {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.main-nav a:hover,
.main-nav a.current {
    background-color: var(--accent-color);
    color: var(--text-primary);
}

/* Component styles */
.content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.card {
    background-color: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}
```

### Theme Switching Implementation
```javascript
// client/assets/js/theme-switcher.js
const ThemeSwitcher = {
    init() {
        this.bindEvents();
        this.loadTheme();
    },
    
    bindEvents() {
        document.addEventListener('change', (e) => {
            if (e.target.matches('[name="theme"]')) {
                this.switchTheme(e.target.value);
            }
        });
    },
    
    loadTheme() {
        // Theme is loaded via server-side rendering
        // This just handles client-side switches
    },
    
    switchTheme(themeName) {
        // Update via API
        fetch('/api/settings/theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: themeName })
        })
        .then(() => {
            // Reload to apply new theme
            window.location.reload();
        })
        .catch(console.error);
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => ThemeSwitcher.init());
}
```

## Implementation Checklist

### View Implementation
- [ ] Import required hyperaxe elements
- [ ] Initialize i18n system correctly
- [ ] Use template wrapper function
- [ ] Implement feature toggles via config
- [ ] Follow diogenes navigation pattern
- [ ] Use consistent CSS classes and structure

### Configuration Integration  
- [ ] Use getConfig() for all settings
- [ ] Implement feature flags correctly
- [ ] Support theme switching
- [ ] Handle i18n language changes
- [ ] Provide sensible defaults

### Server Integration
- [ ] Follow express.js patterns from diogenes
- [ ] Implement proper error handling
- [ ] Use configuration for all settings
- [ ] Support static asset serving
- [ ] Implement consistent routing patterns

### Theme Compatibility
- [ ] Use diogenes CSS variable names
- [ ] Match diogenes component styling
- [ ] Support all available themes
- [ ] Enable runtime theme switching
- [ ] Maintain responsive design

## Quality Standards

- **Consistency**: All patterns must match diogenes exactly
- **Configuration**: No hardcoded values, everything configurable
- **Documentation**: Clear English comments explaining functionality
- **Error Handling**: Comprehensive error management throughout
- **Performance**: Efficient rendering and minimal client-side JavaScript

Follow these patterns exactly to ensure Zeus integrates seamlessly with the diogenes ecosystem while maintaining all asterion functionality.