// Theme configuration model - following diogenes pattern

class ThemeModel {
  constructor(data = {}) {
    this.name = data.name || 'Black-White-MCP';
    this.displayName = data.displayName || 'Black & White MCP';
    this.description = data.description || 'Default monochrome MCP theme for Zeus with Courier New typography';
    this.colors = data.colors || this.getDefaultColors();
    this.fonts = data.fonts || this.getDefaultFonts();
    this.layout = data.layout || this.getDefaultLayout();
    this.isBuiltIn = data.isBuiltIn || true;
    this.isCustom = data.isCustom || false;
    this.version = data.version || '1.0.0';
    this.author = data.author || 'Zeus Team';
    this.cssPath = data.cssPath || null;
    this.previewImage = data.previewImage || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  getDefaultColors() {
    return {
      primary: '#000000',
      secondary: '#3a3a3a',
      success: '#111111',
      danger: '#000000',
      warning: '#555555',
      info: '#333333',
      light: '#f7f7f7',
      dark: '#000000',
      background: '#ffffff',
      text: '#000000',
      textMuted: '#3a3a3a',
      border: '#000000'
    };
  }

  getDefaultFonts() {
    return {
      primary: "'Courier New', Courier, monospace",
      monospace: "'Courier New', Courier, monospace",
      sizes: {
        small: '0.875rem',
        normal: '1rem',
        large: '1.25rem',
        xlarge: '1.5rem'
      }
    };
  }

  getDefaultLayout() {
    return {
      sidebar: {
        width: '250px',
        collapsed: false
      },
      header: {
        height: '60px',
        fixed: true
      },
      content: {
        padding: '1rem',
        maxWidth: '1200px'
      },
      borderRadius: '0.375rem',
      shadows: {
        small: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        medium: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
        large: '0 1rem 3rem rgba(0, 0, 0, 0.175)'
      }
    };
  }

  setColor(colorName, colorValue) {
    if (this.colors.hasOwnProperty(colorName)) {
      this.colors[colorName] = colorValue;
      this.updatedAt = new Date().toISOString();
    }
  }

  setFont(fontProperty, fontValue) {
    if (fontProperty === 'primary' || fontProperty === 'monospace') {
      this.fonts[fontProperty] = fontValue;
    } else if (this.fonts.sizes.hasOwnProperty(fontProperty)) {
      this.fonts.sizes[fontProperty] = fontValue;
    }
    this.updatedAt = new Date().toISOString();
  }

  generateCSS() {
    // Generate CSS variables for the theme using Asterion-compatible names
    let css = ':root {\n';
    
    // Map legacy keys to Asterion variable names when possible
    const colorMap = {
      primary: '--primary-color',
      success: '--success-color',
      danger: '--danger-color',
      warning: '--warning-color',
      info: '--info-color',
      background: '--background-primary',
      text: '--text-primary',
      border: '--border-color'
    };

    Object.entries(this.colors).forEach(([name, value]) => {
      const varName = colorMap[name] || `--color-${name}`;
      css += `  ${varName}: ${value};\n`;
    });
    
    // Fonts
    css += `  --font-primary: ${this.fonts.primary};\n`;
    css += `  --font-monospace: ${this.fonts.monospace};\n`;
    
    Object.entries(this.fonts.sizes).forEach(([name, value]) => {
      css += `  --font-size-${name}: ${value};\n`;
    });
    
    // Layout
    css += `  --sidebar-width: ${this.layout.sidebar.width};\n`;
    css += `  --header-height: ${this.layout.header.height};\n`;
    css += `  --content-padding: ${this.layout.content.padding};\n`;
    css += `  --content-max-width: ${this.layout.content.maxWidth};\n`;
    css += `  --border-radius: ${this.layout.borderRadius};\n`;
    
    Object.entries(this.layout.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });
    
    css += '}\n';
    
    return css;
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Theme name is required');
    }
    
    if (!this.displayName || this.displayName.trim().length === 0) {
      errors.push('Theme display name is required');
    }
    
    // Validate color format (simple hex check)
    Object.entries(this.colors).forEach(([name, value]) => {
      if (!/^#[0-9A-Fa-f]{6}$/.test(value) && !/^rgba?\(/.test(value)) {
        errors.push(`Invalid color format for ${name}: ${value}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  toJSON() {
    return {
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      colors: this.colors,
      fonts: this.fonts,
      layout: this.layout,
      isBuiltIn: this.isBuiltIn,
      isCustom: this.isCustom,
      version: this.version,
      author: this.author,
      cssPath: this.cssPath,
      previewImage: this.previewImage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new ThemeModel(data);
  }
}

module.exports = ThemeModel;