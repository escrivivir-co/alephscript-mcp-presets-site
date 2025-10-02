/**
 * AI Chat Interface - Zeus MCP Mesh SDK
 * Real-time chat functionality with WebSocket integration
 * Following diogenes patterns with enhanced UX
 */

class AIChat {
  constructor() {
    this.socket = null;
    this.currentConversation = null;
    this.conversations = [];
    this.presets = [];
    this.isConnected = false;
    this.messageQueue = [];
    this.typingTimeout = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadInitialData();
      await this.loadMCPPresets();
      this.setupWebSocket();
      this.bindEvents();
      this.updateUI();
      console.log('AI Chat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Chat:', error);
      this.showError('Failed to initialize chat system');
    }
  }

  // Load initial data from API
  async loadInitialData() {
    try {
      // Load conversations
      const conversationsResponse = await fetch('/api/ai/conversations');
      const conversationsData = await conversationsResponse.json();
      if (conversationsData.success) {
        this.conversations = conversationsData.conversations;
      }

      // Load presets
      const presetsResponse = await fetch('/api/presets?limit=20');
      const presetsData = await presetsResponse.json();
      if (presetsData.success) {
        this.presets = presetsData.presets;
      }

      // Set active conversation from URL or first conversation
      const urlParams = new URLSearchParams(window.location.search);
      const conversationId = urlParams.get('conversation');
      if (conversationId) {
        this.selectConversation(conversationId);
      } else if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      throw error;
    }
  }

  // Setup WebSocket connection
  setupWebSocket() {
    try {
      this.socket = io();
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        this.updateConnectionStatus();
        
        // Join current conversation room if available
        if (this.currentConversation) {
          this.socket.emit('join_conversation', this.currentConversation.id);
        }
        
        // Process queued messages
        this.processMessageQueue();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
        this.updateConnectionStatus();
      });

      this.socket.on('new_message', (data) => {
        this.handleNewMessage(data);
      });

      this.socket.on('ai_typing', (data) => {
        this.handleAITyping(data);
      });

      this.socket.on('user_typing', (data) => {
        this.handleUserTyping(data);
      });

      this.socket.on('error', (data) => {
        console.error('WebSocket error:', data);
        this.showError(data.message || 'WebSocket error occurred');
      });

    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      this.showError('Real-time features unavailable');
    }
  }

  // Bind UI event listeners
  bindEvents() {
    // New conversation button
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="new-conversation"]')) {
        e.preventDefault();
        this.createNewConversation();
      }
    });

    // Select conversation
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="select-conversation"]')) {
        e.preventDefault();
        const conversationItem = e.target.closest('.conversation-item');
        const conversationId = conversationItem.dataset.conversationId;
        this.selectConversation(conversationId);
      }
    });

    // Delete conversation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="delete-conversation"]')) {
        e.preventDefault();
        e.stopPropagation();
        const conversationId = e.target.dataset.conversationId;
        this.deleteConversation(conversationId);
      }
    });

    // Chat form submission
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Message input keyboard shortcuts
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Character count and typing indicators
      messageInput.addEventListener('input', (e) => {
        this.updateCharacterCount();
        this.handleTypingIndicator();
      });
    }

    // Search conversations
    const conversationSearch = document.getElementById('conversation-search');
    if (conversationSearch) {
      conversationSearch.addEventListener('input', (e) => {
        this.searchConversations(e.target.value);
      });
    }

    // Search presets
    const presetSearch = document.getElementById('preset-search');
    if (presetSearch) {
      presetSearch.addEventListener('input', (e) => {
        this.searchPresets(e.target.value);
      });
    }

    // Use preset
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="use-preset"]')) {
        e.preventDefault();
        const presetId = e.target.dataset.presetId;
        this.usePreset(presetId);
      }
    });

    // Copy message
    document.addEventListener('click', (e) => {
      if (e.target.matches('.copy-message')) {
        e.preventDefault();
        const messageId = e.target.dataset.messageId;
        this.copyMessage(messageId);
      }
    });

    // Export conversation
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="export-conversation"]')) {
        e.preventDefault();
        const conversationId = e.target.dataset.conversationId;
        this.exportConversation(conversationId);
      }
    });

    // Edit conversation title
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="edit-title"]')) {
        e.preventDefault();
        const conversationId = e.target.dataset.conversationId;
        this.editConversationTitle(conversationId);
      }
    });
  }

  // Create new conversation
  async createNewConversation() {
    try {
      const title = prompt('Enter conversation title:') || 'New Conversation';
      
      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      const data = await response.json();
      if (data.success) {
        this.conversations.unshift(data.conversation);
        this.selectConversation(data.conversation.id);
        this.updateConversationList();
        this.showSuccess('New conversation created');
      } else {
        this.showError(data.error || 'Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      this.showError('Failed to create conversation');
    }
  }

  // Select conversation
  async selectConversation(conversationId) {
    try {
      // Leave current conversation room
      if (this.currentConversation && this.socket && this.isConnected) {
        this.socket.emit('leave_conversation', this.currentConversation.id);
      }

      // Find conversation in local data first
      let conversation = this.conversations.find(c => c.id === conversationId);
      
      // If not found locally, fetch from API
      if (!conversation) {
        const response = await fetch(`/api/ai/conversations/${conversationId}`);
        const data = await response.json();
        if (data.success) {
          conversation = data.conversation;
        } else {
          this.showError('Conversation not found');
          return;
        }
      }

      this.currentConversation = conversation;
      
      // Join new conversation room
      if (this.socket && this.isConnected) {
        this.socket.emit('join_conversation', conversationId);
      }

      // Update UI
      this.updateActiveConversation();
      this.updateMessages();
      this.updateURL();
      
      // Enable chat input
      this.enableChatInput();
      
    } catch (error) {
      console.error('Error selecting conversation:', error);
      this.showError('Failed to load conversation');
    }
  }

  // Send message with MCP preset support
  async sendMessage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (!message) return;

    try {
      // Auto-create conversation if none exists
      if (!this.currentConversation) {
        await this.createNewConversation();
        if (!this.currentConversation) {
          this.showError('Failed to create conversation');
          return;
        }
      }

      // Get MCP preset selection
      const presetSelector = document.getElementById('mcp-preset-selector');
      const selectedPreset = presetSelector?.value || null;
      const usePresetTools = selectedPreset && selectedPreset !== '';

      // Clear input and show processing state
      messageInput.value = '';
      this.updateCharacterCount();
      this.setFormLoading(true);
      this.showAIProcessing(usePresetTools);

      // Build request payload with MCP support
      const payload = {
        message: message,
        role: 'user'
      };

      // Add MCP preset parameters if selected
      if (selectedPreset && selectedPreset !== '') {
        payload.presetName = selectedPreset;
        payload.usePresetTools = true;
      }

      // Send via WebSocket if connected, otherwise via HTTP
      if (this.socket && this.isConnected) {
        this.socket.emit('send_message', {
          conversationId: this.currentConversation.id,
          ...payload
        });
      } else {
        // HTTP API with MCP support
        const response = await fetch(`/api/ai/conversations/${this.currentConversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.success) {
          // Handle both user message and AI response
          if (data.userMessage) {
            this.addMessageToUI(data.userMessage);
          }
          
          if (data.aiResponse) {
            // Add AI response with metadata
            this.addMessageToUI(data.aiResponse);
            this.showAIProcessingComplete(data.aiResponse.metadata);
          } else if (!data.aiProcessed) {
            // Show warning if AI processing failed
            this.showAIError(data.error || 'AI service temporarily unavailable');
          }
          
          this.updateConversationInList();
        } else {
          this.showError(data.error || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Failed to send message');
      messageInput.value = message; // Restore message on error
    } finally {
      this.setFormLoading(false);
      this.hideAIProcessing();
    }
  }

  // Handle new message from WebSocket
  handleNewMessage(data) {
    if (data.conversationId === this.currentConversation?.id) {
      this.addMessageToUI(data.message);
    }
    
    // Update conversation in list
    this.updateConversationInList(data.conversationId);
  }

  // Handle AI typing indicator
  handleAITyping(data) {
    if (data.conversationId === this.currentConversation?.id) {
      this.showAITyping(data.typing);
    }
  }

  // Add message to UI
  addMessageToUI(message) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;

    // Remove typing indicator
    const typingIndicator = messagesContainer.querySelector('.typing');
    if (typingIndicator) {
      typingIndicator.remove();
    }

    // Create message element
    const messageElement = this.createMessageElement(message);
    messagesContainer.appendChild(messageElement);

    // Update current conversation
    if (this.currentConversation) {
      this.currentConversation.messages.push(message);
      this.currentConversation.updatedAt = message.timestamp;
    }

    // Scroll to bottom
    this.scrollToBottom();
  }

  // Create message DOM element
  createMessageElement(message) {
    const isUser = message.role === 'user';
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.dataset.messageId = message.id;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = message.content.trim();

    const messageTime = document.createElement('time');
    messageTime.className = 'message-time';
    messageTime.textContent = this.formatTime(message.timestamp);

    const messageActions = document.createElement('div');
    messageActions.className = 'message-actions';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'btn-icon copy-message';
    copyButton.dataset.messageId = message.id;
    copyButton.title = 'Copy message';
    copyButton.textContent = '📋';

    messageActions.appendChild(copyButton);

    if (!isUser) {
      const regenerateButton = document.createElement('button');
      regenerateButton.className = 'btn-icon regenerate-message';
      regenerateButton.dataset.messageId = message.id;
      regenerateButton.title = 'Regenerate response';
      regenerateButton.textContent = '🔄';
      messageActions.appendChild(regenerateButton);
    }

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageActions);

    return messageDiv;
  }

  // Show AI typing indicator
  showAITyping(typing) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) return;

    const existingTyping = messagesContainer.querySelector('.typing');
    
    if (typing && !existingTyping) {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message ai-message typing';
      
      const content = document.createElement('div');
      content.className = 'message-content';
      
      const dots = document.createElement('div');
      dots.className = 'typing-dots';
      dots.innerHTML = '<span>.</span><span>.</span><span>.</span>';
      
      const text = document.createElement('span');
      text.className = 'typing-text';
      text.textContent = 'AI is thinking...';
      
      content.appendChild(dots);
      content.appendChild(text);
      typingDiv.appendChild(content);
      
      messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    } else if (!typing && existingTyping) {
      existingTyping.remove();
    }
  }

  // Update UI components
  updateUI() {
    this.updateConversationList();
    this.updatePresetList();
    this.updateActiveConversation();
    this.updateChatInterface(); // Nueva función para manejar la interfaz dinámicamente
    this.updateMessages();
    // Always enable chat input after UI updates
    this.enableChatInput();
  }

  // Nueva función para manejar la interfaz de chat dinámicamente
  updateChatInterface() {
    const chatInterface = document.querySelector('.chat-interface');
    if (!chatInterface) return;

    // Si hay conversación activa, mostrar interfaz de chat
    if (this.currentConversation) {
      this.showChatInterface();
    } else {
      this.showWelcomeInterface();
    }
  }

  showChatInterface() {
    const chatInterface = document.querySelector('.chat-interface');
    if (!chatInterface) return;

    // Ocultar vista de bienvenida
    const welcomeSection = chatInterface.querySelector('.chat-welcome');
    if (welcomeSection) {
      welcomeSection.style.display = 'none';
    }

    // Crear o mostrar contenedor de mensajes
    let messagesSection = chatInterface.querySelector('.chat-messages');
    if (!messagesSection) {
      messagesSection = document.createElement('div');
      messagesSection.className = 'chat-messages';
      
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'messages-container';
      messagesContainer.id = 'messages-container';
      
      messagesSection.appendChild(messagesContainer);
      
      // Insertar antes del chat input
      const chatInput = chatInterface.querySelector('.chat-input');
      if (chatInput) {
        chatInterface.insertBefore(messagesSection, chatInput);
      } else {
        chatInterface.appendChild(messagesSection);
      }
    } else {
      messagesSection.style.display = 'block';
    }
  }

  showWelcomeInterface() {
    const chatInterface = document.querySelector('.chat-interface');
    if (!chatInterface) return;

    // Mostrar vista de bienvenida
    const welcomeSection = chatInterface.querySelector('.chat-welcome');
    if (welcomeSection) {
      welcomeSection.style.display = 'block';
    }

    // Ocultar contenedor de mensajes
    const messagesSection = chatInterface.querySelector('.chat-messages');
    if (messagesSection) {
      messagesSection.style.display = 'none';
    }
  }

  updateConversationList() {
    // Implementation for updating conversation list in sidebar
    const conversationList = document.querySelector('.conversation-items');
    if (!conversationList) return;

    conversationList.innerHTML = '';
    this.conversations.forEach(conversation => {
      const item = this.createConversationItem(conversation);
      conversationList.appendChild(item);
    });
  }

  updateActiveConversation() {
    // Update active state in sidebar
    document.querySelectorAll('.conversation-item').forEach(item => {
      const isActive = item.dataset.conversationId === this.currentConversation?.id;
      item.classList.toggle('active', isActive);
    });
  }

  updatePresetList() {
    // Update preset dropdown with available presets
    const presetSelect = document.querySelector('#preset-select');
    if (!presetSelect) return;

    // Load presets from the API if not already loaded
    if (!this.presets || this.presets.length === 0) {
      this.loadPresets();
      return;
    }

    // Clear existing options except the first one ("No MCP Preset")
    const firstOption = presetSelect.querySelector('option[value=""]');
    presetSelect.innerHTML = '';
    if (firstOption) {
      presetSelect.appendChild(firstOption);
    } else {
      const noPresetOption = document.createElement('option');
      noPresetOption.value = '';
      noPresetOption.textContent = 'No MCP Preset';
      presetSelect.appendChild(noPresetOption);
    }

    // Add preset options
    this.presets.forEach(preset => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = `${preset.name}${preset.description ? ' - ' + preset.description.substring(0, 50) + '...' : ''}`;
      presetSelect.appendChild(option);
    });

    // Set selected preset from URL parameters if provided
    const urlParams = new URLSearchParams(window.location.search);
    const presetParam = urlParams.get('preset');
    if (presetParam) {
      presetSelect.value = presetParam;
    }
  }

  async loadPresets() {
    try {
      const response = await fetch('/api/presets');
      if (response.ok) {
        const data = await response.json();
        this.presets = data.presets || data || [];
        this.updatePresetList();
      } else {
        console.warn('Failed to load presets:', response.statusText);
      }
    } catch (error) {
      console.warn('Error loading presets:', error);
    }
  }

  updateMessages() {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer || !this.currentConversation) return;

    messagesContainer.innerHTML = '';
    this.currentConversation.messages.forEach(message => {
      const messageElement = this.createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });

    this.scrollToBottom();
  }

  // Utility methods
  scrollToBottom() {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  updateCharacterCount() {
    const messageInput = document.getElementById('message-input');
    const characterCount = document.querySelector('.character-count');
    if (messageInput && characterCount) {
      const count = messageInput.value.length;
      characterCount.textContent = `${count}/4000`;
      characterCount.classList.toggle('warning', count > 3500);
    }
  }

  // Handle typing indicator
  handleTypingIndicator() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput || !this.socket) return;

    // Clear existing typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Send typing start event
    this.socket.emit('typing-start', {
      conversationId: this.currentConversation?.id,
      userId: 'user'
    });

    // Set timeout to send typing stop
    this.typingTimeout = setTimeout(() => {
      this.socket.emit('typing-stop', {
        conversationId: this.currentConversation?.id,
        userId: 'user'
      });
    }, 2000);
  }

  // Update conversation in list
  updateConversationInList(conversationId = null) {
    if (!conversationId && this.currentConversation) {
      conversationId = this.currentConversation.id;
    }
    
    if (!conversationId) return;

    // Find conversation in list and update last message preview
    const conversationElements = document.querySelectorAll('.conversation-item');
    conversationElements.forEach(element => {
      const elementId = element.dataset.conversationId;
      if (elementId === conversationId.toString()) {
        const lastMessageElement = element.querySelector('.conversation-preview');
        if (lastMessageElement && this.currentConversation) {
          const messages = this.currentConversation.messages;
          if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const preview = lastMessage.content.trim().substring(0, 50) + 
                          (lastMessage.content.trim().length > 50 ? '...' : '');
            lastMessageElement.textContent = preview;
          }
        }
        
        // Update timestamp
        const timestampElement = element.querySelector('.conversation-timestamp');
        if (timestampElement) {
          timestampElement.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    });
  }

  setFormLoading(loading) {
    const sendButton = document.querySelector('.send-button');
    const messageInput = document.getElementById('message-input');
    
    if (sendButton) {
      sendButton.disabled = loading;
      sendButton.textContent = loading ? 'Sending...' : 'Send';
    }
    
    if (messageInput) {
      messageInput.disabled = loading;
    }
  }

  enableChatInput() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('.send-button');
    
    if (messageInput && sendButton) {
      const hasConversation = !!this.currentConversation;
      // Always keep input enabled - conversation will be created if needed
      messageInput.disabled = false;
      sendButton.disabled = false;
      
      messageInput.placeholder = hasConversation 
        ? 'Type your message...'
        : 'Type your message to start a new conversation...';
    }
  }

  updateURL() {
    if (this.currentConversation) {
      const url = new URL(window.location);
      url.searchParams.set('conversation', this.currentConversation.id);
      window.history.replaceState({}, '', url);
    }
  }

  // Notification methods
  showError(message) {
    console.error('AI Chat Error:', message);
    // Implement toast notification or error display
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    console.log('AI Chat Success:', message);
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    // Simple notification implementation
    // In a full implementation, use a proper toast library
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem;
      background: ${type === 'error' ? 'var(--danger-color)' : 'var(--success-color)'};
      color: white;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-medium);
      z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Process queued messages when WebSocket connects
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.socket.emit('send_message', message);
    }
  }

  updateConnectionStatus() {
    // Update UI to show connection status
    const statusElement = document.querySelector('.connection-status');
    if (statusElement) {
      statusElement.textContent = this.isConnected ? 'Connected' : 'Disconnected';
      statusElement.className = `connection-status ${this.isConnected ? 'connected' : 'disconnected'}`;
    }
  }

  // Additional placeholder methods for full functionality
  deleteConversation(conversationId) {
    // Implement conversation deletion
    console.log('Delete conversation:', conversationId);
  }

  searchConversations(query) {
    // Implement conversation search
    console.log('Search conversations:', query);
  }

  searchPresets(query) {
    // Implement preset search
    console.log('Search presets:', query);
  }

  usePreset(presetId) {
    // Implement preset usage - set in selector
    const selector = document.getElementById('mcp-preset-selector');
    if (selector) {
      const option = selector.querySelector(`option[data-preset-id="${presetId}"]`);
      if (option) {
        selector.value = option.value;
        this.handlePresetSelection(option.value);
      }
    }
    console.log('Use preset:', presetId);
  }

  copyMessage(messageId) {
    // Implement message copying
    console.log('Copy message:', messageId);
  }

  exportConversation(conversationId) {
    // Implement conversation export
    console.log('Export conversation:', conversationId);
  }

  editConversationTitle(conversationId) {
    // Implement title editing
    console.log('Edit conversation title:', conversationId);
  }

  // MCP Preset Management
  async loadMCPPresets() {
    try {
      const response = await fetch('/api/presets?limit=50');
      const data = await response.json();
      
      if (data.success && data.presets) {
        this.populatePresetSelector(data.presets);
      } else {
        console.warn('Failed to load MCP presets:', data.error);
      }
    } catch (error) {
      console.error('Error loading MCP presets:', error);
    }
  }

  populatePresetSelector(presets) {
    const selector = document.getElementById('mcp-preset-selector');
    if (!selector) return;

    // Clear existing options (except default)
    selector.innerHTML = '<option value="">No MCP Preset</option>';

    // Add preset options
    presets.forEach(preset => {
      const option = document.createElement('option');
      option.value = preset.name;
      option.textContent = `${preset.name} - ${preset.description.substring(0, 50)}${preset.description.length > 50 ? '...' : ''}`;
      option.dataset.presetId = preset.id;
      selector.appendChild(option);
    });

    // Setup preset change handler
    selector.addEventListener('change', (e) => {
      this.handlePresetSelection(e.target.value);
    });
  }

  handlePresetSelection(presetName) {
    const indicator = document.getElementById('mcp-tools-indicator');
    const status = document.getElementById('preset-status');
    
    if (presetName && presetName !== '') {
      // Show MCP tools indicator
      if (indicator) indicator.style.display = 'flex';
      if (status) status.textContent = `MCP: ${presetName}`;
    } else {
      // Hide MCP tools indicator
      if (indicator) indicator.style.display = 'none';
      if (status) status.textContent = 'Ready';
    }
  }

  // AI Processing States
  showAIProcessing(withMCP = false) {
    const status = document.getElementById('ai-status');
    const button = document.getElementById('send-button');
    const sendText = button?.querySelector('.send-text');
    const sendLoading = button?.querySelector('.send-loading');
    
    if (status) {
      status.textContent = withMCP ? 'AI Processing with MCP Tools...' : 'AI Processing...';
      status.style.display = 'inline';
    }
    
    if (sendText) sendText.style.display = 'none';
    if (sendLoading) sendLoading.style.display = 'inline';
  }

  hideAIProcessing() {
    const status = document.getElementById('ai-status');
    const button = document.getElementById('send-button');
    const sendText = button?.querySelector('.send-text');
    const sendLoading = button?.querySelector('.send-loading');
    
    if (status) status.style.display = 'none';
    if (sendText) sendText.style.display = 'inline';
    if (sendLoading) sendLoading.style.display = 'none';
  }

  showAIProcessingComplete(metadata = {}) {
    if (metadata.hadFunctionCalls) {
      this.showNotification('AI response generated using MCP tools', 'success');
    }
    
    if (metadata.presetUsed) {
      console.log(`AI response used preset: ${metadata.presetUsed}`);
    }
  }

  showAIError(errorMessage) {
    this.showNotification(errorMessage, 'warning');
    
    // Update status to show fallback mode
    const status = document.getElementById('preset-status');
    if (status) {
      status.textContent = 'AI Service Unavailable';
      status.className = 'preset-status error';
      
      // Reset after 5 seconds
      setTimeout(() => {
        status.textContent = 'Ready';
        status.className = 'preset-status';
      }, 5000);
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('chat-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'chat-notification';
      notification.className = 'chat-notification';
      document.querySelector('.chat-interface')?.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `chat-notification ${type} show`;

    // Auto-hide after 4 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 4000);
  }

  // Create conversation item DOM element for sidebar
  createConversationItem(conversation) {
    const item = document.createElement('li');
    item.className = 'conversation-item';
    item.dataset.conversationId = conversation.id;
    item.dataset.action = 'select-conversation';

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const previewText = lastMessage 
      ? (lastMessage.content.trim().length > 50 
          ? lastMessage.content.trim().substring(0, 50) + '...' 
          : lastMessage.content.trim())
      : 'No messages yet';

    item.innerHTML = `
      <div class="conversation-header">
        <h3 class="conversation-title">${conversation.title}</h3>
        <time class="conversation-time">${this.formatTimeAgo(conversation.updatedAt)}</time>
      </div>
      <p class="conversation-preview">${previewText}</p>
      <div class="conversation-meta">
        <span class="message-count">${conversation.messages.length} messages</span>
        ${conversation.preset ? `<span class="preset-badge">${conversation.preset}</span>` : ''}
      </div>
      <div class="conversation-actions">
        <button class="btn-icon delete-conversation" data-conversation-id="${conversation.id}" data-action="delete-conversation" title="Archive conversation">🗑️</button>
      </div>
    `;

    return item;
  }

  // Format time ago helper
  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  }
}

// Initialize AI Chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('ai-page')) {
    window.aiChat = new AIChat();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIChat;
}