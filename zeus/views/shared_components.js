/**
 * Shared Components - Zeus MCP Mesh SDK
 * Reusable HyperAxe components following diogenes patterns
 * Shared between Preset Library and MCP Editor for consistent UX
 */

const { 
  div, section, header, h1, h2, h3, h4, button, input, select, option, form, 
  ul, li, p, span, strong, nav, a, label, details, summary, textarea
} = require('hyperaxe');

/**
 * MCP Server Browser Component
 * Reusable server selection interface with status indicators
 */
const mcpServerBrowser = ({ servers = [], selectedServer = null, isLoading = false, error = null, compact = false }) => {
  const browserClass = compact ? 'server-browser compact' : 'server-browser';
  
  return div({ class: browserClass },
    div({ class: 'browser-header' },
      h3('MCP Servers'),
      span({ class: 'server-count' }, `${servers.length} server${servers.length !== 1 ? 's' : ''}`)
    ),
    
    error && mcpServerError(error),
    
    isLoading 
      ? mcpServerLoading()
      : (servers.length > 0 
          ? mcpServerList(servers, selectedServer, compact)
          : mcpEmptyServerState())
  );
};

/**
 * Server error display
 */
const mcpServerError = (error) => {
  return div({ class: 'server-error' },
    strong('Error: '), error,
    button({ 
      class: 'btn btn-secondary btn-small retry-btn',
      'data-action': 'retry-servers'
    }, 'Retry')
  );
};

/**
 * Server loading state
 */
const mcpServerLoading = () => {
  return div({ class: 'server-loading' },
    div({ class: 'loading-spinner' }),
    p('Loading MCP servers...')
  );
};

/**
 * Server list component
 */
const mcpServerList = (servers, selectedServer, compact = false) => {
  return ul({ class: 'server-list' },
    servers.map(server => mcpServerItem(server, selectedServer?.id === server.id, compact))
  );
};

/**
 * Individual server item
 */
const mcpServerItem = (server, isSelected, compact = false) => {
  const statusClass = server.status === 'connected' ? 'connected' : 'disconnected';
  const itemClass = `server-item ${isSelected ? 'selected' : ''} ${statusClass} ${compact ? 'compact' : ''}`;
  
  return li({ 
    class: itemClass,
    'data-server-id': server.id,
    'data-action': 'select-server'
  },
    div({ class: 'server-info' },
      div({ class: 'server-header' },
        h4({ class: 'server-name' }, server.name),
        span({ class: `server-status ${statusClass}` }, 
          server.status === 'connected' ? '🟢' : '🔴'
        )
      ),
      
      !compact && server.description && 
      p({ class: 'server-description' }, server.description),
      
      div({ class: 'server-stats' },
        span({ class: 'server-type' }, server.type || 'mcp'),
        server.tools && server.resources && server.prompts &&
        span({ class: 'server-capabilities' }, 
          `${server.tools.length} tools, ${server.resources.length} resources, ${server.prompts.length} prompts`
        )
      )
    ),
    
    !compact && div({ class: 'server-actions' },
      button({
        class: 'btn-icon',
        'data-action': 'pause-server',
        'data-server-id': server.id,
        title: 'Pause server'
      }, '⏸️'),
      button({
        class: 'btn-icon',
        'data-action': 'configure-server',
        'data-server-id': server.id,
        title: 'Configure server'
      }, '⚙️')
    )
  );
};

/**
 * Empty server state
 */
const mcpEmptyServerState = () => {
  return div({ class: 'empty-server-state' },
    div({ class: 'empty-icon' }, '🔌'),
    h3('No MCP Servers'),
    p('Connect to an MCP server to explore tools, resources, and prompts.'),
    button({
      class: 'btn btn-primary',
      'data-action': 'add-server'
    }, 'Add Server')
  );
};

/**
 * Advanced Preset Form Component  
 * Enhanced form with MCP item selection and metadata
 */
const advancedPresetForm = ({ 
  preset = null, 
  selectedItems = [], 
  selectedServer = null, 
  isEditing = false,
  showItemSelection = true 
}) => {
  return form({ 
    id: 'advanced-preset-form',
    class: 'advanced-preset-form'
  },
    // Selected items preview (if items are selected)
    showItemSelection && selectedItems.length > 0 && selectedItemsPreview(selectedItems),
    
    // Basic metadata fields
    presetMetadataFields(preset, isEditing),
    
    // Server information (if server selected)
    selectedServer && presetServerInfo(selectedServer),
    
    // Form actions
    presetFormActions(isEditing, selectedItems.length > 0)
  );
};

/**
 * Selected items preview
 */
const selectedItemsPreview = (selectedItems) => {
  return div({ class: 'selected-items-preview' },
    h4('Selected Items:'),
    ul({ class: 'selected-items-list' },
      selectedItems.slice(0, 5).map(itemId => 
        li({ class: 'selected-item' },
          span({ class: 'item-id' }, itemId),
          button({
            class: 'btn-icon remove-item',
            'data-item-id': itemId,
            'data-action': 'remove-from-selection',
            title: 'Remove from selection'
          }, '✕')
        )
      ),
      
      selectedItems.length > 5 && 
      li({ class: 'items-overflow' },
        `+${selectedItems.length - 5} more items`
      )
    )
  );
};

/**
 * Preset metadata fields
 */
const presetMetadataFields = (preset, isEditing) => {
  return div({ class: 'metadata-fields' },
    div({ class: 'form-group' },
      label({ for: 'preset-name' }, 'Preset Name *'),
      input({
        type: 'text',
        id: 'preset-name',
        name: 'name',
        placeholder: 'Enter preset name...',
        value: preset?.name || '',
        required: true
      })
    ),
    
    div({ class: 'form-group' },
      label({ for: 'preset-category' }, 'Category *'),
      select({
        id: 'preset-category',
        name: 'category',
        required: true
      },
        option({ value: 'General', selected: preset?.category === 'General' }, 'General'),
        option({ value: 'Development', selected: preset?.category === 'Development' }, 'Development'),
        option({ value: 'Analysis', selected: preset?.category === 'Analysis' }, 'Analysis'),
        option({ value: 'Creative', selected: preset?.category === 'Creative' }, 'Creative')
      )
    ),
    
    div({ class: 'form-group' },
      label({ for: 'preset-description' }, 'Description'),
      textarea({
        id: 'preset-description',
        name: 'description',
        rows: '3',
        placeholder: 'Describe what this preset does...',
        value: preset?.description || ''
      })
    ),

    div({ class: 'form-group' },
      label({ for: 'preset-prompt' }, 'AI Prompt *'),
      textarea({
        id: 'preset-prompt',
        name: 'prompt',
        rows: '4',
        placeholder: 'Enter the AI prompt template...',
        value: preset?.prompt || '',
        required: true
      }),
      div({ class: 'field-help' },
        p('Use variables like {{topic}}, {{context}}, or {{instruction}} for dynamic content.'),
        div({ class: 'character-count' },
          span({ class: 'count' }, '0'),
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
        value: preset?.tags?.join(', ') || ''
      }),
      p({ class: 'field-help' }, 'Add tags to help organize and find your presets')
    )
  );
};

/**
 * Server information display
 */
const presetServerInfo = (server) => {
  return div({ class: 'preset-server-info' },
    h4('MCP Server'),
    div({ class: 'server-info-card' },
      div({ class: 'server-header' },
        span({ class: 'server-name' }, server.name),
        span({ class: 'server-status connected' }, '🟢')
      ),
      div({ class: 'server-capabilities' },
        span(`${server.tools?.length || 0} tools`),
        span(`${server.resources?.length || 0} resources`),
        span(`${server.prompts?.length || 0} prompts`)
      )
    )
  );
};

/**
 * Form actions
 */
const presetFormActions = (isEditing, hasItems) => {
  return div({ class: 'form-actions' },
    button({
      type: 'submit',
      class: 'btn btn-primary',
      disabled: !hasItems
    }, isEditing ? 'Update Preset' : 'Create Preset'),
    
    button({
      type: 'button',
      class: 'btn btn-secondary',
      'data-action': 'cancel-preset-form'
    }, 'Cancel'),
    
    !hasItems && span({ class: 'form-note' }, 
      'Select tools, resources, or prompts to enable creation'
    )
  );
};

/**
 * Item Selection Grid Component
 * Grid layout for selecting MCP tools, resources, and prompts
 */
const itemSelectionGrid = ({ 
  items = [], 
  selectedItems = [], 
  type = 'tools', 
  searchTerm = '',
  category = '',
  viewMode = 'grid' 
}) => {
  const filteredItems = filterItems(items, searchTerm, category);
  
  if (filteredItems.length === 0) {
    return itemSelectionEmpty(type, searchTerm);
  }
  
  const gridClass = viewMode === 'list' ? 'items-list' : 'items-grid';
  
  return div({ class: `item-selection-grid ${gridClass}` },
    div({ class: 'grid-header' },
      span({ class: 'item-count' }, `${filteredItems.length} ${type}`),
      div({ class: 'grid-actions' },
        button({ 
          class: 'btn btn-small',
          'data-action': 'select-all-visible'
        }, 'Select All'),
        button({ 
          class: 'btn btn-small',
          'data-action': 'clear-selection'
        }, 'Clear')
      )
    ),
    
    div({ class: 'items-container' },
      filteredItems.map(item => 
        itemSelectionCard(item, selectedItems.includes(item.id), type)
      )
    )
  );
};

/**
 * Individual item card for selection
 */
const itemSelectionCard = (item, isSelected, type) => {
  const iconMap = {
    tools: '🛠️',
    resources: '📦', 
    prompts: '💭'
  };
  
  return div({ 
    class: `item-card ${isSelected ? 'selected' : ''} ${type}`,
    'data-item-id': item.id,
    'data-item-type': type,
    'data-action': 'toggle-item-selection'
  },
    div({ class: 'item-header' },
      span({ class: 'item-icon' }, iconMap[type] || '📄'),
      h4({ class: 'item-name' }, item.name),
      div({ class: 'item-actions' },
        isSelected && span({ class: 'selected-indicator' }, '✓'),
        button({
          class: 'btn-icon',
          'data-action': 'preview-item',
          'data-item-id': item.id,
          title: 'Preview item'
        }, '👁️')
      )
    ),
    
    item.description && 
    p({ class: 'item-description' }, item.description),
    
    div({ class: 'item-meta' },
      span({ class: 'item-type' }, type.slice(0, -1)), // Remove 's' from plural
      item.category && span({ class: 'item-category' }, item.category)
    )
  );
};

/**
 * Empty state for item selection
 */
const itemSelectionEmpty = (type, searchTerm) => {
  return div({ class: 'item-selection-empty' },
    div({ class: 'empty-icon' }, '🔍'),
    h3(`No ${type} found`),
    p(searchTerm 
      ? `No ${type} match your search criteria.`
      : `No ${type} available in the selected server.`
    ),
    searchTerm && button({
      class: 'btn btn-secondary',
      'data-action': 'clear-search'
    }, 'Clear Search')
  );
};

/**
 * Filter items by search term and category
 */
const filterItems = (items, searchTerm, category) => {
  let filtered = items;
  
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search) ||
      (item.description && item.description.toLowerCase().includes(search))
    );
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(item => 
      item.category === category
    );
  }
  
  return filtered;
};

/**
 * Search and Filter Bar Component
 * Reusable search and filtering interface
 */
const searchFilterBar = ({ 
  searchPlaceholder = 'Search items...',
  categories = [],
  showViewToggle = true,
  currentView = 'grid',
  currentCategory = 'all'
}) => {
  return div({ class: 'search-filter-bar' },
    div({ class: 'search-section' },
      input({
        type: 'text',
        class: 'search-input',
        placeholder: searchPlaceholder,
        'data-action': 'search-items'
      }),
      button({
        class: 'btn-icon search-btn',
        'data-action': 'search-submit'
      }, '🔍')
    ),
    
    categories.length > 0 && div({ class: 'filter-section' },
      label({ for: 'category-filter' }, 'Category:'),
      select({
        id: 'category-filter',
        class: 'category-filter',
        'data-action': 'filter-category'
      },
        option({ value: 'all', selected: currentCategory === 'all' }, 'All Categories'),
        ...categories.map(cat => 
          option({ value: cat, selected: currentCategory === cat }, cat)
        )
      )
    ),
    
    showViewToggle && div({ class: 'view-toggle' },
      button({
        class: `view-btn ${currentView === 'grid' ? 'active' : ''}`,
        'data-action': 'set-view',
        'data-view': 'grid'
      }, '⊞'),
      button({
        class: `view-btn ${currentView === 'list' ? 'active' : ''}`,
        'data-action': 'set-view',
        'data-view': 'list'
      }, '☰')
    )
  );
};

/**
 * Export all shared components
 */
module.exports = {
  // MCP Server Components
  mcpServerBrowser,
  mcpServerError,
  mcpServerLoading,
  mcpServerList,
  mcpServerItem,
  mcpEmptyServerState,
  
  // Preset Form Components
  advancedPresetForm,
  selectedItemsPreview,
  presetMetadataFields,
  presetServerInfo,
  presetFormActions,
  
  // Item Selection Components
  itemSelectionGrid,
  itemSelectionCard,
  itemSelectionEmpty,
  
  // Utility Components
  searchFilterBar,
  
  // Helper functions
  filterItems
};