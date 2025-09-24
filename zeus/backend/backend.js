const express = require('../server/node_modules/express');
const { getConfig } = require('../configs/config-manager');

const router = express.Router();

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

// Theme endpoints (placeholder)
router.get('/themes', (req, res) => {
  res.json({ 
    themes: ['default', 'dark', 'light', 'blue', 'green'],
    current: 'default',
    message: 'Theme system not fully implemented yet'
  });
});

router.post('/themes/switch', (req, res) => {
  res.json({ 
    error: 'Theme switching endpoint not implemented yet',
    received: req.body
  });
});

module.exports = router;