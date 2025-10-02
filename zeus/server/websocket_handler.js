const { Server } = require('socket.io');
const AIHandler = require('../backend/aiHandler');

class WebSocketHandler {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true
      },
      // Extended timeouts for LLM inference (15 minutes)
      pingTimeout: 900000, // 15 minutes
      pingInterval: 25000   // 25 seconds between pings
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
          const { conversationId, message, role = 'user', presetName, usePresetTools } = data;
          
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
          
          // Update conversation preset if provided
          if (presetName) {
            conversation.preset = presetName;
          }
          
          // Save conversation
          const saved = this.aiHandler.saveConversations();
          
          if (saved) {
            // Broadcast message to all clients in the conversation room
            this.io.to(conversationId).emit('new_message', {
              conversationId: conversationId,
              message: newMessage
            });

            // If user message, generate AI response with preset support (async)
            if (role === 'user') {
              // Don't await - let it run asynchronously to not block the WebSocket
              this.generateAIResponse(conversationId, message, presetName, usePresetTools)
                .catch(error => {
                  console.error('Error in generateAIResponse:', error);
                  socket.emit('error', { 
                    message: 'Failed to generate AI response: ' + error.message 
                  });
                });
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

  async generateAIResponse(conversationId, userMessage, presetName = null, usePresetTools = false) {
    try {
      // Get conversation
      const conversation = this.aiHandler.getConversationById(conversationId);
      if (!conversation) return;

      // Emit typing indicator
      this.io.to(conversationId).emit('ai_typing', {
        conversationId: conversationId,
        typing: true
      });

      // Call SLMo42 for real AI response
      const aiResponse = await this.aiHandler.sendMessageToSLMo42(userMessage.trim(), {
        conversationId: conversationId,
        presetName: presetName || conversation.preset,
        usePresetTools: usePresetTools || !!conversation.preset
      });

      // Stop typing indicator
      this.io.to(conversationId).emit('ai_typing', {
        conversationId: conversationId,
        typing: false
      });

      if (aiResponse && aiResponse.answer) {
        // Add AI response to conversation
        const assistantMessage = {
          id: Date.now().toString() + '_ai_' + Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: aiResponse.answer,
          timestamp: new Date().toISOString(),
          metadata: {
            model: aiResponse.model || 'SLMo42',
            hadFunctionCalls: aiResponse.hadFunctionCalls || false,
            presetUsed: presetName || conversation.preset || null
          }
        };

        conversation.messages.push(assistantMessage);
        conversation.updatedAt = new Date().toISOString();
        
        // Save conversation
        const saved = this.aiHandler.saveConversations();
        
        if (saved) {
          // Send AI response via WebSocket
          this.io.to(conversationId).emit('new_message', {
            conversationId: conversationId,
            message: assistantMessage
          });
        }
      } else {
        // Handle error case
        this.io.to(conversationId).emit('error', {
          message: 'AI service temporarily unavailable'
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Stop typing indicator
      this.io.to(conversationId).emit('ai_typing', {
        conversationId: conversationId,
        typing: false
      });
      
      // Send error message
      this.io.to(conversationId).emit('error', { 
        message: 'Failed to generate AI response: ' + error.message
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