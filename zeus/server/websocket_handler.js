const { Server } = require('socket.io');
const AIHandler = require('../backend/aiHandler');

class WebSocketHandler {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true
      }
    });
    
    this.aiHandler = new AIHandler();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join conversation room
      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Client ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`Client ${socket.id} left conversation ${conversationId}`);
      });

      // Handle new chat message
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, message, role = 'user' } = data;
          
          // Validate input
          if (!conversationId || !message || message.trim().length === 0) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
          }

          // Get conversation
          const conversation = this.aiHandler.getConversationById(conversationId);
          if (!conversation) {
            socket.emit('error', { message: 'Conversation not found' });
            return;
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
          
          // Save conversation
          const saved = this.aiHandler.saveConversations();
          
          if (saved) {
            // Broadcast message to all clients in the conversation room
            this.io.to(conversationId).emit('new_message', {
              conversationId: conversationId,
              message: newMessage
            });

            // If user message, generate AI response (placeholder)
            if (role === 'user') {
              this.generateAIResponse(conversationId, message);
            }
          } else {
            socket.emit('error', { message: 'Failed to save message' });
          }
        } catch (error) {
          console.error('Error handling send_message:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        socket.to(data.conversationId).emit('user_typing', {
          userId: socket.id,
          conversationId: data.conversationId
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(data.conversationId).emit('user_stopped_typing', {
          userId: socket.id,
          conversationId: data.conversationId
        });
      });

      // Handle connection status
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  async generateAIResponse(conversationId, userMessage) {
    try {
      // Simulate AI thinking delay
      setTimeout(async () => {
        const conversation = this.aiHandler.getConversationById(conversationId);
        if (!conversation) return;

        // Emit typing indicator
        this.io.to(conversationId).emit('ai_typing', {
          conversationId: conversationId,
          typing: true
        });

        // Simulate AI processing time
        setTimeout(async () => {
          // Generate placeholder AI response
          const aiResponse = {
            id: Date.now().toString() + '_ai',
            role: 'assistant',
            content: `This is a placeholder AI response to: "${userMessage}". In a full implementation, this would call the actual AI service configured in the system.`,
            timestamp: new Date().toISOString()
          };

          // Add AI response to conversation
          conversation.messages.push(aiResponse);
          conversation.updatedAt = new Date().toISOString();
          
          // Save conversation
          const saved = this.aiHandler.saveConversations();
          
          if (saved) {
            // Stop typing indicator
            this.io.to(conversationId).emit('ai_typing', {
              conversationId: conversationId,
              typing: false
            });

            // Send AI response
            this.io.to(conversationId).emit('new_message', {
              conversationId: conversationId,
              message: aiResponse
            });
          }
        }, 2000); // 2 second AI "thinking" time
      }, 500); // 0.5 second delay before AI starts "thinking"
    } catch (error) {
      console.error('Error generating AI response:', error);
      this.io.to(conversationId).emit('error', { 
        message: 'Failed to generate AI response' 
      });
    }
  }

  // Broadcast system notifications
  broadcastNotification(type, data) {
    this.io.emit('notification', {
      type: type,
      data: data,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected clients count
  getConnectedClientsCount() {
    return this.io.engine.clientsCount;
  }

  // Broadcast to specific conversation
  broadcastToConversation(conversationId, event, data) {
    this.io.to(conversationId).emit(event, data);
  }
}

module.exports = WebSocketHandler;