const { div, html, head, body, title, meta, link, script, nav, ul, li, a, span, nbsp, main, footer, section } = require('hyperaxe');

/**
 * Main template wrapper following diogenes patterns
 * Base HTML structure for all Zeus views
 */
const template = (pageTitle, content, options = {}) => {
  const config = require('../configs/config-manager.js').getConfig();
  const currentTheme = config.theme.current || 'Black-White-MCP';
  
  return html({ lang: 'en' },
    head(
      meta({ charset: 'utf-8' }),
      meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      title(`${pageTitle} - Zeus MCP Mesh SDK`),
      
      // Theme CSS loading
      link({ 
        rel: 'stylesheet', 
        href: `/assets/themes/${currentTheme}.css` 
      }),
      
      // Base styles
      link({ 
        rel: 'stylesheet', 
        href: '/assets/styles/base.css' 
      }),
      
      // Page-specific CSS
      ...(options.styles ? options.styles.map(href => link({ rel: 'stylesheet', href })) : [])
    ),
    
    body({ class: `theme-${currentTheme} ${options.currentPage ? options.currentPage + '-page' : ''}` },
      navigation(options.currentPage),
      
      main({ class: 'main-content' },
        content
      ),
      
      footer({ class: 'main-footer' },
        div({ class: 'footer-content' },
          '© 2025 Zeus Team - MCP Mesh SDK'
        )
      ),
      
      // Base JavaScript
      script({ src: '/assets/js/base.js' }),
      
      // Page-specific JavaScript
      ...(options.scripts ? options.scripts.map(src => script({ src })) : [])
    )
  );
};

/**
 * Navigation component following diogenes pattern
 */
const navigation = (currentPage = '') => {
  return nav({ class: 'main-navigation' },
    ul({ class: 'nav-list' },
      navLink({ href: '/', emoji: '🏠', text: 'Home', current: currentPage === 'home' }),
      navLink({ href: '/presets', emoji: '📚', text: 'Preset Library', current: currentPage === 'presets' }),
      navLink({ href: '/ai', emoji: '🤖', text: 'AI Conversations', current: currentPage === 'ai' }),
  navLink({ href: '/editor', emoji: '🔧', text: 'MCP Editor', current: currentPage === 'mcp' }),
      navLink({ href: '/stats', emoji: '📊', text: 'Statistics', current: currentPage === 'stats' }),
      navLink({ href: '/settings', emoji: '⚙️', text: 'Settings', current: currentPage === 'settings' })
    )
  );
};

/**
 * Navigation link component following diogenes navigation pattern
 */
const navLink = ({ href, emoji, text, current }) =>
  li(
    a(
      { href, class: current ? "current" : "" },
      span({ class: "emoji" }, emoji),
      nbsp,
      text
    )
  );

/**
 * Page container for consistent layout
 */
const pageContainer = (content, options = {}) => {
  return section({ 
    class: `page-container ${options.class || ''}` 
  },
    content
  );
};

/**
 * Content section wrapper
 */
const contentSection = (title, content, options = {}) => {
  const { h1, h2, h3 } = require('hyperaxe');
  const HeaderTag = options.level === 2 ? h2 : options.level === 3 ? h3 : h1;
  
  return section({ class: `content-section ${options.class || ''}` },
    title && HeaderTag({ class: 'section-title' }, title),
    div({ class: 'section-content' },
      content
    )
  );
};

module.exports = {
  template,
  navigation,
  navLink,
  pageContainer,
  contentSection
};