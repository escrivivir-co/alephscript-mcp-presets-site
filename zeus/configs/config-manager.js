const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'zeus-config.json');

if (!fs.existsSync(configFilePath)) {
  const defaultConfig = {
    "server": {
      "port": 3012,
      "host": "localhost"
    },
    "features": {
      "aiConversations": true,
      "presetLibrary": true,
      "mcpExplorer": true,
      "themeSystem": true
    },
    "theme": {
      "current": "Clear-MCP"
    },
    "ai": {
      "endpoint": "http://localhost:4001",
      "maxTokens": 2000,
      "temperature": 0.7
    },
    "mcp": {
      "servers": [],
      "timeout": 30000
    },
    "presets": {
      "library": "default",
      "autoLoad": true
    },
    "ui": {
      "language": "en",
      "animations": true,
      "darkMode": false
    },
    "debug": false
  };

  fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, null, 2));
  console.log('Default zeus-config.json created');
}

function getConfig() {
  try {
    const configData = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading config:', error);
    throw error;
  }
}

function updateConfig(newConfig) {
  try {
    const currentConfig = getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    fs.writeFileSync(configFilePath, JSON.stringify(updatedConfig, null, 2));
    return updatedConfig;
  } catch (error) {
    console.error('Error updating config:', error);
    throw error;
  }
}

function setTheme(themeName) {
  try {
    const config = getConfig();
    config.theme.current = themeName;
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    return config;
  } catch (error) {
    console.error('Error setting theme:', error);
    throw error;
  }
}

function toggleFeature(featureName) {
  try {
    const config = getConfig();
    if (config.features.hasOwnProperty(featureName)) {
      config.features[featureName] = !config.features[featureName];
      fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    }
    return config;
  } catch (error) {
    console.error('Error toggling feature:', error);
    throw error;
  }
}

function isFeatureEnabled(featureName) {
  try {
    const config = getConfig();
    return config.features[featureName] === true;
  } catch (error) {
    console.error('Error checking feature:', error);
    return false;
  }
}

// ====================================================================
// SPRINT 04: ENHANCED CONFIGURATION MANAGEMENT
// ====================================================================

/**
 * Update a specific section of configuration
 * @param {string} section - Configuration section to update
 * @param {object} updates - Updates to apply to the section
 * @returns {object} Updated configuration
 */
function updateSection(section, updates) {
  try {
    const config = getConfig();
    
    // Validate section exists
    if (!config.hasOwnProperty(section)) {
      throw new Error(`Configuration section '${section}' does not exist`);
    }
    
    // Apply updates to section
    config[section] = { ...config[section], ...updates };
    
    // Save and return updated config
    return updateConfig(config);
  } catch (error) {
    console.error(`Error updating section ${section}:`, error);
    throw error;
  }
}

/**
 * Validate configuration section
 * @param {string} section - Section to validate
 * @param {object} data - Data to validate
 * @returns {object} Validation result
 */
function validateSection(section, data) {
  const result = { isValid: true, errors: [] };
  
  try {
    switch (section) {
      case 'theme':
        if (data.current) {
          const validThemes = ['Clear-MCP', 'Dark-MCP', 'Matrix-MCP', 'Purple-MCP', 'Orange-Dark-MCP'];
          if (!validThemes.includes(data.current)) {
            result.isValid = false;
            result.errors.push(`Invalid theme: ${data.current}. Valid themes: ${validThemes.join(', ')}`);
          }
        }
        break;
        
      case 'ui':
        if (data.language) {
          const validLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
          if (!validLanguages.includes(data.language)) {
            result.isValid = false;
            result.errors.push(`Invalid language: ${data.language}. Valid languages: ${validLanguages.join(', ')}`);
          }
        }
        if (typeof data.animations === 'string' && !['true', 'false'].includes(data.animations)) {
          result.isValid = false;
          result.errors.push('Animations must be boolean');
        }
        if (typeof data.darkMode === 'string' && !['true', 'false'].includes(data.darkMode)) {
          result.isValid = false;
          result.errors.push('Dark mode must be boolean');
        }
        break;
        
      case 'ai':
        if (data.endpoint) {
          try {
            new URL(data.endpoint);
          } catch (e) {
            result.isValid = false;
            result.errors.push('Invalid AI endpoint URL format');
          }
        }
        if (data.maxTokens && (data.maxTokens < 1 || data.maxTokens > 10000)) {
          result.isValid = false;
          result.errors.push('Max tokens must be between 1 and 10000');
        }
        if (data.temperature && (data.temperature < 0 || data.temperature > 2)) {
          result.isValid = false;
          result.errors.push('Temperature must be between 0 and 2');
        }
        break;
        
      case 'server':
        if (data.port && (data.port < 1000 || data.port > 65535)) {
          result.isValid = false;
          result.errors.push('Server port must be between 1000 and 65535');
        }
        if (data.host && typeof data.host !== 'string') {
          result.isValid = false;
          result.errors.push('Server host must be a string');
        }
        break;
        
      case 'features':
        // Validate that all feature values are booleans
        for (const [key, value] of Object.entries(data)) {
          if (typeof value !== 'boolean') {
            result.isValid = false;
            result.errors.push(`Feature '${key}' must be boolean`);
          }
        }
        break;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Validation error: ${error.message}`);
  }
  
  return result;
}

/**
 * Get configuration defaults for a specific section
 * @param {string} section - Configuration section
 * @returns {object} Default configuration for section
 */
function getSectionDefaults(section) {
  const defaultConfig = {
    "server": {
      "port": 3012,
      "host": "localhost"
    },
    "features": {
      "aiConversations": true,
      "presetLibrary": true,
      "mcpExplorer": true,
      "themeSystem": true
    },
    "theme": {
      "current": "Clear-MCP"
    },
    "ai": {
      "endpoint": "http://localhost:4001",
      "maxTokens": 2000,
      "temperature": 0.7
    },
    "mcp": {
      "servers": [],
      "timeout": 30000
    },
    "presets": {
      "library": "default",
      "autoLoad": true
    },
    "ui": {
      "language": "en",
      "animations": true,
      "darkMode": false
    }
  };
  
  return defaultConfig[section] || {};
}

/**
 * Reset a configuration section to defaults
 * @param {string} section - Section to reset
 * @returns {object} Updated configuration
 */
function resetSection(section) {
  try {
    const defaults = getSectionDefaults(section);
    return updateSection(section, defaults);
  } catch (error) {
    console.error(`Error resetting section ${section}:`, error);
    throw error;
  }
}

/**
 * Set language preference
 * @param {string} language - Language code
 * @returns {object} Updated configuration
 */
function setLanguage(language) {
  try {
    const validation = validateSection('ui', { language });
    if (!validation.isValid) {
      throw new Error(`Invalid language: ${validation.errors.join(', ')}`);
    }
    
    return updateSection('ui', { language });
  } catch (error) {
    console.error('Error setting language:', error);
    throw error;
  }
}

/**
 * Update UI preferences
 * @param {object} preferences - UI preferences to update
 * @returns {object} Updated configuration
 */
function updateUIPreferences(preferences) {
  try {
    const validation = validateSection('ui', preferences);
    if (!validation.isValid) {
      throw new Error(`Invalid UI preferences: ${validation.errors.join(', ')}`);
    }
    
    return updateSection('ui', preferences);
  } catch (error) {
    console.error('Error updating UI preferences:', error);
    throw error;
  }
}

/**
 * Get current language setting
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
  try {
    const config = getConfig();
    return config.ui?.language || 'en';
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'en';
  }
}

module.exports = {
  getConfig,
  updateConfig,
  setTheme,
  toggleFeature,
  isFeatureEnabled,
  // Sprint 04 enhancements
  updateSection,
  validateSection,
  getSectionDefaults,
  resetSection,
  setLanguage,
  updateUIPreferences,
  getCurrentLanguage
};