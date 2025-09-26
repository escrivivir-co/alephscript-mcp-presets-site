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
        port: 3000,
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

// Main route handler (to be expanded)
app.get("/", (req, res) => {
  // For now, return a simple response
  // This will be replaced with proper view rendering
  res.json({ 
    message: "Zeus MCP Mesh SDK Web Interface", 
    version: "0.1.0",
    status: "initializing"
  });
});

// Settings page route
app.get("/settings", async (req, res) => {
  try {
    const settingsView = require("../views/settings_view");
    
    // Fetch current settings from backend API
    const { getConfig } = require("../configs/config-manager");
    const config = getConfig();
    
    // Extract settings sections for the view
    const settings = {
      theme: config.theme || { current: 'Clear-MCP' },
      ui: config.ui || { language: 'en', animations: true, darkMode: false },
      features: config.features || { aiConversations: true, presetLibrary: true, mcpExplorer: true, themeSystem: true },
      ai: config.ai || { endpoint: 'http://localhost:4001', maxTokens: 2000, temperature: 0.7 },
      mcp: config.mcp || { servers: [], timeout: 30000 },
      presets: config.presets || { library: 'default', autoLoad: true }
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
const port = config.server.port || 3000;
const host = config.server.host || "localhost";

const server = app.listen(port, host, () => {
  console.log(`Zeus server running on http://${host}:${port}`);
  console.log(`Environment: ${config.debug ? 'development' : 'production'}`);
  
  if (config.debug) {
    console.log("Configuration:", JSON.stringify(config, null, 2));
  }
});

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