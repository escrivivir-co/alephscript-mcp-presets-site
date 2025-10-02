/**
 * Preset Library View - Zeus MCP Mesh SDK
 * Clean architecture focusing on user experience and modern design
 * 
 * Key Principles:
 * - Progressive disclosure (show information when needed)
 * - Single responsibility (one component, one purpose)
 * - Clean visual hierarchy
 * - Smart integration of shared components
 */

const { div, h1, h2, h3, p, section, article, button, input, select, option, 
        form, label, textarea, ul, li, span, nav, a, header, main, aside } = require('hyperaxe');
const { template, pageContainer, contentSection } = require('./main_views');

// Import shared components selectively and strategically
const { 
  mcpServerBrowser,
  searchFilterBar 
} = require('./shared_components');

/**
 * Main preset library view - Clean and focused
 */
const presetView = (data = {}) => {
  const {
    presets = [],
    categories = ['General', 'Development', 'Analysis', 'Creative'],
    selectedPreset = null,
    filters = {},
    pagination = { page: 1, totalPages: 1, total: 0 },
    isLoading = false,
    error = null,
    showEditor = false,
    mcpServers = []
  } = data;

  return template(
    'Preset Library',
    pageContainer(
      section({ class: 'preset-library' },
        // Main header - clean and focused
        presetLibraryHeader({ presets, filters }),
        
        // Main content area with smart layout
        div({ class: 'library-content' },
          // Left sidebar - filters and actions
          presetSidebar({ categories, filters, mcpServers }),
          
          // Main area - presets or editor
          div({ class: 'library-main' },
            showEditor 
              ? presetEditorPanel({ selectedPreset, categories, mcpServers })
              : presetGrid({ presets, pagination, isLoading, error })
          )
        )
      )
    ),
    {
      currentPage: 'presets',
      styles: ['/assets/styles/preset-view.css'],
      scripts: ['/assets/js/preset-library.js']
    }
  );
};

/**
 * Clean, focused header with essential actions
 */
const presetLibraryHeader = ({ presets, filters }) => {
  const totalCount = presets.length;
  const filteredCount = filters.search ? 
    presets.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase())).length : 
    totalCount;

  return header({ class: 'library-header' },
    div({ class: 'header-content' },
      div({ class: 'header-title' },
        h1('Preset Library'),
        p({ class: 'header-subtitle' }, 
          `${filteredCount} of ${totalCount} presets${filters.search ? ` matching "${filters.search}"` : ''}`
        )
      ),
      
      div({ class: 'header-actions' },
        // Single, prominent search
        div({ class: 'search-container' },
          input({
            type: 'text',
            id: 'main-search',
            class: 'search-input',
            placeholder: 'Search presets...',
            value: filters.search || '',
            'data-action': 'search'
          }),
          button({ class: 'search-btn', 'data-action': 'search' }, '🔍')
        ),
        
        // Primary actions
        button({ 
          class: 'btn btn-primary',
          'data-action': 'create-preset'
        }, '+ Create Preset'),
        
        button({ 
          class: 'btn btn-secondary',
          'data-action': 'toggle-mcp-browser'
        }, '🔧 MCP Tools')
      )
    )
  );
};

/**
 * Smart sidebar with progressive disclosure
 */
const presetSidebar = ({ categories, filters, mcpServers }) => {
  return aside({ class: 'library-sidebar' },
    // Category filters - always visible but compact
    div({ class: 'filter-section' },
      h3('Categories'),
      ul({ class: 'category-list' },
        li(
          label({ class: 'category-item' },
            input({
              type: 'radio',
              name: 'category',
              value: '',
              checked: !filters.category,
              'data-action': 'filter-category'
            }),
            span('All Categories')
          )
        ),
        ...categories.map(category => 
          li(
            label({ class: 'category-item' },
              input({
                type: 'radio',
                name: 'category',
                value: category,
                checked: filters.category === category,
                'data-action': 'filter-category'
              }),
              span(category)
            )
          )
        )
      )
    ),

    // Sort options - compact
    div({ class: 'filter-section' },
      h3('Sort'),
      select({ 
        id: 'sort-select',
        'data-action': 'change-sort'
      },
        option({ value: 'updatedAt_desc', selected: true }, 'Recently Updated'),
        option({ value: 'name_asc' }, 'Name A-Z'),
        option({ value: 'createdAt_desc' }, 'Recently Created'),
        option({ value: 'usageCount_desc' }, 'Most Used')
      )
    ),

    // MCP Server status - collapsible and contextual
    mcpServerStatus({ mcpServers }),

    // View options
    div({ class: 'filter-section' },
      h3('View'),
      div({ class: 'view-toggle' },
        button({
          class: 'view-btn grid-view active',
          'data-view': 'grid',
          'data-action': 'change-view'
        }, '⊞'),
        button({
          class: 'view-btn list-view',
          'data-view': 'list', 
          'data-action': 'change-view'
        }, '☰')
      )
    )
  );
};

/**
 * Smart MCP server status - contextual and non-intrusive
 */
const mcpServerStatus = ({ mcpServers = [] }) => {
  const connectedServers = mcpServers.filter(s => s.status === 'connected');
  const hasServers = connectedServers.length > 0;

  if (!hasServers) {
    return div({ class: 'filter-section mcp-status' },
      h3('MCP Servers'),
      div({ class: 'mcp-empty' },
        span({ class: 'status-icon' }, '⚪'),
        p('No servers connected'),
        button({ 
          class: 'btn btn-small',
          'data-action': 'open-mcp-editor'
        }, 'Connect Server')
      )
    );
  }

  return div({ class: 'filter-section mcp-status' },
    h3('MCP Servers'),
    div({ class: 'mcp-summary' },
      span({ class: 'status-icon' }, '🟢'),
      p(`${connectedServers.length} server${connectedServers.length > 1 ? 's' : ''} connected`),
      button({ 
        class: 'btn btn-small',
        'data-action': 'toggle-mcp-details'
      }, 'Details')
    ),
    
    // Expandable server details
    div({ 
      class: 'mcp-details', 
      id: 'mcp-details',
      style: 'display: none;' 
    },
      ...connectedServers.map(server => 
        div({ class: 'server-item' },
          span({ class: 'server-name' }, server.name),
          span({ class: 'server-stats' }, 
            `${server.tools?.length || 0} tools, ${server.resources?.length || 0} resources`
          )
        )
      )
    )
  );
};

/**
 * Clean preset grid with improved cards
 */
const presetGrid = ({ presets, pagination, isLoading, error }) => {
  if (isLoading) {
    return div({ class: 'preset-grid loading' },
      div({ class: 'loading-spinner' }, 'Loading presets...')
    );
  }

  if (error) {
    return div({ class: 'preset-grid error' },
      div({ class: 'error-message' },
        h3('Error Loading Presets'),
        p(error.message || 'Unable to load presets'),
        button({ 
          class: 'btn btn-primary',
          'data-action': 'retry-load'
        }, 'Retry')
      )
    );
  }

  if (presets.length === 0) {
    return div({ class: 'preset-grid empty' },
      div({ class: 'empty-state' },
        span({ class: 'empty-icon' }, '📝'),
        h3('No Presets Found'),
        p('Create your first preset to get started with AI conversations.'),
        button({ 
          class: 'btn btn-primary',
          'data-action': 'create-preset'
        }, 'Create Your First Preset')
      )
    );
  }

  return div({ class: 'preset-grid' },
    div({ class: 'preset-items' },
      ...presets.map(preset => presetCard(preset))
    ),
    
    pagination.totalPages > 1 && presetPagination(pagination)
  );
};

/**
 * Improved preset card with better information hierarchy
 */
const presetCard = (preset) => {
  const hasServer = preset.mcpServerUrl && preset.mcpServerUrl !== '';
  const serverStatus = hasServer ? '🟢' : '⚪';
  const serverName = hasServer ? 
    (preset.mcpServerName || 'Connected Server') : 
    'No Server';

  return article({ 
    class: 'preset-card',
    'data-preset-id': preset.id 
  },
    div({ class: 'card-header' },
      div({ class: 'card-title' },
        h3(preset.name),
        span({ class: 'card-category' }, preset.category)
      ),
      div({ class: 'card-server' },
        span({ class: 'server-status' }, serverStatus),
        span({ class: 'server-name' }, serverName)
      )
    ),

    div({ class: 'card-content' },
      p({ class: 'card-description' }, 
        preset.description || 'No description provided'
      ),
      
      hasServer && div({ class: 'card-mcp-info' },
        span({ class: 'mcp-stats' }, 
          `${preset.toolCount || 0} tools available`
        )
      ),

      preset.tags && preset.tags.length > 0 && div({ class: 'card-tags' },
        ...preset.tags.map(tag => 
          span({ class: 'tag' }, tag)
        )
      )
    ),

    div({ class: 'card-actions' },
      button({ 
        class: 'btn btn-primary',
        'data-action': 'use-preset',
        'data-preset-id': preset.id
      }, 'Use Preset'),
      
      button({ 
        class: 'btn btn-secondary',
        'data-action': 'edit-preset',
        'data-preset-id': preset.id
      }, 'Edit'),
      
      button({ 
        class: 'btn btn-secondary btn-icon',
        'data-action': 'delete-preset',
        'data-preset-id': preset.id,
        title: 'Delete preset'
      }, '🗑️')
    ),

    div({ class: 'card-footer' },
      span({ class: 'last-updated' }, 
        formatTimeAgo(preset.updatedAt || preset.createdAt)
      ),
      preset.usageCount && span({ class: 'usage-count' }, 
        `Used ${preset.usageCount} times`
      )
    )
  );
};

/**
 * Smart preset editor panel - only shown when needed
 */
const presetEditorPanel = ({ selectedPreset, categories, mcpServers }) => {
  const isEditing = !!selectedPreset;
  
  return div({ class: 'preset-editor-panel' },
    div({ class: 'editor-header' },
      h2(isEditing ? 'Edit Preset' : 'Create New Preset'),
      button({
        class: 'btn btn-icon close-editor',
        'data-action': 'close-editor',
        title: 'Close editor'
      }, '✕')
    ),

    div({ class: 'editor-content' },
      // Basic preset form
      presetBasicForm({ selectedPreset, categories }),
      
      // MCP integration section - contextual
      mcpServers.length > 0 && div({ class: 'editor-section' },
        h3('MCP Integration'),
        p({ class: 'section-help' }, 
          'Connect this preset to MCP servers for enhanced functionality.'
        ),
        
        mcpServerBrowser({
          compact: true,
          allowSelection: true,
          selectedServerId: selectedPreset?.mcpServerId,
          onServerSelect: 'handleServerSelection'
        })
      ),

      // Actions
      div({ class: 'editor-actions' },
        button({
          type: 'submit',
          class: 'btn btn-primary',
          'data-action': 'save-preset'
        }, isEditing ? 'Update Preset' : 'Create Preset'),
        
        button({
          type: 'button',
          class: 'btn btn-secondary',
          'data-action': 'cancel-edit'
        }, 'Cancel'),
        
        isEditing && button({
          type: 'button',
          class: 'btn btn-secondary',
          'data-action': 'duplicate-preset',
          'data-preset-id': selectedPreset.id
        }, 'Duplicate')
      )
    )
  );
};

/**
 * Clean, focused basic form
 */
const presetBasicForm = ({ selectedPreset, categories }) => {
  return form({ 
    id: 'preset-form',
    class: 'preset-basic-form'
  },
    div({ class: 'form-row' },
      div({ class: 'form-group' },
        label({ for: 'preset-name' }, 'Name *'),
        input({
          type: 'text',
          id: 'preset-name',
          name: 'name',
          required: true,
          placeholder: 'Enter preset name...',
          value: selectedPreset?.name || ''
        })
      ),
      
      div({ class: 'form-group' },
        label({ for: 'preset-category' }, 'Category *'),
        select({
          id: 'preset-category',
          name: 'category',
          required: true
        },
          ...categories.map(category =>
            option({
              value: category,
              selected: selectedPreset?.category === category
            }, category)
          )
        )
      )
    ),
    
    div({ class: 'form-group' },
      label({ for: 'preset-description' }, 'Description'),
      textarea({
        id: 'preset-description',
        name: 'description',
        rows: '2',
        placeholder: 'Brief description of what this preset does...',
        value: selectedPreset?.description || ''
      })
    ),
    
    div({ class: 'form-group' },
      label({ for: 'preset-prompt' }, 'AI Prompt *'),
      textarea({
        id: 'preset-prompt',
        name: 'prompt',
        rows: '6',
        required: true,
        placeholder: 'Enter the AI prompt template...',
        value: selectedPreset?.prompt || ''
      }),
      
      div({ class: 'form-help' },
        p('Use variables like {{topic}}, {{context}}, or {{instruction}} for dynamic content.'),
        div({ class: 'character-count' },
          span({ id: 'prompt-count' }, (selectedPreset?.prompt || '').length),
          ' / 2000 characters'
        )
      )
    ),
    
    div({ class: 'form-group' },
      label({ for: 'preset-tags' }, 'Tags'),
      input({
        type: 'text',
        id: 'preset-tags',
        name: 'tags',
        placeholder: 'Enter tags separated by commas...',
        value: selectedPreset?.tags ? selectedPreset.tags.join(', ') : ''
      })
    )
  );
};

/**
 * Simple pagination component
 */
const presetPagination = ({ page, totalPages, total }) => {
  const pages = generatePageNumbers(page, totalPages);
  
  return nav({ class: 'pagination' },
    button({
      class: 'page-btn prev',
      'data-action': 'change-page',
      'data-page': page - 1,
      disabled: page <= 1
    }, '‹ Previous'),
    
    div({ class: 'page-numbers' },
      ...pages.map(pageNum => 
        button({
          class: `page-btn ${pageNum === page ? 'active' : ''}`,
          'data-action': 'change-page',
          'data-page': pageNum
        }, pageNum)
      )
    ),
    
    button({
      class: 'page-btn next',
      'data-action': 'change-page',
      'data-page': page + 1,
      disabled: page >= totalPages
    }, 'Next ›')
  );
};

/**
 * Utility functions
 */
const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const generatePageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxVisible = 5;
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
};

module.exports = {
  presetView
};