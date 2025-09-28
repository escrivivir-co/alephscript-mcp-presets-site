const axios = require('axios');
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
      // Legacy method - now calls the new SLMo42 integration
      const options = { conversationId };
      return await this.sendMessageToSLMo42(message, options);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendMessageToSLMo42(message, options = {}) {
    try {
      const { conversationId, presetName, usePresetTools } = options;
      
      // Build MCP payload for SLMo42
      const payload = {
        input: message
      };
      
      // Add MCP configuration if preset is specified
      if (presetName) {
        payload.node_llama_cpp_MCP_functions = true;
        payload.presetName = presetName;
        payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url || "http://localhost:3003";
        
        if (usePresetTools) {
          payload.usePresetTools = true;
        }
      }
      
      console.log('Sending request to SLMo42:', {
        endpoint: this.config.ai.endpoint + '/ai',
        payload: payload
      });
      
      // Send request to SLMo42 with timeout
      const response = await axios.post(this.config.ai.endpoint + '/ai', payload, {
        timeout: this.config.mcp?.timeout || 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.answer) {
        console.log('SLMo42 response received:', {
          model: response.data.model || 'SLMo42',
          hadFunctionCalls: response.data.hadFunctionCalls || false,
          answerLength: response.data.answer.length
        });
        
        return {
          answer: response.data.answer,
          model: response.data.model || 'SLMo42',
          hadFunctionCalls: response.data.hadFunctionCalls || false,
          timestamp: new Date().toISOString(),
          presetUsed: presetName || null
        };
      } else {
        throw new Error('Invalid response format from SLMo42');
      }
      
    } catch (error) {
      // Enhanced error handling for different failure types
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error('SLMo42 service unavailable:', error.message);
        throw new Error('SLMo42 AI service is currently unavailable. Please ensure the service is running on ' + this.config.ai.endpoint);
      } else if (error.code === 'ECONNABORTED') {
        console.error('SLMo42 request timeout:', error.message);
        throw new Error('AI processing timed out. Please try again with a shorter message.');
      } else if (error.response) {
        console.error('SLMo42 API error:', error.response.status, error.response.data);
        throw new Error(`AI service error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
      } else {
        console.error('Unexpected error calling SLMo42:', error.message);
        throw new Error('Unexpected error during AI processing: ' + error.message);
      }
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