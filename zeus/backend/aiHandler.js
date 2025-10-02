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
      
      // Smart engine selection based on context
      const engineType = this.selectOptimalEngine({
        hasPreset: !!presetName,
        isDebugMode: this.config.debug || false,
        userPreference: this.config.ai?.enginePreference || 'auto'
      });
      
      // Apply engine configuration
      await this.applyEngineConfiguration(payload, engineType, presetName);
      
      // Add MCP configuration if preset is specified (for MCP engines)
      if (presetName && (engineType.includes('MCP') || engineType === 'auto')) {
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
      
      // Send request to SLMo42 with extended timeout (10 minutes for LLM inference)
      const response = await axios.post(this.config.ai.endpoint + '/ai', payload, {
        timeout: this.config.mcp?.timeout || 600000, // 10 minutes for SLM inference
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.answer) {
        console.log('SLMo42 response received:', {
          model: response.data.model || 'SLMo42',
          hadFunctionCalls: response.data.hadFunctionCalls || false,
          answerType: typeof response.data.answer,
          answerLength: typeof response.data.answer === 'string' ? response.data.answer.length : 'object'
        });
        
        // Handle both string and object responses from SLMo42
        let processedAnswer;
        if (typeof response.data.answer === 'string') {
          processedAnswer = response.data.answer;
        } else if (typeof response.data.answer === 'object') {
          // Convert object response to formatted string
          processedAnswer = JSON.stringify(response.data.answer, null, 2);
          console.log('SLMo42 returned object answer, converted to JSON string');
        } else {
          processedAnswer = String(response.data.answer);
        }
        
        return {
          answer: processedAnswer,
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

  /**
   * Smart engine selection based on context
   * @param {Object} context - Context for engine selection
   * @returns {string} - Selected engine type
   */
  selectOptimalEngine(context) {
    const { hasPreset, isDebugMode, userPreference } = context;
    
    // User override takes precedence
    if (userPreference && userPreference !== 'auto') {
      console.log(`🎯 Engine selection: User preference '${userPreference}'`);
      return userPreference;
    }
    
    // Smart selection based on context
    if (isDebugMode) {
      console.log('🐛 Engine selection: Debug mode - using enhanced debugging engine');
      return 'llama_functions';
    }
    
    if (hasPreset) {
      console.log('📋 Engine selection: Preset detected - using native MCP engine');
      return 'node_llama_cpp_MCP_functions';
    }
    
    console.log('⚡ Engine selection: Basic query - using production engine');
    return 'node_llama_cpp_functions';
  }

  /**
   * Apply engine-specific configuration to payload
   * @param {Object} payload - Request payload to modify
   * @param {string} engineType - Selected engine type
   * @param {string} presetName - Optional preset name
   */
  async applyEngineConfiguration(payload, engineType, presetName) {
    switch(engineType) {
      case 'llama_functions':
        payload.llama_functions = true;
        payload.functionSets = ["fruits", "system"];
        console.log('🔧 Applied llama_functions configuration with enhanced debugging');
        break;
        
      case 'node_llama_cpp_MCP_functions':
        payload.node_llama_cpp_MCP_functions = true;
        console.log('📡 Applied node_llama_cpp_MCP_functions configuration for native MCP support');
        break;
        
      case 'llama_MCP_functions':
        payload.llama_MCP_functions = true;
        payload.mcpServerUrl = this.config.mcp?.servers?.[0]?.["devops-mcp-server"]?.url || "http://localhost:3003";
        console.log('🔀 Applied llama_MCP_functions configuration for hybrid MCP implementation');
        break;
        
      case 'node_llama_cpp_functions':
      default:
        payload.node_llama_cpp_functions = true;
        payload.functionSets = ["fruits", "system"];
        console.log('🚀 Applied node_llama_cpp_functions configuration for production optimization');
        break;
    }
  }

  clearAllConversations() {
    this.conversations = [];
    this.saveConversations();
    return true;
  }
}

module.exports = AIHandler;