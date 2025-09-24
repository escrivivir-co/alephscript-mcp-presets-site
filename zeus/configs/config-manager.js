const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'zeus-config.json');

if (!fs.existsSync(configFilePath)) {
  const defaultConfig = {
    "server": {
      "port": 3000,
      "host": "localhost"
    },
    "features": {
      "aiConversations": true,
      "presetLibrary": true,
      "mcpExplorer": true,
      "themeSystem": true
    },
    "theme": {
      "current": "default"
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

module.exports = {
  getConfig,
  updateConfig,
  setTheme,
  toggleFeature,
  isFeatureEnabled
};