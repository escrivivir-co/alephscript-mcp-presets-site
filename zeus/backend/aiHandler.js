const axios = require('../server/node_modules/axios');
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../configs/config-manager');

class AIHandler {
  constructor() {
    this.config = getConfig();
    this.historyPath = path.join(__dirname, '..', 'configs', 'ai-history.json');
    this.conversations = this.loadConversations();
  }

  loadConversations() {
    try {
      if (fs.existsSync(this.historyPath)) {
        const data = fs.readFileSync(this.historyPath, 'utf8');
        const history = JSON.parse(data);
        return history.conversations || [];
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    return [];
  }

  saveConversations() {
    try {
      const history = {
        conversations: this.conversations,
        lastUpdated: new Date().toISOString(),
        totalConversations: this.conversations.length
      };
      fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving conversations:', error);
      return false;
    }
  }

  async sendMessage(message, conversationId = null) {
    try {
      // Placeholder for AI API integration
      // In a real implementation, this would call the AI service
      
      const response = {
        id: Date.now().toString(),
        message: "AI response placeholder - not implemented yet",
        timestamp: new Date().toISOString(),
        model: "placeholder",
        tokens: 0
      };

      // Create or update conversation
      let conversation = this.conversations.find(c => c.id === conversationId);
      
      if (!conversation) {
        conversation = {
          id: Date.now().toString(),
          title: message.substring(0, 50) + '...',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.conversations.push(conversation);
      }

      // Add user message
      conversation.messages.push({
        id: Date.now().toString() + '_user',
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // Add AI response
      conversation.messages.push({
        id: response.id,
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
        metadata: {
          model: response.model,
          tokens: response.tokens
        }
      });

      conversation.updatedAt = new Date().toISOString();
      this.saveConversations();

      return {
        conversation: conversation,
        response: response
      };

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getConversations() {
    return this.conversations;
  }

  getConversationById(id) {
    return this.conversations.find(c => c.id === id);
  }

  deleteConversation(id) {
    const conversationIndex = this.conversations.findIndex(c => c.id === id);
    if (conversationIndex === -1) {
      return false;
    }

    this.conversations.splice(conversationIndex, 1);
    this.saveConversations();
    return true;
  }

  createConversation(conversationData) {
    try {
      // Ensure unique ID
      if (!conversationData.id) {
        conversationData.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
      }
      
      // Validate required fields
      if (!conversationData.title || conversationData.title.trim().length === 0) {
        throw new Error('Conversation title is required');
      }
      
      // Set default values
      conversationData.messages = conversationData.messages || [];
      conversationData.createdAt = conversationData.createdAt || new Date().toISOString();
      conversationData.updatedAt = conversationData.updatedAt || new Date().toISOString();
      conversationData.status = conversationData.status || 'active';
      
      this.conversations.push(conversationData);
      this.saveConversations();
      return conversationData;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  clearAllConversations() {
    this.conversations = [];
    this.saveConversations();
    return true;
  }
}

module.exports = AIHandler;