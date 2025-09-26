const express = require('../server/node_modules/express');
const { getConfig, setTheme } = require('../configs/config-manager');
const ThemeHandler = require('./themeHandler');

const router = express.Router();
const themeHandler = new ThemeHandler();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'zeus-backend', 
    timestamp: new Date().toISOString() 
  });
});

// Configuration endpoints
router.get('/config', (req, res) => {
  try {
    const config = getConfig();
    // Don't expose sensitive config data
    const publicConfig = {
      features: config.features,
      theme: config.theme,
      ui: config.ui
    };
    res.json(publicConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// AI conversation endpoints (placeholder)
router.get('/ai/conversations', (req, res) => {
  res.json({ 
    conversations: [],
    message: 'AI conversation endpoints not implemented yet'
  });
});

router.post('/ai/chat', (req, res) => {
  res.json({ 
    error: 'AI chat endpoint not implemented yet',
    received: req.body
  });
});

// Preset library endpoints (placeholder)
router.get('/presets', (req, res) => {
  res.json({ 
    presets: [],
    message: 'Preset library endpoints not implemented yet'
  });
});

router.post('/presets', (req, res) => {
  res.json({ 
    error: 'Preset creation endpoint not implemented yet',
    received: req.body
  });
});

// MCP server endpoints (placeholder)
router.get('/mcp/servers', (req, res) => {
  res.json({ 
    servers: [],
    message: 'MCP server endpoints not implemented yet'
  });
});

router.get('/mcp/tools', (req, res) => {
  res.json({ 
    tools: [],
    message: 'MCP tools endpoint not implemented yet'
  });
});

// Theme endpoints (diogenes-compatible)
router.get('/themes', (req, res) => {
  try {
    const themes = themeHandler.getAvailableThemes();
    const current = themeHandler.getCurrentTheme();
    res.json({ themes, current });
  } catch (error) {
    console.error('Error listing themes:', error);
    res.status(500).json({ error: 'Failed to list themes' });
  }
});

// Alias for single theme status (optional)
router.get('/theme', (req, res) => {
  try {
    const current = themeHandler.getCurrentTheme();
    res.json({ current });
  } catch (error) {
    console.error('Error getting current theme:', error);
    res.status(500).json({ error: 'Failed to get current theme' });
  }
});

// Frontend uses '/api/theme/switch'
router.post('/theme/switch', (req, res) => {
  try {
    const { theme } = req.body || {};
    if (!theme) {
      return res.status(400).json({ error: "Missing 'theme' in request body" });
    }
    if (!themeHandler.validateTheme(theme)) {
      return res.status(400).json({ error: `Theme '${theme}' not available` });
    }
    const result = themeHandler.switchTheme(theme);
    res.json(result);
  } catch (error) {
    console.error('Error switching theme:', error);
    res.status(500).json({ error: 'Failed to switch theme' });
  }
});

// Backward-compatible alias
router.post('/themes/switch', (req, res) => {
  // Delegate to the canonical endpoint
  req.url = '/theme/switch';
  router.handle(req, res);
});

module.exports = router;