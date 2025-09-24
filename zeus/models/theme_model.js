// Theme configuration model - following diogenes pattern

class ThemeModel {
  constructor(data = {}) {
    this.name = data.name || 'default';
    this.displayName = data.displayName || 'Default Theme';
    this.description = data.description || 'Default theme for Zeus';
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
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      background: '#ffffff',
      text: '#212529',
      textMuted: '#6c757d',
      border: '#dee2e6'
    };
  }

  getDefaultFonts() {
    return {
      primary: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      monospace: "'Consolas', 'Monaco', 'Lucida Console', monospace",
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
    // Generate CSS variables for the theme
    let css = ':root {\n';
    
    // Colors
    Object.entries(this.colors).forEach(([name, value]) => {
      css += `  --color-${name}: ${value};\n`;
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