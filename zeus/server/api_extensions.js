/**
 * API Extensions for Zeus server
 * - Registers MCP aggregated content route
 * - Provides SLMo42 preset sync helper
 */

const axios = require('axios');

const apiExtensions = {
  /**
   * Register GET /api/mcp/servers/:id/content route
   * @param {import('express').Router} router
   * @param {object} mcpHandler - Instance of MCPHandler
   */
  registerMcpContentRoute(router, mcpHandler) {
    router.get('/mcp/servers/:id/content', async (req, res) => {
      try {
        const { id } = req.params;
        const [tools, resources, prompts] = await Promise.all([
          mcpHandler.getServerTools(id),
          mcpHandler.getServerResources(id),
          mcpHandler.getServerPrompts(id)
        ]);

        if (!tools && !resources && !prompts) {
          return res.status(404).json({
            success: false,
            error: 'Server not found or no content available'
          });
        }

        res.json({
          success: true,
          server: { id },
          content: { tools: tools || [], resources: resources || [], prompts: prompts || [] }
        });
      } catch (error) {
        console.error('Error fetching MCP server content:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch MCP server content',
          message: error.message
        });
      }
    });
  },

  /**
   * Sync a preset to SLMo42 via /ai/ui/mcp/set
   * Returns { attempted, success, error }
   * @param {object} params
   * @param {string} params.presetName
   * @param {string} params.serverId - serverName for SLMo42 catalog
   * @param {string[]} params.items - selected item IDs from UI
   * @param {object} params.serverContent - { tools, resources, prompts }
   */
  async syncPresetToSlmo42({ presetName, serverId, items, serverContent }) {
    const result = { attempted: false, success: false, error: null };
    try {
      if (!presetName || !serverId || !Array.isArray(items) || !serverContent) {
        return result; // Not enough info to attempt
      }
      result.attempted = true;

      const { getConfig } = require('../configs/config-manager');
      const cfg = getConfig();
      const slmo42 = cfg.ai?.endpoint || 'http://localhost:4001';

      const content = serverContent || {};
      const findBy = (arr = [], itemId) => arr.find(x => x?.id === itemId || x?.name === itemId);
      const toSelectedItem = (itemId) => {
        const tool = findBy(content.tools, itemId);
        const resource = findBy(content.resources, itemId);
        const prompt = findBy(content.prompts, itemId);
        const item = tool || resource || prompt;
        if (!item) return null;
        const type = item.type || (tool ? 'tool' : resource ? 'resource' : 'prompt');
        const name = item.name || item.id || itemId;
        return { serverName: serverId, type, name };
      };

      const selectedItems = items.map(toSelectedItem).filter(Boolean);
      if (selectedItems.length === 0) {
        result.error = 'No matching items found to sync with SLMo42';
        return result;
      }

      const body = { presetName, selectedItems };
      const resp = await axios.post(`${slmo42}/ai/ui/mcp/set`, body, { timeout: cfg.mcp?.timeout || 30000 });
      if (resp.data && resp.data.success) {
        result.success = true;
      } else {
        result.error = resp.data?.error || 'Unknown SLMo42 error';
      }
      return result;
    } catch (e) {
      result.error = e.message;
      return result;
    }
  }
};

module.exports = apiExtensions;
