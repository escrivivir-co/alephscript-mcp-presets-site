const { 
  div, section, header, h1, h2, h3, button, input, textarea, form, 
  ul, li, p, span, strong, time, select, option, nav, a 
} = require('hyperaxe');
const { template, contentSection, pageContainer } = require('./main_views');

/**
 * AI Conversation View - Advanced chat interface with real-time messaging
 * Follows diogenes patterns with enhanced functionality for Zeus
 */

/**
 * Main AI view component
 */
const aiView = (data = {}) => {
  const {
    conversations = [],
    activeConversation = null,
    presets = [],
    isLoading = false,
    error = null
  } = data;

  return template(
    'AI Conversations',
    pageContainer(
      section({ class: 'ai-container' },
        conversationSidebar({ conversations, activeConversation }),
        chatInterface({ activeConversation, isLoading, error }),
        presetPanel({ presets, activeConversation })
      )
    ),
    {
      currentPage: 'ai',
      styles: ['/assets/styles/ai-view.css'],
      scripts: ['/assets/js/ai-chat.js', '/assets/js/socket.io.js']
    }
  );
};

/**
 * Conversation sidebar with list and search
 */
const conversationSidebar = ({ conversations, activeConversation }) => {
  return div({ class: 'conversation-sidebar' },
    header({ class: 'sidebar-header' },
      h2('Conversations'),
      button({ 
        class: 'btn btn-primary new-conversation-btn',
        'data-action': 'new-conversation'
      }, '+ New Chat')
    ),
    
    div({ class: 'conversation-search' },
      input({
        type: 'text',
        placeholder: 'Search conversations...',
        class: 'search-input',
        id: 'conversation-search'
      })
    ),
    
    div({ class: 'conversation-list' },
      conversations.length > 0 
        ? conversationList(conversations, activeConversation)
        : emptyConversationState()
    )
  );
};

/**
 * Conversation list items
 */
const conversationList = (conversations, activeConversation) => {
  return ul({ class: 'conversation-items' },
    conversations.map(conversation => 
      conversationItem(conversation, activeConversation?.id === conversation.id)
    )
  );
};

/**
 * Individual conversation item
 */
const conversationItem = (conversation, isActive) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const previewText = lastMessage 
    ? (lastMessage.content.length > 50 
        ? lastMessage.content.substring(0, 50) + '...' 
        : lastMessage.content)
    : 'No messages yet';

  return li({ 
    class: `conversation-item ${isActive ? 'active' : ''}`,
    'data-conversation-id': conversation.id,
    'data-action': 'select-conversation'
  },
    div({ class: 'conversation-header' },
      h3({ class: 'conversation-title' }, conversation.title),
      time({ class: 'conversation-time' }, 
        formatTimeAgo(conversation.updatedAt)
      )
    ),
    
    p({ class: 'conversation-preview' }, previewText),
    
    div({ class: 'conversation-meta' },
      span({ class: 'message-count' }, 
        `${conversation.messages.length} messages`
      ),
      
      conversation.preset && span({ class: 'preset-badge' }, 
        conversation.preset
      )
    ),
    
    div({ class: 'conversation-actions' },
      button({
        class: 'btn-icon delete-conversation',
        'data-conversation-id': conversation.id,
        'data-action': 'delete-conversation',
        title: 'Archive conversation'
      }, '🗑️')
    )
  );
};

/**
 * Empty state for conversations
 */
const emptyConversationState = () => {
  return div({ class: 'empty-state' },
    div({ class: 'empty-icon' }, '💬'),
    p('No conversations yet'),
    p({ class: 'text-secondary' }, 
      'Start a new conversation to begin chatting with AI'
    )
  );
};

/**
 * Main chat interface area
 */
const chatInterface = ({ activeConversation, isLoading, error }) => {
  return div({ class: 'chat-interface' },
    chatHeader(activeConversation),
    
    error && chatError(error),
    
    activeConversation 
      ? chatMessages(activeConversation.messages, isLoading)
      : chatWelcome(),
      
    chatInput(activeConversation)
  );
};

/**
 * Chat header with conversation title and actions
 */
const chatHeader = (conversation) => {
  if (!conversation) {
    return header({ class: 'chat-header empty' },
      h1('Select a conversation to start chatting')
    );
  }

  return header({ class: 'chat-header' },
    div({ class: 'chat-title-section' },
      h1(conversation.title),
      div({ class: 'chat-meta' },
        span(`${conversation.messages.length} messages`),
        conversation.preset && span({ class: 'preset-info' }, 
          `Preset: ${conversation.preset}`
        )
      )
    ),
    
    div({ class: 'chat-actions' },
      button({
        class: 'btn btn-secondary',
        'data-action': 'export-conversation',
        'data-conversation-id': conversation.id
      }, 'Export'),
      
      button({
        class: 'btn btn-secondary',
        'data-action': 'edit-title',
        'data-conversation-id': conversation.id
      }, 'Rename')
    )
  );
};

/**
 * Chat error display
 */
const chatError = (error) => {
  return div({ class: 'chat-error' },
    strong('Error: '), error
  );
};

/**
 * Chat messages area
 */
const chatMessages = (messages, isLoading) => {
  return div({ class: 'chat-messages' },
    div({ class: 'messages-container', id: 'messages-container' },
      messages.map(message => chatMessage(message)),
      
      isLoading && typingIndicator()
    )
  );
};

/**
 * Welcome state for chat
 */
const chatWelcome = () => {
  return div({ class: 'chat-welcome' },
    div({ class: 'welcome-content' },
      h2('Welcome to AI Conversations'),
      p('Select an existing conversation or start a new one to begin chatting.'),
      
      div({ class: 'welcome-actions' },
        button({
          class: 'btn btn-primary',
          'data-action': 'new-conversation'
        }, 'Start New Conversation'),
        
        button({
          class: 'btn btn-secondary',
          'data-action': 'browse-presets'
        }, 'Browse Presets')
      )
    )
  );
};

/**
 * Individual chat message
 */
const chatMessage = (message) => {
  const isUser = message.role === 'user';
  
  return div({ 
    class: `message ${isUser ? 'user-message' : 'ai-message'}`,
    'data-message-id': message.id 
  },
    div({ class: 'message-content' },
      div({ class: 'message-text' }, message.content),
      time({ class: 'message-time' }, 
        formatTime(message.timestamp)
      )
    ),
    
    div({ class: 'message-actions' },
      button({
        class: 'btn-icon copy-message',
        'data-message-id': message.id,
        title: 'Copy message'
      }, '📋'),
      
      !isUser && button({
        class: 'btn-icon regenerate-message',
        'data-message-id': message.id,
        title: 'Regenerate response'
      }, '🔄')
    )
  );
};

/**
 * Typing indicator for AI responses
 */
const typingIndicator = () => {
  return div({ class: 'message ai-message typing' },
    div({ class: 'message-content' },
      div({ class: 'typing-dots' },
        span('.'), span('.'), span('.')
      ),
      span({ class: 'typing-text' }, 'AI is thinking...')
    )
  );
};

/**
 * Chat input area with message form and MCP preset selector
 */
const chatInput = (activeConversation) => {
  const isDisabled = false; // Always enable input - let JS handle conversation creation
  
  return div({ class: 'chat-input-area' },
    // MCP Preset Selector Section
    div({ class: 'mcp-preset-section' },
      div({ class: 'preset-selector-container' },
        select({
          id: 'mcp-preset-selector',
          class: 'preset-selector',
          'data-placeholder': 'Select MCP Preset (Optional)'
        },
          option({ value: '', selected: true }, 'No MCP Preset'),
          option({ value: 'loading', disabled: true }, 'Loading presets...')
        ),
        
        div({ class: 'preset-info' },
          span({ class: 'preset-status', id: 'preset-status' }, 'Ready'),
          button({
            type: 'button',
            class: 'btn-icon preset-help',
            id: 'preset-help-btn',
            title: 'Learn about MCP presets'
          }, '❓')
        )
      ),
      
      div({ class: 'mcp-tools-indicator', id: 'mcp-tools-indicator', style: 'display: none;' },
        span({ class: 'mcp-icon' }, '🔧'),
        span({ class: 'mcp-text' }, 'MCP Tools Active')
      )
    ),
    
    form({ 
      class: 'chat-form',
      id: 'chat-form'
    },
      div({ class: 'input-container' },
        textarea({
          id: 'message-input',
          placeholder: !activeConversation 
            ? 'Type your message to start a new conversation...'
            : 'Type your message...',
          rows: '3',
          disabled: isDisabled,
          class: 'message-textarea'
        }),
        
        div({ class: 'input-actions' },
          button({
            type: 'submit',
            class: `btn btn-primary send-button ${isDisabled ? 'disabled' : ''}`,
            disabled: isDisabled,
            id: 'send-button'
          }, 
            span({ class: 'send-text' }, 'Send'),
            span({ class: 'send-loading', style: 'display: none;' }, 'Processing...')
          ),
          
          button({
            type: 'button',
            class: 'btn btn-secondary preset-quick-select',
            disabled: isDisabled,
            title: 'Quick select from recent presets',
            id: 'preset-quick-btn'
          }, '�')
        )
      )
    ),
    
    div({ class: 'input-helpers' },
      span({ class: 'shortcut-hint' }, 'Press Ctrl+Enter to send'),
      div({ class: 'input-status' },
        span({ class: 'character-count' }, '0/4000'),
        span({ class: 'ai-status', id: 'ai-status', style: 'display: none;' }, 'AI Processing...')
      )
    )
  );
};

/**
 * Preset selection panel
 */
const presetPanel = ({ presets, activeConversation }) => {
  return div({ class: 'preset-panel' },
    header({ class: 'preset-header' },
      h3('Quick Presets'),
      button({
        class: 'btn-icon toggle-presets',
        'data-action': 'toggle-presets',
        title: 'Toggle preset panel'
      }, '📚')
    ),
    
    div({ class: 'preset-content' },
      div({ class: 'preset-search' },
        input({
          type: 'text',
          placeholder: 'Search presets...',
          class: 'search-input small',
          id: 'preset-search'
        })
      ),
      
      div({ class: 'preset-list' },
        presets.length > 0 
          ? presetItems(presets)
          : emptyPresetState()
      )
    )
  );
};

/**
 * Preset list items
 */
const presetItems = (presets) => {
  return ul({ class: 'preset-items' },
    presets.slice(0, 10).map(preset => presetItem(preset))
  );
};

/**
 * Individual preset item
 */
const presetItem = (preset) => {
  return li({ 
    class: 'preset-item',
    'data-preset-id': preset.id,
    'data-action': 'use-preset'
  },
    div({ class: 'preset-info' },
      h4({ class: 'preset-name' }, preset.name),
      p({ class: 'preset-description' }, 
        preset.description.length > 60 
          ? preset.description.substring(0, 60) + '...'
          : preset.description
      )
    ),
    
    div({ class: 'preset-meta' },
      span({ class: 'preset-category' }, preset.category),
      button({
        class: 'btn btn-primary btn-small use-preset-btn',
        'data-preset-id': preset.id,
        'data-action': 'use-preset'
      }, 'Use')
    )
  );
};

/**
 * Empty preset state
 */
const emptyPresetState = () => {
  return div({ class: 'empty-state small' },
    p('No presets available'),
    a({ href: '/presets' }, 'Browse Preset Library')
  );
};

/**
 * Utility functions for time formatting
 */
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

module.exports = {
  aiView
};