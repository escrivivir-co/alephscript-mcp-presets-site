const express = require('express');
const router = express.Router();

// Import existing backend handlers
const AIHandler = require('../backend/aiHandler');
const PresetHandler = require('../backend/presetHandler');
const MCPHandler = require('../backend/mcpHandler');

// Initialize handlers following diogenes pattern
const aiHandler = new AIHandler();
const presetHandler = new PresetHandler();
const mcpHandler = new MCPHandler();

/**
 * API Routes for Zeus Advanced Views (Phase 5)
 * Following diogenes routing patterns with comprehensive error handling
 */

// ===========================================
// AI CONVERSATION APIs (Phase 5.1)
// ===========================================

/**
 * GET /api/ai/conversations - List all conversations with pagination
 */
router.get('/ai/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const conversations = aiHandler.getConversations();
    
    // Apply search filter if provided
    let filteredConversations = conversations;
    if (search) {
      filteredConversations = conversations.filter(conv => 
        conv.title.toLowerCase().includes(search.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedConversations = filteredConversations.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      conversations: paginatedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredConversations.length,
        totalPages: Math.ceil(filteredConversations.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/conversations - Create new conversation
 */
router.post('/ai/conversations', async (req, res) => {
  try {
    const { title, initialMessage, preset } = req.body;
    
    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Conversation title is required'
      });
    }
    
    const conversationData = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      preset: preset || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      status: 'active'
    };
    
    // Add initial message if provided
    if (initialMessage && initialMessage.trim().length > 0) {
      conversationData.messages.push({
        id: Date.now().toString() + '_msg',
        role: 'user',
        content: initialMessage.trim(),
        timestamp: new Date().toISOString()
      });
    }
    
    const success = aiHandler.createConversation(conversationData);
    
    if (success) {
      res.status(201).json({
        success: true,
        conversation: conversationData,
        message: 'Conversation created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create conversation'
      });
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/conversations/:id - Get conversation details
 */
router.get('/ai/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = aiHandler.getConversationById(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      conversation: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/conversations/:id/messages - Add message to conversation
 */
router.post('/ai/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, role = 'user' } = req.body;
    
    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    if (!['user', 'assistant'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message role'
      });
    }
    
    const conversation = aiHandler.getConversationById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Add message to conversation
    const newMessage = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      role: role,
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();
    
    const success = aiHandler.saveConversations();
    
    if (success) {
      res.status(201).json({
        success: true,
        message: newMessage,
        conversationId: id
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save message'
      });
    }
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add message',
      message: error.message
    });
  }
});

/**
 * DELETE /api/ai/conversations/:id - Archive conversation
 */
router.delete('/ai/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = aiHandler.deleteConversation(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Conversation archived successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive conversation',
      message: error.message
    });
  }
});

// ===========================================
// PRESET LIBRARY APIs (Phase 5.2)
// ===========================================

/**
 * GET /api/presets - List presets with search/filter
 */
router.get('/presets', async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    let presets = presetHandler.getAllPresets();
    
    // Apply search filter
    if (search) {
      presets = presets.filter(preset => 
        preset.name.toLowerCase().includes(search.toLowerCase()) ||
        preset.description.toLowerCase().includes(search.toLowerCase()) ||
        preset.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (category) {
      presets = presets.filter(preset => preset.category === category);
    }
    
    // Apply sorting
    presets.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortOrder === 'desc') {
        return bValue.localeCompare(aValue);
      } else {
        return aValue.localeCompare(bValue);
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedPresets = presets.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      presets: paginatedPresets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: presets.length,
        totalPages: Math.ceil(presets.length / limit)
      },
      categories: ["General", "Development", "Analysis", "Creative"]
    });
  } catch (error) {
    console.error('Error fetching presets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch presets',
      message: error.message
    });
  }
});

/**
 * POST /api/presets - Create new preset
 */
router.post('/presets', async (req, res) => {
  try {
    const presetData = req.body;
    
    // Basic validation
    if (!presetData.name || presetData.name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Preset name is required'
      });
    }
    
    if (!presetData.prompt || presetData.prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Preset prompt is required'
      });
    }
    
    const preset = presetHandler.createPreset(presetData);
    
    if (preset) {
      res.status(201).json({
        success: true,
        preset: preset,
        message: 'Preset created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create preset'
      });
    }
  } catch (error) {
    console.error('Error creating preset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create preset',
      message: error.message
    });
  }
});

/**
 * GET /api/presets/:id - Get preset details
 */
router.get('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const preset = presetHandler.getPresetById(id);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }
    
    res.json({
      success: true,
      preset: preset
    });
  } catch (error) {
    console.error('Error fetching preset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preset',
      message: error.message
    });
  }
});

/**
 * PUT /api/presets/:id - Update preset
 */
router.put('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedPreset = presetHandler.updatePreset(id, updateData);
    
    if (updatedPreset) {
      res.json({
        success: true,
        preset: updatedPreset,
        message: 'Preset updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Preset not found or update failed'
      });
    }
  } catch (error) {
    console.error('Error updating preset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preset',
      message: error.message
    });
  }
});

/**
 * DELETE /api/presets/:id - Delete preset
 */
router.delete('/presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = presetHandler.deletePreset(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Preset deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }
  } catch (error) {
    console.error('Error deleting preset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete preset',
      message: error.message
    });
  }
});

/**
 * POST /api/presets/import - Import preset collection
 */
router.post('/presets/import', async (req, res) => {
  try {
    const { presets, overwrite = false } = req.body;
    
    if (!Array.isArray(presets)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid presets data - must be an array'
      });
    }
    
    const results = presetHandler.importPresets(presets, overwrite);
    
    res.json({
      success: true,
      results: results,
      message: `Imported ${results.imported} presets, skipped ${results.skipped}, errors ${results.errors}`
    });
  } catch (error) {
    console.error('Error importing presets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import presets',
      message: error.message
    });
  }
});

/**
 * GET /api/presets/export - Export preset collection
 */
router.get('/presets/export', async (req, res) => {
  try {
    const { format = 'json', category = '' } = req.query;
    let presets = presetHandler.getAllPresets();
    
    // Filter by category if specified
    if (category) {
      presets = presets.filter(preset => preset.category === category);
    }
    
    if (format === 'json') {
      res.json({
        success: true,
        presets: presets,
        exportDate: new Date().toISOString(),
        totalCount: presets.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Only JSON format is currently supported'
      });
    }
  } catch (error) {
    console.error('Error exporting presets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export presets',
      message: error.message
    });
  }
});

// ===========================================
// MCP EDITOR APIs (Phase 5.3)
// ===========================================

/**
 * GET /api/mcp/servers - List configured MCP servers
 */
router.get('/mcp/servers', async (req, res) => {
  try {
    const servers = await mcpHandler.getAllServers();
    
    res.json({
      success: true,
      servers: servers,
      totalCount: servers.length
    });
  } catch (error) {
    console.error('Error fetching MCP servers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MCP servers',
      message: error.message
    });
  }
});

/**
 * GET /api/mcp/servers/:id/tools - List server tools
 */
router.get('/mcp/servers/:id/tools', async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', category = '' } = req.query;
    
    const tools = await mcpHandler.getServerTools(id);
    
    if (!tools) {
      return res.status(404).json({
        success: false,
        error: 'Server not found or no tools available'
      });
    }
    
    // Apply search and category filters
    let filteredTools = tools;
    if (search) {
      filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (category) {
      filteredTools = filteredTools.filter(tool => tool.category === category);
    }
    
    res.json({
      success: true,
      serverId: id,
      tools: filteredTools,
      totalCount: filteredTools.length
    });
  } catch (error) {
    console.error('Error fetching server tools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch server tools',
      message: error.message
    });
  }
});

/**
 * GET /api/mcp/servers/:id/resources - List server resources
 */
router.get('/mcp/servers/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', type = '' } = req.query;
    
    const resources = await mcpHandler.getServerResources(id);
    
    if (!resources) {
      return res.status(404).json({
        success: false,
        error: 'Server not found or no resources available'
      });
    }
    
    // Apply search and type filters
    let filteredResources = resources;
    if (search) {
      filteredResources = resources.filter(resource => 
        resource.name.toLowerCase().includes(search.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (type) {
      filteredResources = filteredResources.filter(resource => resource.type === type);
    }
    
    res.json({
      success: true,
      serverId: id,
      resources: filteredResources,
      totalCount: filteredResources.length
    });
  } catch (error) {
    console.error('Error fetching server resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch server resources',
      message: error.message
    });
  }
});

/**
 * GET /api/mcp/servers/:id/prompts - List server prompts
 */
router.get('/mcp/servers/:id/prompts', async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', category = '' } = req.query;
    
    const prompts = await mcpHandler.getServerPrompts(id);
    
    if (!prompts) {
      return res.status(404).json({
        success: false,
        error: 'Server not found or no prompts available'
      });
    }
    
    // Apply search and category filters
    let filteredPrompts = prompts;
    if (search) {
      filteredPrompts = prompts.filter(prompt => 
        prompt.name.toLowerCase().includes(search.toLowerCase()) ||
        (prompt.description && prompt.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (category) {
      filteredPrompts = filteredPrompts.filter(prompt => prompt.category === category);
    }
    
    res.json({
      success: true,
      serverId: id,
      prompts: filteredPrompts,
      totalCount: filteredPrompts.length
    });
  } catch (error) {
    console.error('Error fetching server prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch server prompts',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/servers/:id/call - Execute MCP tool call
 */
router.post('/mcp/servers/:id/call', async (req, res) => {
  try {
    const { id } = req.params;
    const { toolName, arguments: toolArgs = {} } = req.body;
    
    // Validation
    if (!toolName || toolName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tool name is required'
      });
    }
    
    const result = await mcpHandler.callTool(id, toolName, toolArgs);
    
    if (result.success) {
      res.json({
        success: true,
        result: result.data,
        executionTime: result.executionTime,
        toolName: toolName
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        toolName: toolName
      });
    }
  } catch (error) {
    console.error('Error executing MCP tool call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute MCP tool call',
      message: error.message,
      toolName: req.body.toolName
    });
  }
});

// ===========================================
// STATISTICS APIs (Phase 5.4)
// ===========================================

/**
 * GET /api/stats/overview - System overview statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = {
      // Conversation statistics
      conversations: {
        total: aiHandler.getConversations().length,
        active: aiHandler.getConversations().filter(c => c.status === 'active').length,
        totalMessages: aiHandler.getConversations().reduce((sum, c) => sum + c.messages.length, 0)
      },
      
      // Preset statistics
      presets: {
        total: presetHandler.getAllPresets().length,
        byCategory: {}
      },
      
      // MCP server statistics
      mcpServers: {
        total: (await mcpHandler.getAllServers()).length,
        connected: (await mcpHandler.getConnectedServers()).length,
        totalTools: await mcpHandler.getTotalToolsCount(),
        totalResources: await mcpHandler.getTotalResourcesCount()
      },
      
      // System statistics
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    };
    
    // Calculate preset statistics by category
    const presets = presetHandler.getAllPresets();
    const categories = ["General", "Development", "Analysis", "Creative"];
    categories.forEach(category => {
      stats.presets.byCategory[category] = presets.filter(p => p.category === category).length;
    });
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching overview statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/stats/usage - Usage analytics data
 */
router.get('/stats/usage', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // This would typically pull from a more sophisticated analytics system
    // For now, we'll provide sample data structure
    const usageData = {
      timeframe: timeframe,
      conversations: {
        dailyCount: [], // Array of {date, count} objects
        averageLength: 0,
        mostActiveHours: []
      },
      presets: {
        mostUsed: [], // Array of {presetId, name, usageCount} objects
        categoryDistribution: {},
        creationTrend: []
      },
      mcpTools: {
        mostCalled: [], // Array of {toolName, serverId, callCount} objects
        successRate: 0,
        averageExecutionTime: 0
      }
    };
    
    res.json({
      success: true,
      usage: usageData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/stats/performance - Performance metrics
 */
router.get('/stats/performance', async (req, res) => {
  try {
    const performance = {
      server: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          usage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2)
        },
        cpu: {
          // Note: CPU usage would require additional monitoring in real implementation
          usage: 0
        }
      },
      api: {
        responseTime: {
          average: 0, // Would be calculated from request logging
          p95: 0,
          p99: 0
        },
        requestCount: 0, // Would be tracked via middleware
        errorRate: 0
      },
      database: {
        // File-based storage metrics
        conversationsSize: 0,
        presetsSize: 0,
        configSize: 0
      }
    };
    
    res.json({
      success: true,
      performance: performance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics',
      message: error.message
    });
  }
});

module.exports = router;