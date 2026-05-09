const { getConfig, setTheme } = require('../configs/config-manager');
const fs = require('fs');
const path = require('path');

class ThemeHandler {
  constructor() {
    this.themesPath = path.join(__dirname, '..', 'client', 'assets', 'themes');
    this.availableThemes = [
      'Black-White-MCP',
      'Clear-MCP',
      'Dark-MCP',
      'Matrix-MCP',
      'Purple-MCP',
      'Orange-Dark-MCP'
    ];
  }

  getAvailableThemes() {
    return this.availableThemes;
  }

  getCurrentTheme() {
    const config = getConfig();
    return config.theme.current || 'Black-White-MCP';
  }

  switchTheme(themeName) {
    if (!this.availableThemes.includes(themeName)) {
      throw new Error(`Theme '${themeName}' not available`);
    }

    try {
      const config = setTheme(themeName);
      return {
        success: true,
        currentTheme: config.theme.current,
        message: `Theme switched to ${themeName}`
      };
    } catch (error) {
      console.error('Error switching theme:', error);
      throw error;
    }
  }

  getThemeCSS(themeName) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const themePath = path.join(__dirname, '..', 'client', 'assets', 'themes', `${themeName}.css`);
      if (fs.existsSync(themePath)) {
        return fs.readFileSync(themePath, 'utf8');
      } else {
        console.warn(`Theme file not found: ${themePath}`);
        // Fallback to Black-White-MCP theme
        const defaultPath = path.join(__dirname, '..', 'client', 'assets', 'themes', 'Black-White-MCP.css');
        return fs.readFileSync(defaultPath, 'utf8');
      }
    } catch (error) {
      console.error('Error loading theme CSS:', error);
      // Return minimal fallback CSS using Asterion variables
      return `:root { 
        --primary-color: #2563EB; 
        --background-primary: #FFFFFF; 
        --text-primary: #0F172A; 
        --success-color: #059669; 
        --warning-color: #D97706; 
        --danger-color: #DC2626; 
      }`;
    }
  }

  validateTheme(themeName) {
    return this.availableThemes.includes(themeName);
  }

  getThemePreview(themeName) {
    // Placeholder for theme preview generation
    return {
      name: themeName,
      primaryColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      preview: `Preview for ${themeName} theme - not implemented yet`
    };
  }
}

module.exports = ThemeHandler;