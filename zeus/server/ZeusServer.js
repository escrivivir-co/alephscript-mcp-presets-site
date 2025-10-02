#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const debug = require("debug")("zeus");

// Configuration
const configPath = path.join(__dirname, "..", "configs", "zeus-config.json");
let config = {};

// Load configuration
try {
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(configData);
    debug("Configuration loaded from zeus-config.json");
  } else {
    // Default configuration
    config = {
      server: {
        port: 3012,
        host: "localhost"
      },
      features: {
        aiConversations: true,
        presetLibrary: true,
        mcpExplorer: true,
        themeSystem: true
      },
      theme: { current: "Clear-MCP" },
      debug: false
    };
    debug("Using default configuration");
  }
} catch (error) {
  console.error("Error loading configuration:", error.message);
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware setup (following diogenes pattern)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving (following diogenes pattern)
const clientPath = path.join(__dirname, "..", "client");
app.use("/assets", express.static(path.join(clientPath, "assets")));

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error("Zeus Server Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: config.debug ? err.message : "Something went wrong"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "zeus", 
    timestamp: new Date().toISOString() 
  });
});

// Main route handler - Home page
app.get("/", async (req, res) => {
  try {
    const homeView = require("../views/home_view");
    const htmlResponse = homeView.homeView();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).send(`
      <html>
        <head><title>Zeus - Error</title></head>
        <body>
          <h1>Error Loading Home</h1>
          <p>Unable to load home page: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// AI Conversation route
app.get("/ai", async (req, res) => {
  try {
    const aiView = require("../views/ai_view");
    const aiHandler = require("../backend/aiHandler");
    const presetHandler = require("../backend/presetHandler");
    const handler = new aiHandler();
    const presetManager = new presetHandler();
    
    // Load conversations and active conversation
    const conversations = handler.getConversations();
    const conversationId = req.query.conversation;
    const activeConversation = conversationId 
      ? handler.getConversationById(conversationId)
      : null;
      
    // Load available presets
    const presets = presetManager.getAllPresets().slice(0, 20);
    
    const htmlResponse = aiView.aiView({
      conversations,
      activeConversation,
      presets
    });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering AI page:', error);
    res.status(500).send(`
      <html>
        <head><title>AI Chat - Error</title></head>
        <body>
          <h1>Error Loading AI Chat</h1>
          <p>Unable to load AI conversation page: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Presets Library route
app.get("/presets", async (req, res) => {
  try {
    const presetView = require("../views/preset_view");
    
    // Load preset data to pass to the view
    const PresetHandler = require('../backend/presetHandler');
    const MCPHandler = require('../backend/mcpHandler');
    const presetHandler = new PresetHandler();
    const mcpHandler = new MCPHandler();
    
    // Get presets and enrich with MCP server information (like in API)
    let presets = presetHandler.getAllPresets();
    const servers = await mcpHandler.getAllServers();
    
    // Enrich presets with MCP server information
    const enrichedPresets = presets.map(preset => {
      const enrichedPreset = { ...preset };
      
      // Find the MCP server for this preset
      if (preset.serverId) {
        const server = servers.find(s => s.id === preset.serverId);
        if (server) {
          enrichedPreset.serverName = server.name;
          enrichedPreset.serverStatus = server.status;
          enrichedPreset.serverType = server.type;
          enrichedPreset.toolsCount = server.toolsCount;
          enrichedPreset.resourcesCount = server.resourcesCount;
          enrichedPreset.promptsCount = server.promptsCount;
          
          // Calculate selected tools count from preset items
          const selectedToolsCount = Array.isArray(preset.items) 
            ? preset.items.filter(item => item.type === 'tool').length 
            : 0;
          enrichedPreset.selectedToolsCount = selectedToolsCount;
        } else {
          // Server not found or disconnected
          enrichedPreset.serverName = `Server ${preset.serverId} (Not Found)`;
          enrichedPreset.serverStatus = 'disconnected';
          enrichedPreset.serverType = 'unknown';
          enrichedPreset.toolsCount = 0;
          enrichedPreset.resourcesCount = 0;
          enrichedPreset.promptsCount = 0;
          enrichedPreset.selectedToolsCount = 0;
        }
      } else {
        // No server associated
        enrichedPreset.serverName = 'No Server';
        enrichedPreset.serverStatus = 'none';
        enrichedPreset.serverType = 'none';
        enrichedPreset.toolsCount = 0;
        enrichedPreset.resourcesCount = 0;
        enrichedPreset.promptsCount = 0;
        enrichedPreset.selectedToolsCount = 0;
      }
      
      return enrichedPreset;
    });
    
    // Prepare data for the view
    const viewData = {
      presets: enrichedPresets,
      categories: ["General", "Development", "Analysis", "Creative"],
      pagination: {
        total: enrichedPresets.length,
        page: 1,
        limit: 20,
        totalPages: 1
      },
      filters: {},
      selectedPreset: null,
      isLoading: false,
      error: null,
      mcpServers: servers // Add MCP servers data
    };
    
    const htmlResponse = presetView.presetView(viewData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering presets page:', error);
    res.status(500).send(`
      <html>
        <head><title>Presets - Error</title></head>
        <body>
          <h1>Error Loading Presets</h1>
          <p>Unable to load presets library: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// MCP Editor route
app.get("/editor", async (req, res) => {
  try {
    const editorView = require("../views/editor_view");
    const MCPHandler = require("../backend/mcpHandler");
    const mcpHandler = new MCPHandler();
    
    // Fetch MCP servers and their data
    const servers = await mcpHandler.getAllServers();
    const selectedServer = servers.length > 0 ? servers[0] : null;
    let serverContent = {};
    
    if (selectedServer) {
      // Get the full catalog data for the first server
      const catalog = await mcpHandler.discoverServers();
      const serverData = catalog.find(s => s.serverName === selectedServer.id);
      
      if (serverData) {
        serverContent = {
          tools: serverData.tools || [],
          resources: serverData.resources || [],
          prompts: serverData.prompts || []
        };
      }
    }
    
    const editorData = {
      servers,
      selectedServer,
      serverContent,
      selectedItems: [],
      isLoading: false,
      error: null
    };
    
    const htmlResponse = editorView.editorView(editorData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering editor page:', error);
    res.status(500).send(`
      <html>
        <head><title>MCP Editor - Error</title></head>
        <body>
          <h1>Error Loading MCP Editor</h1>
          <p>Unable to load MCP editor: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Statistics route
app.get("/stats", async (req, res) => {
  try {
    const statsView = require("../views/stats_view");
    const htmlResponse = statsView.statsView();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering stats page:', error);
    res.status(500).send(`
      <html>
        <head><title>Statistics - Error</title></head>
        <body>
          <h1>Error Loading Statistics</h1>
          <p>Unable to load statistics page: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Settings page route
app.get("/settings", async (req, res) => {
  try {
    const settingsView = require("../views/settings_view");
    // Fetch current settings from configuration manager with safe defaults
    const { getConfig, getSectionDefaults } = require("../configs/config-manager");
    const cfg = getConfig();

    // Extract settings sections for the view (fallback to config-manager defaults, not hardcoded URLs)
    const settings = {
      theme: cfg.theme || getSectionDefaults('theme'),
      ui: cfg.ui || getSectionDefaults('ui'),
      features: cfg.features || getSectionDefaults('features'),
      ai: cfg.ai || getSectionDefaults('ai'),
      mcp: cfg.mcp || getSectionDefaults('mcp'),
      presets: cfg.presets || getSectionDefaults('presets')
    };
    
  // Render settings view with current configuration
  const htmlResponse = settingsView.settingsView(settings);
    
    // Set content type and send as HTML using HyperAxe's outerHTML
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse.outerHTML);
  } catch (error) {
    console.error('Error rendering settings page:', error);
    res.status(500).send(`
      <html>
        <head><title>Settings - Error</title></head>
        <body>
          <h1>Error Loading Settings</h1>
          <p>Unable to load settings page: ${error.message}</p>
          <a href="/">Return to Home</a>
        </body>
      </html>
    `);
  }
});

// Backend handlers
const backendRouter = require("../backend/backend.js");

// API routes (following diogenes pattern)
app.use("/api", backendRouter);

// Start server
const port = config.server.port || 3012;
const host = config.server.host || "localhost";

const server = app.listen(port, host, () => {
  console.log(`Zeus server running on http://${host}:${port}`);
  console.log(`Environment: ${config.debug ? 'development' : 'production'}`);
  
  if (config.debug) {
    console.log("Configuration:", JSON.stringify(config, null, 2));
  }
});

// Initialize WebSocket support for real-time features (Phase 5)
const WebSocketHandler = require('./websocket_handler');
const wsHandler = new WebSocketHandler(server);
console.log('WebSocket server initialized for real-time chat functionality');

// Graceful shutdown (following diogenes pattern)
process.on('SIGTERM', () => {
  debug('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Zeus server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  debug('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Zeus server closed');
    process.exit(0);
  });
});

module.exports = { app, server, config };