const { 
  div, section, header, h1, h2, h3, button, input, textarea, form, 
  ul, li, p, span, strong, select, option, nav, a, label
} = require('hyperaxe');
const { template, contentSection, pageContainer } = require('./main_views');

/**
 * Preset Library View - Advanced preset management interface
 * Follows diogenes patterns with enhanced CRUD functionality
 */

/**
 * Main preset library view component
 */
const presetView = (data = {}) => {
  const {
    presets = [],
    categories = ['General', 'Development', 'Analysis', 'Creative'],
    selectedPreset = null,
    filters = {},
    pagination = {},
    isLoading = false,
    error = null
  } = data;

  return template(
    'Preset Library',
    pageContainer(
      section({ class: 'preset-library-container' },
        presetHeader({ categories, filters }),
        div({ class: 'preset-main-content' },
          presetFilters({ categories, filters }),
          presetGrid({ presets, selectedPreset, pagination, isLoading, error }),
          presetEditor({ selectedPreset, categories })
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
 * Preset library header with search and actions
 */
const presetHeader = ({ categories, filters }) => {
  return header({ class: 'preset-header' },
    div({ class: 'header-content' },
      div({ class: 'header-title' },
        h1('Preset Library'),
        p({ class: 'header-subtitle' }, 
          'Manage and organize your AI conversation presets'
        )
      ),
      
      div({ class: 'header-actions' },
        button({ 
          class: 'btn btn-primary',
          'data-action': 'create-preset'
        }, '+ Create Preset'),
        
        button({ 
          class: 'btn btn-secondary',
          'data-action': 'import-presets'
        }, '📥 Import'),
        
        button({ 
          class: 'btn btn-secondary',
          'data-action': 'export-presets'
        }, '📤 Export')
      )
    ),
    
    div({ class: 'search-bar' },
      div({ class: 'search-container' },
        input({
          type: 'text',
          id: 'preset-search',
          class: 'search-input',
          placeholder: 'Search presets by name, description, or tags...',
          value: filters.search || ''
        }),
        button({ 
          class: 'search-button',
          'data-action': 'search-presets'
        }, '🔍')
      )
    )
  );
};

/**
 * Preset filters sidebar
 */
const presetFilters = ({ categories, filters }) => {
  return div({ class: 'preset-filters' },
    div({ class: 'filter-section' },
      h3('Categories'),
      ul({ class: 'category-list' },
        li(
          label({ class: 'category-item' },
            input({
              type: 'radio',
              name: 'category',
              value: '',
              checked: !filters.category
            }),
            span('All Categories')
          )
        ),
        
        categories.map(category => 
          li(
            label({ class: 'category-item' },
              input({
                type: 'radio',
                name: 'category',
                value: category,
                checked: filters.category === category
              }),
              span(category)
            )
          )
        )
      )
    ),
    
    div({ class: 'filter-section' },
      h3('Sort By'),
      select({ 
        id: 'sort-select',
        class: 'sort-select',
        'data-action': 'change-sort'
      },
        option({ value: 'updatedAt_desc', selected: true }, 'Recently Updated'),
        option({ value: 'name_asc' }, 'Name A-Z'),
        option({ value: 'name_desc' }, 'Name Z-A'),
        option({ value: 'createdAt_desc' }, 'Recently Created'),
        option({ value: 'usageCount_desc' }, 'Most Used')
      )
    ),
    
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
 * Main preset grid/list area
 */
const presetGrid = ({ presets, selectedPreset, pagination, isLoading, error }) => {
  return div({ class: 'preset-content' },
    error && presetError(error),
    
    div({ class: 'preset-results-header' },
      span({ class: 'results-count' },
        `${pagination.total || presets.length} presets`
      ),
      
      div({ class: 'results-actions' },
        button({
          class: 'btn btn-secondary btn-small',
          'data-action': 'select-all'
        }, 'Select All'),
        button({
          class: 'btn btn-secondary btn-small',
          'data-action': 'clear-selection'
        }, 'Clear')
      )
    ),
    
    isLoading 
      ? presetLoading()
      : (presets.length > 0 
          ? presetItems(presets, selectedPreset)
          : emptyPresetState()),
          
    pagination && pagination.totalPages > 1 && presetPagination(pagination)
  );
};

/**
 * Preset error display
 */
const presetError = (error) => {
  return div({ class: 'preset-error' },
    strong('Error: '), error,
    button({ 
      class: 'btn btn-secondary btn-small retry-btn',
      'data-action': 'retry-load'
    }, 'Retry')
  );
};

/**
 * Preset loading state
 */
const presetLoading = () => {
  return div({ class: 'preset-loading' },
    div({ class: 'loading-spinner' }),
    p('Loading presets...')
  );
};

/**
 * Preset items grid
 */
const presetItems = (presets, selectedPreset) => {
  return div({ class: 'preset-items' },
    presets.map(preset => presetItem(preset, selectedPreset?.id === preset.id))
  );
};

/**
 * Individual preset item card
 */
const presetItem = (preset, isSelected) => {
  const truncatedDescription = preset.description.length > 120
    ? preset.description.substring(0, 120) + '...'
    : preset.description;

  return div({ 
    class: `preset-item ${isSelected ? 'selected' : ''}`,
    'data-preset-id': preset.id,
    'data-action': 'select-preset'
  },
    div({ class: 'preset-item-header' },
      h4({ class: 'preset-name' }, preset.name),
      
      div({ class: 'preset-actions' },
        button({
          class: 'btn-icon edit-preset',
          'data-preset-id': preset.id,
          'data-action': 'edit-preset',
          title: 'Edit preset'
        }, '✏️'),
        
        button({
          class: 'btn-icon duplicate-preset',
          'data-preset-id': preset.id,
          'data-action': 'duplicate-preset',
          title: 'Duplicate preset'
        }, '📋'),
        
        button({
          class: 'btn-icon delete-preset',
          'data-preset-id': preset.id,
          'data-action': 'delete-preset',
          title: 'Delete preset'
        }, '🗑️')
      )
    ),
    
    div({ class: 'preset-content' },
      p({ class: 'preset-description' }, truncatedDescription),
      
      div({ class: 'preset-meta' },
        span({ class: 'preset-category' }, preset.category),
        
        preset.tags && preset.tags.length > 0 && 
        div({ class: 'preset-tags' },
          preset.tags.slice(0, 3).map(tag =>
            span({ class: 'tag' }, tag)
          ),
          preset.tags.length > 3 && 
          span({ class: 'tag-more' }, `+${preset.tags.length - 3}`)
        )
      ),
      
      div({ class: 'preset-stats' },
        span({ class: 'usage-count' }, 
          `Used ${preset.usageCount || 0} times`
        ),
        span({ class: 'updated-date' },
          `Updated ${formatTimeAgo(preset.updatedAt)}`
        )
      ),
      
      div({ class: 'preset-actions-main' },
        button({
          class: 'btn btn-primary btn-small use-preset-btn',
          'data-preset-id': preset.id,
          'data-action': 'use-preset'
        }, 'Use in Chat'),
        
        button({
          class: 'btn btn-secondary btn-small preview-preset-btn',
          'data-preset-id': preset.id,
          'data-action': 'preview-preset'
        }, 'Preview')
      )
    )
  );
};

/**
 * Empty preset state
 */
const emptyPresetState = () => {
  return div({ class: 'empty-state' },
    div({ class: 'empty-icon' }, '📚'),
    h3('No presets found'),
    p('Create your first preset to get started with AI conversations.'),
    
    div({ class: 'empty-actions' },
      button({
        class: 'btn btn-primary',
        'data-action': 'create-preset'
      }, 'Create Your First Preset'),
      
      button({
        class: 'btn btn-secondary',
        'data-action': 'import-presets'
      }, 'Import Presets')
    )
  );
};

/**
 * Pagination controls
 */
const presetPagination = (pagination) => {
  const { page, totalPages, total } = pagination;
  
  return div({ class: 'preset-pagination' },
    div({ class: 'pagination-info' },
      `Page ${page} of ${totalPages} (${total} total)`
    ),
    
    div({ class: 'pagination-controls' },
      button({
        class: `btn btn-secondary ${page <= 1 ? 'disabled' : ''}`,
        'data-action': 'previous-page',
        disabled: page <= 1
      }, '← Previous'),
      
      div({ class: 'page-numbers' },
        ...generatePageNumbers(page, totalPages).map(pageNum =>
          button({
            class: `page-btn ${pageNum === page ? 'active' : ''}`,
            'data-page': pageNum,
            'data-action': 'go-to-page'
          }, pageNum)
        )
      ),
      
      button({
        class: `btn btn-secondary ${page >= totalPages ? 'disabled' : ''}`,
        'data-action': 'next-page',
        disabled: page >= totalPages
      }, 'Next →')
    )
  );
};

/**
 * Preset editor panel
 */
const presetEditor = ({ selectedPreset, categories }) => {
  const isEditing = !!selectedPreset;
  
  return div({ class: 'preset-editor' },
    div({ class: 'editor-header' },
      h3(isEditing ? 'Edit Preset' : 'Create New Preset'),
      
      isEditing && button({
        class: 'btn-icon close-editor',
        'data-action': 'close-editor',
        title: 'Close editor'
      }, '✕')
    ),
    
    form({ 
      id: 'preset-form',
      class: 'preset-form'
    },
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
          categories.map(category =>
            option({
              value: category,
              selected: selectedPreset?.category === category
            }, category)
          )
        )
      ),
      
      div({ class: 'form-group' },
        label({ for: 'preset-description' }, 'Description'),
        textarea({
          id: 'preset-description',
          name: 'description',
          rows: '3',
          placeholder: 'Describe what this preset is for...',
          value: selectedPreset?.description || ''
        })
      ),
      
      div({ class: 'form-group' },
        label({ for: 'preset-prompt' }, 'Prompt *'),
        textarea({
          id: 'preset-prompt',
          name: 'prompt',
          rows: '8',
          required: true,
          placeholder: 'Enter the AI prompt template...',
          value: selectedPreset?.prompt || ''
        }),
        
        div({ class: 'prompt-helpers' },
          p({ class: 'helper-text' }, 
            'Use variables like {{topic}}, {{context}}, or {{instruction}} for dynamic content.'
          ),
          
          div({ class: 'character-count' },
            span({ id: 'prompt-count' }, '0'),
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
        }),
        
        p({ class: 'helper-text' },
          'Add tags to help organize and find your presets'
        )
      ),
      
      div({ class: 'form-actions' },
        button({
          type: 'submit',
          class: 'btn btn-primary'
        }, isEditing ? 'Update Preset' : 'Create Preset'),
        
        button({
          type: 'button',
          class: 'btn btn-secondary',
          'data-action': 'cancel-edit'
        }, 'Cancel'),
        
        isEditing && button({
          type: 'button',
          class: 'btn btn-secondary',
          'data-action': 'preview-preset',
          'data-preset-id': selectedPreset.id
        }, 'Test Preview')
      )
    )
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