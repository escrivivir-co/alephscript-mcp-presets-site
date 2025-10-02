const express = require('express');
const { getConfig, setTheme } = require('../configs/config-manager');
const ThemeHandler = require('./themeHandler');

// Import the new comprehensive API routes
const apiRoutes = require('../server/api_routes');

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

// Integrate comprehensive API routes for Phase 5 advanced views
// All AI, Preset, MCP, and Statistics endpoints are now handled by apiRoutes
router.use('/', apiRoutes);

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

// ====================================================================
// SPRINT 04: ENHANCED SETTINGS API ENDPOINTS
// ====================================================================

// Get all settings for Settings view
router.get('/settings', (req, res) => {
  try {
    const config = getConfig();
    const settings = {
      theme: config.theme,
      ui: config.ui,
      features: config.features,
      ai: {
        endpoint: config.ai.endpoint,
        maxTokens: config.ai.maxTokens,
        temperature: config.ai.temperature
      },
      mcp: {
        servers: config.mcp.servers,
        timeout: config.mcp.timeout
      },
      presets: config.presets,
      server: {
        port: config.server.port,
        host: config.server.host
      }
    };
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update specific settings section
router.put('/settings/:section', (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;
    
    // Validate section exists
    const validSections = ['theme', 'ui', 'features', 'ai', 'mcp', 'presets', 'server'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ 
        error: `Invalid section: ${section}. Valid sections: ${validSections.join(', ')}` 
      });
    }
    
    const { updateConfig } = require('../configs/config-manager');
    const config = getConfig();
    
    // Section-specific validation
    if (section === 'theme' && updates.current) {
      if (!themeHandler.validateTheme(updates.current)) {
        return res.status(400).json({ error: `Invalid theme: ${updates.current}` });
      }
    }
    
    if (section === 'ui' && updates.language) {
      const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
      if (!validLanguages.includes(updates.language)) {
        return res.status(400).json({ 
          error: `Invalid language: ${updates.language}. Valid languages: ${validLanguages.join(', ')}` 
        });
      }
    }
    
    if (section === 'ai' && updates.endpoint) {
      // Basic URL validation
      try {
        new URL(updates.endpoint);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid AI endpoint URL format' });
      }
    }
    
    // Apply updates to specific section
    const updatedSection = { ...config[section], ...updates };
    const newConfig = { ...config, [section]: updatedSection };
    const savedConfig = updateConfig(newConfig);
    
    res.json({ 
      success: true, 
      section, 
      updated: updates,
      current: savedConfig[section],
      message: `${section} settings updated successfully`
    });
  } catch (error) {
    console.error(`Error updating ${req.params.section}:`, error);
    res.status(500).json({ error: `Failed to update ${req.params.section} settings` });
  }
});

// Validate settings without saving
router.post('/settings/validate', (req, res) => {
  try {
    const { section, data } = req.body;
    
    if (!section || !data) {
      return res.status(400).json({ error: 'Missing section or data in request' });
    }
    
    const validSections = ['theme', 'ui', 'features', 'ai', 'mcp', 'presets'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ error: `Invalid section: ${section}` });
    }
    
    let isValid = true;
    let errors = [];
    
    // Validation logic by section
    switch (section) {
      case 'theme':
        if (data.current && !themeHandler.validateTheme(data.current)) {
          isValid = false;
          errors.push(`Invalid theme: ${data.current}`);
        }
        break;
      case 'ui':
        if (data.language) {
          const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
          if (!validLanguages.includes(data.language)) {
            isValid = false;
            errors.push(`Invalid language: ${data.language}`);
          }
        }
        break;
      case 'ai':
        if (data.endpoint) {
          try {
            new URL(data.endpoint);
          } catch (e) {
            isValid = false;
            errors.push('Invalid AI endpoint URL format');
          }
        }
        if (data.maxTokens && (data.maxTokens < 1 || data.maxTokens > 10000)) {
          isValid = false;
          errors.push('Max tokens must be between 1 and 10000');
        }
        if (data.temperature && (data.temperature < 0 || data.temperature > 2)) {
          isValid = false;
          errors.push('Temperature must be between 0 and 2');
        }
        break;
    }
    
    res.json({ 
      isValid, 
      errors,
      section,
      message: isValid ? 'Validation passed' : 'Validation failed'
    });
  } catch (error) {
    console.error('Error validating settings:', error);
    res.status(500).json({ error: 'Failed to validate settings' });
  }
});

// ====================================================================
// UI/LANGUAGE CONFIGURATION ENDPOINTS
// ====================================================================

// Get available languages
router.get('/ui/languages', (req, res) => {
  try {
    const availableLanguages = [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'es', name: 'Spanish', native: 'Español' },
      { code: 'fr', name: 'French', native: 'Français' },
      { code: 'de', name: 'German', native: 'Deutsch' },
      { code: 'it', name: 'Italian', native: 'Italiano' },
      { code: 'pt', name: 'Portuguese', native: 'Português' },
      { code: 'ru', name: 'Russian', native: 'Русский' },
      { code: 'ja', name: 'Japanese', native: '日本語' },
      { code: 'ko', name: 'Korean', native: '한국어' },
      { code: 'zh', name: 'Chinese', native: '中文' }
    ];
    
    const config = getConfig();
    const currentLanguage = config.ui.language || 'en';
    
    res.json({ 
      languages: availableLanguages,
      current: currentLanguage,
      message: 'Available languages retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch available languages' });
  }
});

// Update language setting
router.put('/ui/language', (req, res) => {
  try {
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({ error: 'Missing language in request body' });
    }
    
    const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ 
        error: `Invalid language: ${language}. Valid languages: ${validLanguages.join(', ')}` 
      });
    }
    
    const { updateConfig } = require('../configs/config-manager');
    const config = getConfig();
    config.ui.language = language;
    const updatedConfig = updateConfig(config);
    
    res.json({ 
      success: true, 
      language: updatedConfig.ui.language,
      message: `Language updated to ${language}`
    });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// Update UI preferences
router.put('/ui/preferences', (req, res) => {
  try {
    const preferences = req.body;
    
    if (!preferences || Object.keys(preferences).length === 0) {
      return res.status(400).json({ error: 'Missing preferences in request body' });
    }
    
    const { updateConfig } = require('../configs/config-manager');
    const config = getConfig();
    
    // Update UI preferences
    config.ui = { ...config.ui, ...preferences };
    const updatedConfig = updateConfig(config);
    
    res.json({ 
      success: true, 
      preferences: updatedConfig.ui,
      message: 'UI preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating UI preferences:', error);
    res.status(500).json({ error: 'Failed to update UI preferences' });
  }
});

// ====================================================================
// MCP SERVER CONFIGURATION ENDPOINTS  
// ====================================================================

// Get MCP server configuration
router.get('/mcp/servers/config', (req, res) => {
  try {
    const config = getConfig();
    const mcpConfig = {
      servers: config.mcp.servers || [],
      timeout: config.mcp.timeout || 600000, // 10 minutes for SLM inference
      settings: {
        autoConnect: config.mcp.autoConnect || false,
        retryAttempts: config.mcp.retryAttempts || 3,
        healthCheckInterval: config.mcp.healthCheckInterval || 60000
      }
    };
    
    res.json(mcpConfig);
  } catch (error) {
    console.error('Error fetching MCP configuration:', error);
    res.status(500).json({ error: 'Failed to fetch MCP server configuration' });
  }
});

// Update MCP server configuration
router.put('/mcp/servers/config', (req, res) => {
  try {
    const mcpUpdates = req.body;
    
    if (!mcpUpdates || Object.keys(mcpUpdates).length === 0) {
      return res.status(400).json({ error: 'Missing MCP configuration in request body' });
    }
    
    const { updateConfig } = require('../configs/config-manager');
    const config = getConfig();
    
    // Update MCP configuration
    config.mcp = { ...config.mcp, ...mcpUpdates };
    const updatedConfig = updateConfig(config);
    
    res.json({ 
      success: true, 
      mcpConfig: updatedConfig.mcp,
      message: 'MCP server configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating MCP configuration:', error);
    res.status(500).json({ error: 'Failed to update MCP server configuration' });
  }
});

module.exports = router;