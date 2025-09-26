/**
 * MCP Editor Client-Side Functionality
 * Handles interactive MCP server exploration and preset creation
 */

class MCPEditor {
  constructor() {
    this.selectedServer = null;
    this.selectedItems = new Set();
    this.currentTab = 'tools';
    this.currentView = 'grid';
    this.searchTerm = '';
    this.categoryFilter = '';
    this.serverContent = {};
    this.isLoading = false;
    
    this.init();
  }

  /**
   * Initialize the MCP Editor
   */
  init() {
    this.bindEvents();
    this.loadServers();
    this.setupRealTimeUpdates();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    // Server selection and management
    document.addEventListener('click', this.handleClick.bind(this));
    
    // Search and filtering
    const searchInput = document.getElementById('content-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    const categoryFilter = document.getElementById('content-category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', this.handleCategoryFilter.bind(this));
    }
    
    // Form submission
    const presetForm = document.getElementById('preset-creator-form');
    if (presetForm) {
      presetForm.addEventListener('submit', this.handlePresetCreation.bind(this));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
  }

  /**
   * Handle all click events with delegation
   */
  handleClick(event) {
    const action = event.target.dataset.action;
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();

    switch (action) {
      case 'select-server':
        this.selectServer(event.target.closest('[data-server-id]').dataset.serverId);
        break;
      case 'connect-server':
        this.connectServer(event.target.dataset.serverId);
        break;
      case 'disconnect-server':
        this.disconnectServer(event.target.dataset.serverId);
        break;
      case 'server-settings':
        this.openServerSettings(event.target.dataset.serverId);
        break;
      case 'add-server':
        this.openAddServerDialog();
        break;
      case 'refresh-servers':
        this.loadServers();
        break;
      case 'manage-servers':
        this.openServerManager();
        break;
      case 'switch-tab':
        this.switchTab(event.target.dataset.tab);
        break;
      case 'change-content-view':
        this.changeContentView(event.target.dataset.view);
        break;
      case 'toggle-selection':
        this.toggleItemSelection(event.target.closest('[data-item-id]'));
        break;
      case 'clear-selection':
        this.clearSelection();
        break;
      case 'test-tool':
        this.testTool(event.target.dataset.toolName);
        break;
      case 'preview-resource':
        this.previewResource(event.target.dataset.resourceName);
        break;
      case 'use-prompt':
        this.usePrompt(event.target.dataset.promptName);
        break;
      case 'create-preset-from-selection':
      case 'create-from-selection':
        this.createPresetFromSelection();
        break;
      case 'preview-preset':
        this.previewPreset();
        break;
      case 'remove-from-selection':
        this.removeFromSelection(event.target.dataset.itemId);
        break;
      case 'retry-servers':
        this.loadServers();
        break;
    }
  }

  /**
   * Handle search input
   */
  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterContent();
  }

  /**
   * Handle category filter change
   */
  handleCategoryFilter(event) {
    this.categoryFilter = event.target.value;
    this.filterContent();
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(event) {
    // Ctrl+A to select all visible items
    if (event.ctrlKey && event.key === 'a' && this.selectedServer) {
      event.preventDefault();
      this.selectAllVisible();
    }
    
    // Escape to clear selection
    if (event.key === 'Escape') {
      this.clearSelection();
    }
    
    // Tab navigation (1, 2, 3 for tools, resources, prompts)
    if (event.key >= '1' && event.key <= '3' && !event.ctrlKey && !event.altKey) {
      const tabs = ['tools', 'resources', 'prompts'];
      const tabIndex = parseInt(event.key) - 1;
      if (tabs[tabIndex] && this.selectedServer) {
        event.preventDefault();
        this.switchTab(tabs[tabIndex]);
      }
    }
  }

  /**
   * Load MCP servers from API
   */
  async loadServers() {
    this.setLoadingState(true);
    
    try {
      const response = await fetch('/api/mcp/servers');
      const data = await response.json();
      
      if (data.success) {
        this.renderServers(data.servers);
        this.setError(null);
      } else {
        throw new Error(data.error || 'Failed to load servers');
      }
    } catch (error) {
      console.error('Error loading servers:', error);
      this.setError(error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Select and load content for a server
   */
  async selectServer(serverId) {
    if (this.selectedServer?.id === serverId) return;
    
    this.setLoadingState(true);
    this.clearSelection();
    
    try {
      const response = await fetch(`/api/mcp/servers/${serverId}/content`);
      const data = await response.json();
      
      if (data.success) {
        this.selectedServer = { id: serverId, ...data.server };
        this.serverContent = data.content;
        this.renderServerContent();
        this.updateServerSelection(serverId);
        this.setError(null);
      } else {
        throw new Error(data.error || 'Failed to load server content');
      }
    } catch (error) {
      console.error('Error loading server content:', error);
      this.setError(error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Connect to an MCP server
   */
  async connectServer(serverId) {
    try {
      const response = await fetch(`/api/mcp/servers/${serverId}/connect`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        this.showNotification('Server connected successfully', 'success');
        this.loadServers(); // Refresh server list
      } else {
        throw new Error(data.error || 'Failed to connect to server');
      }
    } catch (error) {
      console.error('Error connecting server:', error);
      this.showNotification(error.message, 'error');
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnectServer(serverId) {
    try {
      const response = await fetch(`/api/mcp/servers/${serverId}/disconnect`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        this.showNotification('Server disconnected', 'info');
        this.loadServers(); // Refresh server list
        
        // Clear content if this was the selected server
        if (this.selectedServer?.id === serverId) {
          this.selectedServer = null;
          this.serverContent = {};
          this.clearSelection();
          this.renderWelcome();
        }
      } else {
        throw new Error(data.error || 'Failed to disconnect from server');
      }
    } catch (error) {
      console.error('Error disconnecting server:', error);
      this.showNotification(error.message, 'error');
    }
  }

  /**
   * Switch between tabs (tools, resources, prompts)
   */
  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelector(`[data-tab-content="${tab}"]`)?.classList.add('active');
    
    this.filterContent();
  }

  /**
   * Change content view (grid/list)
   */
  changeContentView(view) {
    this.currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    
    // Update grid classes
    const grids = document.querySelectorAll('.items-grid');
    grids.forEach(grid => {
      grid.classList.toggle('list-view', view === 'list');
    });
  }

  /**
   * Toggle selection of an item
   */
  toggleItemSelection(itemElement) {
    if (!itemElement) return;
    
    const itemId = itemElement.dataset.itemId;
    const itemType = itemElement.dataset.itemType;
    
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
      itemElement.classList.remove('selected');
    } else {
      this.selectedItems.add(itemId);
      itemElement.classList.add('selected');
    }
    
    this.updateSelectionUI();
  }

  /**
   * Clear all selections
   */
  clearSelection() {
    this.selectedItems.clear();
    
    document.querySelectorAll('.item-card.selected').forEach(item => {
      item.classList.remove('selected');
    });
    
    this.updateSelectionUI();
  }

  /**
   * Select all visible items
   */
  selectAllVisible() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const visibleItems = activeTab.querySelectorAll('.item-card:not([style*="display: none"])');
    
    visibleItems.forEach(item => {
      const itemId = item.dataset.itemId;
      this.selectedItems.add(itemId);
      item.classList.add('selected');
    });
    
    this.updateSelectionUI();
  }

  /**
   * Remove item from selection
   */
  removeFromSelection(itemId) {
    this.selectedItems.delete(itemId);
    
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
      itemElement.classList.remove('selected');
    }
    
    this.updateSelectionUI();
  }

  /**
   * Filter content based on search and category
   */
  filterContent() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    
    const items = activeTab.querySelectorAll('.item-card');
    
    items.forEach(item => {
      const itemName = item.querySelector('.item-name')?.textContent?.toLowerCase() || '';
      const itemDescription = item.querySelector('.item-description')?.textContent?.toLowerCase() || '';
      const itemCategory = item.querySelector('.item-category')?.textContent?.toLowerCase() || '';
      
      const matchesSearch = !this.searchTerm || 
        itemName.includes(this.searchTerm) || 
        itemDescription.includes(this.searchTerm);
        
      const matchesCategory = !this.categoryFilter || 
        itemCategory.includes(this.categoryFilter.toLowerCase());
      
      const shouldShow = matchesSearch && matchesCategory;
      item.style.display = shouldShow ? '' : 'none';
    });
  }

  /**
   * Test a tool
   */
  async testTool(toolName) {
    if (!this.selectedServer) return;
    
    try {
      this.showNotification(`Testing tool: ${toolName}...`, 'info');
      
      const response = await fetch(`/api/mcp/servers/${this.selectedServer.id}/tools/${toolName}/test`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        this.showNotification(`Tool test completed successfully`, 'success');
        console.log('Tool test result:', data.result);
      } else {
        throw new Error(data.error || 'Tool test failed');
      }
    } catch (error) {
      console.error('Error testing tool:', error);
      this.showNotification(`Tool test failed: ${error.message}`, 'error');
    }
  }

  /**
   * Preview a resource
   */
  async previewResource(resourceName) {
    if (!this.selectedServer) return;
    
    try {
      const response = await fetch(`/api/mcp/servers/${this.selectedServer.id}/resources/${resourceName}`);
      const data = await response.json();
      
      if (data.success) {
        this.showResourcePreview(data.resource);
      } else {
        throw new Error(data.error || 'Failed to preview resource');
      }
    } catch (error) {
      console.error('Error previewing resource:', error);
      this.showNotification(`Failed to preview resource: ${error.message}`, 'error');
    }
  }

  /**
   * Use a prompt
   */
  usePrompt(promptName) {
    if (!this.selectedServer) return;
    
    // Redirect to AI view with the selected prompt
    const url = `/ai?server=${this.selectedServer.id}&prompt=${encodeURIComponent(promptName)}`;
    window.location.href = url;
  }

  /**
   * Create preset from selection
   */
  createPresetFromSelection() {
    if (this.selectedItems.size === 0) {
      this.showNotification('Please select items to create a preset', 'warning');
      return;
    }
    
    // Scroll to preset creator and focus name input
    const creator = document.querySelector('.preset-creator');
    const nameInput = document.getElementById('preset-name');
    
    if (creator) {
      creator.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 500);
    }
  }

  /**
   * Handle preset creation form submission
   */
  async handlePresetCreation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const presetData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      serverId: this.selectedServer?.id,
      items: Array.from(this.selectedItems),
      serverContent: this.serverContent
    };
    
    try {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(presetData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showNotification('Preset created successfully!', 'success');
        this.clearSelection();
        event.target.reset();
        
        // Optionally redirect to presets view
        setTimeout(() => {
          window.location.href = '/presets';
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to create preset');
      }
    } catch (error) {
      console.error('Error creating preset:', error);
      this.showNotification(`Failed to create preset: ${error.message}`, 'error');
    }
  }

  /**
   * Preview preset before creation
   */
  previewPreset() {
    const formData = new FormData(document.getElementById('preset-creator-form'));
    const presetData = {
      name: formData.get('name') || 'Untitled Preset',
      description: formData.get('description') || 'No description',
      category: formData.get('category'),
      items: Array.from(this.selectedItems),
      serverName: this.selectedServer?.name
    };
    
    this.showPresetPreview(presetData);
  }

  /**
   * Setup real-time updates via WebSocket
   */
  setupRealTimeUpdates() {
    if (typeof io === 'undefined') return;
    
    const socket = io();
    
    socket.on('mcp-server-status-changed', (data) => {
      this.handleServerStatusChange(data);
    });
    
    socket.on('mcp-server-content-updated', (data) => {
      if (this.selectedServer?.id === data.serverId) {
        this.loadServerContent(data.serverId);
      }
    });
  }

  /**
   * Handle server status changes
   */
  handleServerStatusChange(data) {
    const serverElement = document.querySelector(`[data-server-id="${data.serverId}"]`);
    if (serverElement) {
      const statusElement = serverElement.querySelector('.server-status');
      if (statusElement) {
        statusElement.textContent = data.status === 'connected' ? '🟢' : '🔴';
      }
      
      serverElement.classList.remove('connected', 'disconnected');
      serverElement.classList.add(data.status);
    }
    
    this.showNotification(`Server ${data.serverName} ${data.status}`, 'info');
  }

  /**
   * Update selection UI elements
   */
  updateSelectionUI() {
    const count = this.selectedItems.size;
    
    // Update selection counts
    document.querySelectorAll('.selection-count').forEach(el => {
      el.textContent = `${count} items selected`;
    });
    
    // Update create preset button state
    const createBtn = document.getElementById('create-preset-btn');
    if (createBtn) {
      createBtn.disabled = count === 0;
    }
    
    // Update preset creator panel
    const creator = document.querySelector('.preset-creator');
    if (creator) {
      creator.classList.toggle('has-selection', count > 0);
    }
    
    // Show/hide selection actions
    document.querySelectorAll('.selection-actions').forEach(el => {
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /**
   * Render servers in sidebar
   */
  renderServers(servers) {
    // Implementation would update the server list in the sidebar
    console.log('Rendering servers:', servers);
  }

  /**
   * Render server content in explorer
   */
  renderServerContent() {
    // Implementation would update the content explorer
    console.log('Rendering content for server:', this.selectedServer);
  }

  /**
   * Render welcome state
   */
  renderWelcome() {
    // Implementation would show welcome state
    console.log('Rendering welcome state');
  }

  /**
   * Update server selection in sidebar
   */
  updateServerSelection(serverId) {
    document.querySelectorAll('.server-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`[data-server-id="${serverId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
    }
  }

  /**
   * Set loading state
   */
  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    
    document.body.classList.toggle('mcp-loading', isLoading);
    
    // Update UI elements to show loading state
    const loadingElements = document.querySelectorAll('.loading-state');
    loadingElements.forEach(el => {
      el.style.display = isLoading ? 'block' : 'none';
    });
  }

  /**
   * Set error state
   */
  setError(error) {
    const errorElements = document.querySelectorAll('.server-error');
    errorElements.forEach(el => {
      if (error) {
        el.textContent = error;
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Implementation would show a notification
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  /**
   * Show resource preview modal
   */
  showResourcePreview(resource) {
    // Implementation would show resource preview in a modal
    console.log('Showing resource preview:', resource);
  }

  /**
   * Show preset preview modal
   */
  showPresetPreview(presetData) {
    // Implementation would show preset preview in a modal
    console.log('Showing preset preview:', presetData);
  }

  /**
   * Open server settings dialog
   */
  openServerSettings(serverId) {
    console.log('Opening settings for server:', serverId);
  }

  /**
   * Open add server dialog
   */
  openAddServerDialog() {
    console.log('Opening add server dialog');
  }

  /**
   * Open server manager
   */
  openServerManager() {
    console.log('Opening server manager');
  }
}

// Initialize MCP Editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.mcp-editor-container')) {
    window.mcpEditor = new MCPEditor();
  }
});