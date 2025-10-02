const axios = require('axios');
const { getConfig } = require('../configs/config-manager');
const fs = require('fs');
const path = require('path');

class MCPHandler {
  constructor() {
    this.config = getConfig();
    this.servers = [];
    this.slmo42Endpoint = this.config.ai?.endpoint || 'http://localhost:4001';
    this.mockCatalogPath = path.join(__dirname, '../test/mock_mcp_catalog.json');
  }

  async discoverServers() {
    try {
      console.log('Discovering MCP servers via SLMo42 proxy...');
      const response = await axios.get(`${this.slmo42Endpoint}/ai/ui/mcp/list`, {
        timeout: this.config.mcp?.timeout || 600000 // 10 minutes for SLM inference
      });
      
      if (response.data && response.data.success) {
        console.log(`Found ${response.data.serversCount} MCP server(s) with ${response.data.totalTools} tools`);
        this.servers = response.data.catalog || [];
        return this.servers;
      } else {
        console.warn('MCP discovery returned unsuccessful response, falling back to mock data');
        return this.loadMockCatalog();
      }
    } catch (error) {
      console.error('Error discovering MCP servers:', error.message);
      console.log('Falling back to mock catalog data');
      return this.loadMockCatalog();
    }
  }

  async connectToServer(serverConfig) {
    try {
      console.log(`Connecting to MCP server: ${serverConfig.name || serverConfig.serverName}`);
      // Connection is validated through the catalog listing
      const catalog = await this.discoverServers();
      const server = catalog.find(s => s.serverName === serverConfig.serverName);
      return server?.isConnected || false;
    } catch (error) {
      console.error('Error connecting to MCP server:', error.message);
      return false;
    }
  }

  async listTools(serverId) {
    try {
      const catalog = await this.discoverServers();
      const server = catalog.find(s => s.serverName === serverId);
      return server?.tools || [];
    } catch (error) {
      console.error('Error listing MCP tools:', error.message);
      return [];
    }
  }

  async listResources(serverId) {
    try {
      const catalog = await this.discoverServers();
      const server = catalog.find(s => s.serverName === serverId);
      return server?.resources || [];
    } catch (error) {
      console.error('Error listing MCP resources:', error.message);
      return [];
    }
  }

  async listPrompts(serverId) {
    try {
      const catalog = await this.discoverServers();
      const server = catalog.find(s => s.serverName === serverId);
      return server?.prompts || [];
    } catch (error) {
      console.error('Error listing MCP prompts:', error.message);
      return [];
    }
  }

  async callTool(serverId, toolName, parameters) {
    try {
      const startTime = Date.now();
      
      // Placeholder implementation - in production this would make actual MCP calls
      const result = {
        success: true,
        data: {
          toolName: toolName,
          serverId: serverId,
          parameters: parameters,
          result: `Tool ${toolName} executed successfully (placeholder)`,
          timestamp: new Date().toISOString()
        },
        executionTime: Date.now() - startTime
      };
      
      console.log(`MCP tool call: ${toolName} on server ${serverId}`);
      return result;
    } catch (error) {
      console.error('Error calling MCP tool:', error);
      return { 
        success: false, 
        error: error.message,
        executionTime: Date.now() - Date.now()
      };
    }
  }

  loadMockCatalog() {
    try {
      const mockData = JSON.parse(fs.readFileSync(this.mockCatalogPath, 'utf8'));
      console.log('Loaded mock MCP catalog with', mockData.totalTools, 'tools');
      return mockData.catalog || [];
    } catch (error) {
      console.error('Error loading mock catalog:', error.message);
      return this.getFallbackServers();
    }
  }

  getFallbackServers() {
    // Minimal fallback when even mock data fails
    return [
      {
        serverName: 'localhost',
        serverInfo: { name: 'fallback-server', version: 'unknown', url: 'http://localhost:3003' },
        isConnected: false,
        tools: [],
        resources: [],
        prompts: []
      }
    ];
  }

  async getAllServers() {
    try {
      // Try to get live data first
      const liveServers = await this.discoverServers();
      if (liveServers && liveServers.length > 0) {
        return liveServers.map(server => ({
          id: server.serverName,
          name: server.serverInfo?.name || server.serverName,
          description: `MCP Server: ${server.serverInfo?.name || 'Unknown'}`,
          status: server.isConnected ? 'connected' : 'disconnected',
          type: 'mcp',
          toolsCount: server.tools?.length || 0,
          resourcesCount: server.resources?.length || 0,
          promptsCount: server.prompts?.length || 0,
          url: server.serverInfo?.url
        }));
      }
    } catch (error) {
      console.error('Error getting live servers:', error.message);
    }
    
    // Return fallback servers if live data fails
    return [
      {
        id: 'localhost',
        name: 'MCP Server (Offline)',
        description: 'MCP Server - Currently offline',
        status: 'disconnected',
        type: 'mcp',
        toolsCount: 0,
        resourcesCount: 0,
        promptsCount: 0
      }
    ];
  }

  async getConnectedServers() {
    const servers = await this.getAllServers();
    return servers.filter(server => server.status === 'connected');
  }

  async getTotalToolsCount() {
    const servers = await this.getAllServers();
    return servers.reduce((sum, server) => sum + server.toolsCount, 0);
  }

  async getTotalResourcesCount() {
    const servers = await this.getAllServers();
    return servers.reduce((sum, server) => sum + server.resourcesCount, 0);
  }

  async getServerTools(serverId) {
    try {
      const tools = await this.listTools(serverId);
      return tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        category: this.categorizeByName(tool.name),
        parameters: tool.parameters,
        type: tool.type || 'tool'
      }));
    } catch (error) {
      console.error(`Error getting tools for server ${serverId}:`, error.message);
      return [];
    }
  }

  categorizeByName(name) {
    // Simple categorization based on tool name patterns
    if (name.includes('file') || name.includes('directory') || name.includes('read') || name.includes('write')) return 'file';
    if (name.includes('prompt')) return 'prompt';
    if (name.includes('resource')) return 'resource';
    if (name.includes('server') || name.includes('system') || name.includes('status')) return 'system';
    if (name.includes('web') || name.includes('console')) return 'web';
    if (name.includes('simulator') || name.includes('game')) return 'simulation';
    return 'general';
  }

  async getServerResources(serverId) {
    try {
      const resources = await this.listResources(serverId);
      return resources.map(resource => ({
        name: resource.name,
        type: resource.mimeType || 'unknown',
        description: resource.description,
        uri: resource.uri,
        mimeType: resource.mimeType
      }));
    } catch (error) {
      console.error(`Error getting resources for server ${serverId}:`, error.message);
      return [];
    }
  }

  async getServerPrompts(serverId) {
    try {
      const prompts = await this.listPrompts(serverId);
      return prompts.map(prompt => ({
        name: prompt.name,
        category: this.categorizeByName(prompt.name),
        description: prompt.description,
        arguments: prompt.arguments || [],
        type: prompt.type || 'prompt'
      }));
    } catch (error) {
      console.error(`Error getting prompts for server ${serverId}:`, error.message);
      return [];
    }
  }

  async getServerList() {
    return await this.getAllServers();
  }
}

module.exports = MCPHandler;