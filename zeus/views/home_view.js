const { div, h1, h2, p, section, article, ul, li, a, span, button } = require('hyperaxe');
const { template, pageContainer, contentSection } = require('./main_views');

/**
 * Home view implementation
 * Landing page with navigation integration and theme preview
 */
const homeView = (options = {}) => {
  const config = require('../configs/config-manager.js').getConfig();
  
  return template(
    'Home',
    pageContainer(
      // Hero section
      contentSection(
        'Zeus MCP Mesh SDK',
        section({ class: 'hero-section' },
          div({ class: 'hero-content' },
            h2({ class: 'hero-subtitle' }, 'Web Interface for Model Context Protocol'),
            p({ class: 'hero-description' },
              'Explore, manage, and interact with MCP servers through an intuitive web interface. ',
              'Create conversation presets, manage themes, and streamline your AI workflow.'
            ),
            div({ class: 'hero-actions' },
              a({ href: '/ai', class: 'btn btn-primary' }, '🤖 Start AI Chat'),
              a({ href: '/presets', class: 'btn btn-secondary' }, '📚 Browse Presets')
            )
          )
        ),
        { class: 'hero-container' }
      ),
      
      // Features section
      contentSection(
        'Key Features',
        div({ class: 'features-grid' },
          featureCard({
            emoji: '🤖',
            title: 'AI Conversations',
            description: 'Chat with AI models using customizable conversation presets and contexts.',
            link: '/ai'
          }),
          featureCard({
            emoji: '📚',
            title: 'Preset Library',
            description: 'Manage and organize conversation presets for different use cases and workflows.',
            link: '/presets'
          }),
          featureCard({
            emoji: '🔧',
            title: 'MCP Editor',
            description: 'Explore MCP servers, browse available tools, resources, and prompts.',
            link: '/mcp'
          }),
          featureCard({
            emoji: '🎨',
            title: 'Theme System',
            description: 'Customize the interface appearance with multiple built-in themes.',
            link: '/settings'
          }),
          featureCard({
            emoji: '📊',
            title: 'Statistics',
            description: 'Track usage metrics, performance data, and system status information.',
            link: '/stats'
          }),
          featureCard({
            emoji: '⚙️',
            title: 'Configuration',
            description: 'Manage application settings, features, and system preferences.',
            link: '/settings'
          })
        )
      ),
      
      // Theme preview section
      contentSection(
        'Theme Preview',
        div({ class: 'theme-preview-section' },
          p({ class: 'text-muted mb-2' },
            `Current theme: ${config.theme.current || 'default'}`
          ),
          themePreview(config.theme.current || 'default')
        )
      ),
      
      // Status section
      contentSection(
        'System Status',
        div({ class: 'status-grid' },
          statusCard('Server', config.server ? '✅ Running' : '❌ Offline', 'success'),
          statusCard('AI Conversations', config.features.aiConversations ? '✅ Enabled' : '❌ Disabled'),
          statusCard('Preset Library', config.features.presetLibrary ? '✅ Enabled' : '❌ Disabled'),
          statusCard('MCP Explorer', config.features.mcpExplorer ? '✅ Enabled' : '❌ Disabled'),
          statusCard('Theme System', config.features.themeSystem ? '✅ Enabled' : '❌ Disabled')
        )
      )
    ),
    { currentPage: 'home' }
  );
};

/**
 * Feature card component
 */
const featureCard = ({ emoji, title, description, link }) => {
  return div({ class: 'feature-card' },
    div({ class: 'feature-icon' }, emoji),
    h2({ class: 'feature-title' }, title),
    p({ class: 'feature-description' }, description),
    a({ href: link, class: 'feature-link' }, 'Learn more →')
  );
};

/**
 * Theme preview component
 */
const themePreview = (currentTheme) => {
  const themes = ['Clear-MCP', 'Dark-MCP', 'Matrix-MCP', 'Purple-MCP', 'Orange-Dark-MCP'];
  
  return div({ class: 'theme-preview-grid' },
    themes.map(theme => 
      div({ 
        class: `theme-preview-item ${theme === currentTheme ? 'current' : ''}` 
      },
        div({ class: `theme-sample theme-sample-${theme}` }),
        span({ class: 'theme-name' }, theme.replace('-MCP', '')),
        theme === currentTheme && span({ class: 'current-badge' }, 'Current')
      )
    )
  );
};

/**
 * Status card component
 */
const statusCard = (label, status, type = 'info') => {
  return div({ class: `status-card status-${type}` },
    div({ class: 'status-label' }, label),
    div({ class: 'status-value' }, status)
  );
};

module.exports = { homeView };