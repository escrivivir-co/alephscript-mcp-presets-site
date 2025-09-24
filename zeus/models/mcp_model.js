// MCP server model - following diogenes pattern

class MCPModel {
  constructor(data = {}) {
    this.serverId = data.serverId || null;
    this.name = data.name || '';
    this.url = data.url || '';
    this.status = data.status || 'disconnected'; // connected, disconnected, error
    this.tools = data.tools || [];
    this.resources = data.resources || [];
    this.prompts = data.prompts || [];
    this.capabilities = data.capabilities || [];
    this.version = data.version || '1.0.0';
    this.description = data.description || '';
    this.connectedAt = data.connectedAt || null;
    this.lastPing = data.lastPing || null;
    this.errorCount = data.errorCount || 0;
    this.metadata = data.metadata || {};
  }

  connect() {
    this.status = 'connected';
    this.connectedAt = new Date().toISOString();
    this.lastPing = new Date().toISOString();
    this.errorCount = 0;
  }

  disconnect() {
    this.status = 'disconnected';
    this.connectedAt = null;
    this.lastPing = null;
  }

  setError(errorMessage) {
    this.status = 'error';
    this.errorCount += 1;
    this.metadata.lastError = {
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
  }

  ping() {
    if (this.status === 'connected') {
      this.lastPing = new Date().toISOString();
    }
  }

  addTool(tool) {
    const toolData = {
      name: tool.name || '',
      description: tool.description || '',
      parameters: tool.parameters || {},
      schema: tool.schema || null
    };
    
    // Remove existing tool with same name
    this.tools = this.tools.filter(t => t.name !== toolData.name);
    this.tools.push(toolData);
  }

  removeTool(toolName) {
    this.tools = this.tools.filter(t => t.name !== toolName);
  }

  getTool(toolName) {
    return this.tools.find(t => t.name === toolName) || null;
  }

  addResource(resource) {
    const resourceData = {
      name: resource.name || '',
      uri: resource.uri || '',
      mimeType: resource.mimeType || '',
      description: resource.description || ''
    };
    
    // Remove existing resource with same name
    this.resources = this.resources.filter(r => r.name !== resourceData.name);
    this.resources.push(resourceData);
  }

  removeResource(resourceName) {
    this.resources = this.resources.filter(r => r.name !== resourceName);
  }

  getResource(resourceName) {
    return this.resources.find(r => r.name === resourceName) || null;
  }

  addPrompt(prompt) {
    const promptData = {
      name: prompt.name || '',
      description: prompt.description || '',
      arguments: prompt.arguments || []
    };
    
    // Remove existing prompt with same name
    this.prompts = this.prompts.filter(p => p.name !== promptData.name);
    this.prompts.push(promptData);
  }

  removePrompt(promptName) {
    this.prompts = this.prompts.filter(p => p.name !== promptName);
  }

  getPrompt(promptName) {
    return this.prompts.find(p => p.name === promptName) || null;
  }

  isHealthy() {
    return this.status === 'connected' && this.errorCount < 5;
  }

  toJSON() {
    return {
      serverId: this.serverId,
      name: this.name,
      url: this.url,
      status: this.status,
      tools: this.tools,
      resources: this.resources,
      prompts: this.prompts,
      capabilities: this.capabilities,
      version: this.version,
      description: this.description,
      connectedAt: this.connectedAt,
      lastPing: this.lastPing,
      errorCount: this.errorCount,
      metadata: this.metadata
    };
  }

  static fromJSON(data) {
    return new MCPModel(data);
  }
}

module.exports = MCPModel;