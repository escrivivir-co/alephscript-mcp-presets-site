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
    this.editingPresetId = null; // ID del preset siendo editado
    this.isEditMode = false; // Flag para modo edición
    
    this.init();
  }

  /**
   * Initialize the MCP Editor
   */
  init() {
    this.bindEvents();
    this.loadServers();
    this.setupRealTimeUpdates();
    this.handleURLParameters();
  }

  /**
   * Bind event handlers
   */
  bindEvents() {
    // Server selection and management
    document.addEventListener('click', this.handleClick.bind(this));
    
    // Form submission delegation (for dynamically created forms)
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Search and filtering
    const searchInput = document.getElementById('content-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }
    
    const categoryFilter = document.getElementById('content-category-filter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', this.handleCategoryFilter.bind(this));
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
  }

  /**
   * Handle all click events with delegation
   */
  handleClick(event) {
    // Look for action on clicked element or its parents
    let element = event.target;
    let action = null;
    
    while (element && !action) {
      action = element.dataset ? element.dataset.action : null;
      if (action) break;
      element = element.parentElement;
    }
    
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
        this.toggleItemSelection(element.closest('[data-item-id]'));
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
   * Handle form submission delegation
   */
  handleFormSubmit(event) {
    if (event.target.id === 'preset-creator-form') {
      this.handlePresetCreation(event);
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
   * Handle preset creation/update form submission
   */
  async handlePresetCreation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    // Ensure we have a valid serverId - fallback to first available server
    let serverId = this.selectedServer?.id;
    if (!serverId) {
      // Try to get the first connected server as fallback
      try {
        const response = await fetch('/api/mcp/servers');
        const data = await response.json();
        if (data.success && data.servers && data.servers.length > 0) {
          const firstConnectedServer = data.servers.find(server => server.status === 'connected');
          if (firstConnectedServer) {
            serverId = firstConnectedServer.id;
            console.log('Using fallback serverId:', serverId);
          }
        }
      } catch (error) {
        console.warn('Failed to get fallback server:', error);
      }
    }
    
    const presetData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      prompt: formData.get('prompt') || '',
      serverId: serverId,
      items: Array.from(this.selectedItems),
      serverContent: this.serverContent
    };
    
    try {
      let response;
      let successMessage;
      
      if (this.isEditMode && this.editingPresetId) {
        // UPDATE existing preset
        response = await fetch(`/api/presets/${this.editingPresetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(presetData)
        });
        successMessage = 'Preset updated successfully!';
      } else {
        // CREATE new preset
        response = await fetch('/api/presets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(presetData)
        });
        successMessage = 'Preset created successfully!';
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.showNotification(successMessage, 'success');
        this.clearSelection();
        event.target.reset();
        
        // Reset edit mode
        this.isEditMode = false;
        this.editingPresetId = null;
        
        // Optionally redirect to presets view
        setTimeout(() => {
          window.location.href = '/presets';
        }, 1500);
      } else {
        throw new Error(data.error || `Failed to ${this.isEditMode ? 'update' : 'create'} preset`);
      }
    } catch (error) {
      console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} preset:`, error);
      this.showNotification(`Failed to ${this.isEditMode ? 'update' : 'create'} preset: ${error.message}`, 'error');
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
      this.updatePresetCreatorContent();
    }
    
    // Show/hide selection actions
    document.querySelectorAll('.selection-actions').forEach(el => {
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /**
   * Update preset creator content dynamically
   */
  updatePresetCreatorContent() {
    const creator = document.querySelector('.preset-creator');
    if (!creator) return;

    const count = this.selectedItems.size;
    const selectedItemsArray = Array.from(this.selectedItems);

    // Find the content area (everything after the header)
    const header = creator.querySelector('.creator-header');
    const existingContent = creator.querySelector('.creator-empty, .creator-form');
    
    if (existingContent) {
      existingContent.remove();
    }

    let contentHTML;
    
    if (count > 0) {
      // Create form HTML
      contentHTML = `
        <form id="preset-creator-form" class="creator-form">
          <div class="selected-items-preview">
            <h4>Selected Items:</h4>
            <ul class="selected-items-list">
              ${selectedItemsArray.slice(0, 5).map(itemId => `
                <li class="selected-item">
                  <span>${itemId}</span>
                  <button class="btn-icon remove-item" 
                          data-item-id="${itemId}" 
                          data-action="remove-from-selection" 
                          title="Remove from selection">✕</button>
                </li>
              `).join('')}
              ${selectedItemsArray.length > 5 ? `
                <li class="items-overflow">+${selectedItemsArray.length - 5} more items</li>
              ` : ''}
            </ul>
          </div>
          
          <div class="form-group">
            <label for="preset-name">Preset Name *</label>
            <input type="text" id="preset-name" name="name" required 
                   placeholder="Enter preset name">
          </div>
          
          <div class="form-group">
            <label for="preset-description">Description</label>
            <textarea id="preset-description" name="description" 
                      placeholder="Describe your preset (optional)"></textarea>
          </div>
          
          <div class="form-group">
            <label for="preset-prompt">Prompt Template *</label>
            <textarea id="preset-prompt" name="prompt" required
                      placeholder="Enter the AI prompt template for this preset..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="preset-category">Category</label>
            <select id="preset-category" name="category">
              <option value="productivity">Productivity</option>
              <option value="development">Development</option>
              <option value="analysis">Analysis</option>
              <option value="automation">Automation</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" data-action="clear-selection">
              Clear Selection
            </button>
            <button type="submit" class="btn-primary">
              ${this.isEditMode ? 'Update Preset' : 'Create Preset'}
            </button>
          </div>
        </form>
      `;
    } else {
      // Create empty state HTML
      contentHTML = `
        <div class="creator-empty">
          <div class="empty-icon">📝</div>
          <p>Select tools, resources, or prompts to create a preset</p>
          
          <div class="creator-tips">
            <h4>Tips:</h4>
            <ul>
              <li>Select multiple items to combine them</li>
              <li>Mix tools, resources, and prompts</li>
              <li>Create reusable workflows</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Insert the new content after the header
    header.insertAdjacentHTML('afterend', contentHTML);
  }

  /**
   * Render servers in sidebar
   */
  renderServers(servers) {
    // Implementation would update the server list in the sidebar
    console.log('Rendering servers:', servers);
    
    // Auto-select first connected server if none selected
    if (!this.selectedServer && servers && servers.length > 0) {
      const firstConnectedServer = servers.find(server => server.status === 'connected');
      if (firstConnectedServer) {
        console.log('Auto-selecting first connected server:', firstConnectedServer.id);
        this.selectServer(firstConnectedServer.id);
      }
    }
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

  /**
   * Handle URL parameters for preset editing/creation from Preset Library
   */
  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're in edit or create mode
    const mode = urlParams.get('mode');
    const editId = urlParams.get('edit');
    const expanded = urlParams.get('expanded');
    const presetId = urlParams.get('preset');
    
    console.log('🔍 URL Parameters detected:', Object.fromEntries(urlParams));
    
    // Handle preset edit mode (from preset library)
    if (presetId) {
      this.handlePresetEditMode(presetId);
    }
    
    // Handle edit mode
    else if (mode === 'edit' || editId) {
      this.handleEditMode(urlParams);
    }
    
    // Handle create mode
    else if (mode === 'create') {
      this.handleCreateMode(urlParams);
    }
    
    // Handle expanded preset creator
    if (expanded === 'true') {
      this.expandPresetCreator();
    }
  }

  /**
   * Handle edit mode - preload preset data
   */
  async handleEditMode(urlParams) {
    const editId = urlParams.get('edit');
    const serverName = urlParams.get('server');
    const presetName = urlParams.get('presetName');
    const presetDesc = urlParams.get('presetDesc');
    const presetCategory = urlParams.get('presetCategory');
    
    console.log('⚙️ Entering edit mode for preset:', editId);
    
    // Select server if specified
    if (serverName) {
      await this.selectServerByName(serverName);
    }
    
    // Preload selected items
    await this.preloadSelectedItems(urlParams);
    
    // Preload metadata in preset creator form
    this.preloadPresetMetadata({
      name: presetName,
      description: presetDesc ? decodeURIComponent(presetDesc) : '',
      category: presetCategory
    });
    
    // Expand preset creator
    this.expandPresetCreator();
    
    // Show notification
    this.showNotification(`Editing preset: ${presetName || editId}`, 'info');
  }

  /**
   * Handle create mode - setup for new preset creation
   */
  async handleCreateMode(urlParams) {
    console.log('🆕 Entering create mode for new preset');
    
    // Clear any existing selections
    this.selectedItems.clear();
    this.updateSelectionUI();
    
    // Expand preset creator
    this.expandPresetCreator();
    
    // Show notification
    this.showNotification('Create new preset: Select tools, resources, and prompts', 'info');
  }

  /**
   * Handle preset edit mode - load existing preset for editing
   */
  async handlePresetEditMode(presetId) {
    console.log('📝 Entering preset edit mode for:', presetId);
    
    // Set edit mode flags
    this.isEditMode = true;
    this.editingPresetId = presetId;
    
    try {
      // Fetch preset data from backend
      const response = await fetch(`/api/presets/${presetId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch preset: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success || !data.preset) {
        throw new Error('Preset not found');
      }
      
      const preset = data.preset;
      console.log('✅ Preset loaded:', preset);
      
      // Preload preset metadata in form
      this.preloadPresetMetadata({
        name: preset.name,
        description: preset.description || '',
        category: preset.category || 'General',
        prompt: preset.prompt || ''
      });
      
      // Wait for servers to load and select the appropriate server
      await this.ensureServersLoaded();
      
      // If preset has a server association, select it
      if (preset.serverName) {
        await this.selectServerByName(preset.serverName);
      }
      
      // Preselect items from the preset
      await this.preselectPresetItems(preset);
      
      // Expand preset creator
      this.expandPresetCreator();
      
      // Update preset creator to show correct button text
      this.updatePresetCreatorContent();
      
      // Show notification
      this.showNotification(`Editing preset: ${preset.name}`, 'info');
      
    } catch (error) {
      console.error('❌ Error loading preset for editing:', error);
      this.showNotification('Error loading preset for editing', 'error');
    }
  }

  /**
   * Preselect items from a preset
   */
  async preselectPresetItems(preset) {
    console.log('🎯 Preselecting preset items:', preset.items);
    console.log('🔍 Preset item structure:', JSON.stringify(preset.items, null, 2));
    
    // Clear existing selections
    this.selectedItems.clear();
    
    // Wait for server content to load
    if (this.selectedServer) {
      await this.ensureServerContentLoaded(this.selectedServer.id);
    }
    
    // Add preset items to selection
    if (preset.items && Array.isArray(preset.items)) {
      preset.items.forEach(item => {
        // Handle both string format and object format
        let itemId = null;
        if (typeof item === 'string') {
          // Simple string format (tool name)
          itemId = item;
        } else if (item && item.id) {
          // Object format with id
          itemId = item.id;
        } else if (item && item.name) {
          // Object format with name
          itemId = item.name;
        }
        
        if (itemId) {
          this.selectedItems.add(itemId);
          console.log('✅ Preselected item:', itemId, typeof item === 'object' ? item.type : 'unknown');
        } else {
          console.warn('⚠️ Unable to extract ID from item:', item);
        }
      });
    }
    
    // Update UI to reflect selections
    this.updateSelectionUI();
    
    console.log(`📋 Preselected ${this.selectedItems.size} items from preset`);
  }

  /**
   * Ensure server content is loaded
   */
  async ensureServerContentLoaded(serverId) {
    if (!this.serverContent[serverId]) {
      console.log('⏳ Loading server content for preselection...');
      await this.loadServerContent(serverId);
    }
  }

  /**
   * Select server by name
   */
  async selectServerByName(serverName) {
    // Wait for servers to load if not already loaded
    await this.ensureServersLoaded();
    
    const serverElement = document.querySelector(`[data-server-id="${serverName}"]`);
    if (serverElement) {
      await this.handleServerSelect(serverName);
      console.log('📡 Server auto-selected:', serverName);
    }
  }

  /**
   * Preload selected items from URL parameters
   */
  async preloadSelectedItems(urlParams) {
    const toolIds = urlParams.get('tools')?.split(',').filter(Boolean) || [];
    const resourceIds = urlParams.get('resources')?.split(',').filter(Boolean) || [];
    const promptIds = urlParams.get('prompts')?.split(',').filter(Boolean) || [];
    
    // Clear existing selections
    this.selectedItems.clear();
    
    // Add items to selection
    [...toolIds, ...resourceIds, ...promptIds].forEach(itemId => {
      this.selectedItems.add(itemId);
    });
    
    console.log('📋 Items preloaded:', {
      tools: toolIds.length,
      resources: resourceIds.length,
      prompts: promptIds.length,
      total: this.selectedItems.size
    });
    
    // Update display
    this.updateSelectionUI();
  }

  /**
   * Preload metadata in preset creator form
   */
  preloadPresetMetadata(metadata) {
    // Wait for form to be available
    setTimeout(() => {
      if (metadata.name) {
        const nameInput = document.getElementById('preset-name');
        if (nameInput) nameInput.value = metadata.name;
      }
      
      if (metadata.description) {
        const descInput = document.getElementById('preset-description');
        if (descInput) descInput.value = metadata.description;
      }
      
      if (metadata.category) {
        const categorySelect = document.getElementById('preset-category');
        if (categorySelect) categorySelect.value = metadata.category;
      }
      
      if (metadata.prompt) {
        const promptInput = document.getElementById('preset-prompt');
        if (promptInput) promptInput.value = metadata.prompt;
      }
      
      console.log('📝 Metadata preloaded:', metadata);
    }, 500); // Give time for DOM to update
  }

  /**
   * Expand preset creator panel
   */
  expandPresetCreator() {
    setTimeout(() => {
      const creatorPanel = document.querySelector('.preset-creator');
      if (creatorPanel) {
        creatorPanel.classList.add('expanded');
        creatorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1000); // Give time for content to load
  }

  /**
   * Ensure servers are loaded before proceeding
   */
  async ensureServersLoaded() {
    if (!this.selectedServer && this.isLoading) {
      // Wait for servers to load
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (!this.isLoading) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    // Create notification if not exists
    let notification = document.querySelector('.mcp-editor-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'mcp-editor-notification';
      document.querySelector('.mcp-editor-container').prepend(notification);
    }
    
    notification.textContent = message;
    notification.className = `mcp-editor-notification ${type}`;
    notification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// Initialize MCP Editor when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.mcp-editor-container')) {
    window.mcpEditor = new MCPEditor();
  }
});