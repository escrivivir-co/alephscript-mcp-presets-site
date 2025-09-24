// Main models file - following diogenes pattern
// Central place for model definitions and exports

const PresetModel = require('./preset_model');
const AIModel = require('./ai_model');
const MCPModel = require('./mcp_model');
const ThemeModel = require('./theme_model');

module.exports = {
  PresetModel,
  AIModel,
  MCPModel,
  ThemeModel
};