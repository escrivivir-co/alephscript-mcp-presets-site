// AI conversation model - following diogenes pattern

class AIModel {
  constructor(data = {}) {
    this.conversationId = data.conversationId || null;
    this.title = data.title || 'New Conversation';
    this.messages = data.messages || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.model = data.model || 'default';
    this.totalTokens = data.totalTokens || 0;
    this.preset = data.preset || null;
    this.status = data.status || 'active'; // active, archived, deleted
  }

  addMessage(role, content, metadata = {}) {
    const message = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      role: role, // 'user' or 'assistant'
      content: content,
      timestamp: new Date().toISOString(),
      metadata: metadata
    };
    
    this.messages.push(message);
    this.updatedAt = new Date().toISOString();
    
    if (metadata.tokens) {
      this.totalTokens += metadata.tokens;
    }
    
    return message;
  }

  getLastMessage() {
    return this.messages[this.messages.length - 1] || null;
  }

  getMessageById(messageId) {
    return this.messages.find(msg => msg.id === messageId) || null;
  }

  deleteMessage(messageId) {
    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      this.messages.splice(messageIndex, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  clearMessages() {
    this.messages = [];
    this.totalTokens = 0;
    this.updatedAt = new Date().toISOString();
  }

  setTitle(newTitle) {
    this.title = newTitle;
    this.updatedAt = new Date().toISOString();
  }

  archive() {
    this.status = 'archived';
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      conversationId: this.conversationId,
      title: this.title,
      messages: this.messages,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      model: this.model,
      totalTokens: this.totalTokens,
      preset: this.preset,
      status: this.status
    };
  }

  static fromJSON(data) {
    return new AIModel(data);
  }

  getMessageCount() {
    return this.messages.length;
  }

  getUserMessageCount() {
    return this.messages.filter(msg => msg.role === 'user').length;
  }

  getAssistantMessageCount() {
    return this.messages.filter(msg => msg.role === 'assistant').length;
  }
}

module.exports = AIModel;