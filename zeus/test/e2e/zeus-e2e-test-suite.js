// Zeus E2E Test Cases - MCP Playwright Integration
// Debug Agent - Automated User Flow Validation

/**
 * E2E Test Suite for Zeus MCP Interface
 * Validates complete user workflows and interactions
 */

class ZeusE2ETestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3012';
    this.testResults = [];
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async initialize() {
    // Initialize Playwright browser context
    const { chromium } = require('playwright');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down for debugging
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    this.page = await this.context.newPage();
    
    console.log('🚀 Zeus E2E Test Suite initialized');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Test Case 1: Navigation Flow Validation
  async testNavigationFlow() {
    console.log('📋 Testing Navigation Flow...');
    
    try {
      // Start at home page
      await this.page.goto(`${this.baseUrl}/`);
      
      // Verify navigation bar is present
      await this.page.waitForSelector('nav.main-navigation', { timeout: 5000 });
      
      const routes = [
        { path: '/', emoji: '🏠', title: 'Home' },
        { path: '/ai', emoji: '🤖', title: 'AI Conversations' },
        { path: '/presets', emoji: '📚', title: 'Preset Library' },
        { path: '/editor', emoji: '🔧', title: 'MCP Editor' },
        { path: '/settings', emoji: '⚙️', title: 'Settings' },
        { path: '/stats', emoji: '📊', title: 'Statistics' }
      ];

      for (const route of routes) {
        // Click navigation link
        await this.page.click(`nav a[href="${route.path}"]`);
        
        // Wait for navigation to complete
        await this.page.waitForURL(`${this.baseUrl}${route.path}`, { timeout: 5000 });
        
        // Verify page title
        const title = await this.page.locator('title').textContent();
        if (!title.includes(route.title)) {
          throw new Error(`Expected title to contain "${route.title}", got "${title}"`);
        }
        
        // Verify current nav item is highlighted
        const currentNav = await this.page.locator(`nav a[href="${route.path}"].current`);
        await currentNav.waitFor({ state: 'visible', timeout: 3000 });
        
        console.log(`  ✅ ${route.title} navigation validated`);
      }

      return { 
        success: true, 
        message: "Navigation flow validation completed successfully",
        duration: Date.now()
      };
      
    } catch (error) {
      console.error(`  ❌ Navigation test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'Navigation Flow'
      };
    }
  }

  // Test Case 2: Theme System Validation
  async testThemeSystem() {
    console.log('🎨 Testing Theme System...');
    
    try {
      // Navigate to settings
      await this.page.goto(`${this.baseUrl}/settings`);
      await this.page.waitForSelector('#theme-select', { timeout: 5000 });

      const themes = ['Clear-MCP', 'Dark-MCP', 'Purple-MCP', 'Matrix-MCP', 'Orange-Dark-MCP'];
      
      for (const theme of themes) {
        // Select theme
        await this.page.selectOption('#theme-select', theme);
        
        // Wait for theme to apply
        await this.page.waitForTimeout(1000);
        
        // Verify body class updated
        const bodyClass = await this.page.locator('body').getAttribute('class');
        if (!bodyClass.includes(`theme-${theme}`)) {
          throw new Error(`Theme ${theme} not applied to body class`);
        }
        
        // Verify theme CSS is loaded
        const themeLink = this.page.locator(`link[href*="${theme}.css"]`);
        await themeLink.waitFor({ state: 'attached', timeout: 3000 });
        
        console.log(`  ✅ Theme ${theme} validated`);
      }

      return { 
        success: true, 
        message: "Theme system validation completed successfully"
      };
      
    } catch (error) {
      console.error(`  ❌ Theme system test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'Theme System'
      };
    }
  }

  // Test Case 3: MCP Editor Functionality
  async testMCPEditor() {
    console.log('🔧 Testing MCP Editor...');
    
    try {
      // Navigate to MCP editor
      await this.page.goto(`${this.baseUrl}/editor`);
      
      // Wait for server browser to load
      await this.page.waitForSelector('.server-browser', { timeout: 10000 });
      
      // Verify server is listed
      const serverItem = this.page.locator('.server-item[data-server-id="localhost"]');
      await serverItem.waitFor({ state: 'visible', timeout: 5000 });
      
      // Verify server shows correct stats
      const serverStats = await this.page.locator('.server-stats').textContent();
      if (!serverStats.includes('20 tools')) {
        throw new Error(`Expected 20 tools, got: ${serverStats}`);
      }
      
      // Click server to select it
      await serverItem.click();
      
      // Wait for content explorer to show server data
      await this.page.waitForSelector('.explorer-header h2', { timeout: 5000 });
      
      // Test tab functionality
      const tabs = ['tools', 'resources', 'prompts'];
      for (const tab of tabs) {
        await this.page.click(`button[data-tab="${tab}"]`);
        
        // Verify tab is active
        const tabButton = this.page.locator(`button[data-tab="${tab}"]`);
        const isActive = await tabButton.getAttribute('class');
        if (!isActive.includes('active')) {
          throw new Error(`Tab ${tab} not activated`);
        }
        
        // Verify content panel is visible
        const contentPanel = this.page.locator(`[data-tab-content="${tab}"]`);
        await contentPanel.waitFor({ state: 'visible', timeout: 3000 });
        
        console.log(`  ✅ Tab ${tab} validated`);
      }
      
      // Test tool selection
      await this.page.click('button[data-tab="tools"]');
      await this.page.waitForSelector('.item-card.tool-item', { timeout: 5000 });
      
      // Select first tool
      const firstTool = this.page.locator('.item-card.tool-item').first();
      await firstTool.click();
      
      // Verify selection
      const isSelected = await firstTool.getAttribute('class');
      if (!isSelected.includes('selected')) {
        throw new Error('Tool selection not working');
      }
      
      // Verify selection count updated
      const selectionCount = await this.page.locator('.selection-count').textContent();
      if (!selectionCount.includes('1 items selected')) {
        throw new Error(`Expected "1 items selected", got: ${selectionCount}`);
      }

      return { 
        success: true, 
        message: "MCP Editor validation completed successfully"
      };
      
    } catch (error) {
      console.error(`  ❌ MCP Editor test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'MCP Editor'
      };
    }
  }

  // Test Case 4: AI Conversation Interface
  async testAIConversation() {
    console.log('🤖 Testing AI Conversation Interface...');
    
    try {
      // Navigate to AI page
      await this.page.goto(`${this.baseUrl}/ai`);
      
      // Wait for chat interface to load
      await this.page.waitForSelector('.chat-interface', { timeout: 5000 });
      
      // Test new conversation creation
      await this.page.click('button[data-action="new-conversation"]');
      
      // Wait for conversation to be created (or verify empty state)
      await this.page.waitForTimeout(2000);
      
      // Verify message input exists and is enabled
      const messageInput = this.page.locator('#message-input');
      await messageInput.waitFor({ state: 'visible', timeout: 3000 });
      
      // Test message input functionality
      const testMessage = "Hello, this is a test message for E2E validation";
      await messageInput.fill(testMessage);
      
      // Verify character count updates
      const charCount = await this.page.locator('.character-count').textContent();
      if (!charCount.includes(`${testMessage.length}/4000`)) {
        console.warn(`Character count not exact, got: ${charCount}`);
      }
      
      // Test preset panel toggle
      const presetToggle = this.page.locator('button[data-action="toggle-presets"]');
      if (await presetToggle.count() > 0) {
        await presetToggle.click();
        await this.page.waitForSelector('.preset-panel', { state: 'visible', timeout: 3000 });
      }

      return { 
        success: true, 
        message: "AI Conversation interface validation completed successfully"
      };
      
    } catch (error) {
      console.error(`  ❌ AI Conversation test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'AI Conversation'
      };
    }
  }

  // Test Case 5: Preset Library Management
  async testPresetLibrary() {
    console.log('📚 Testing Preset Library...');
    
    try {
      // Navigate to presets page
      await this.page.goto(`${this.baseUrl}/presets`);
      
      // Wait for preset library to load
      await this.page.waitForSelector('.preset-library-container', { timeout: 5000 });
      
      // Test create preset functionality
      await this.page.click('button[data-action="create-preset"]');
      await this.page.waitForSelector('.preset-editor', { state: 'visible', timeout: 3000 });
      
      // Fill preset form
      await this.page.fill('#preset-name', 'E2E Test Preset');
      await this.page.selectOption('#preset-category', 'Development');
      await this.page.fill('#preset-description', 'Automated testing preset created by E2E suite');
      await this.page.fill('#preset-prompt', 'This is a test prompt for E2E validation of the preset system');
      await this.page.fill('#preset-tags', 'test, e2e, validation, automated');
      
      // Verify form elements are filled
      const presetName = await this.page.locator('#preset-name').inputValue();
      if (presetName !== 'E2E Test Preset') {
        throw new Error('Preset name not filled correctly');
      }
      
      // Test character count for prompt
      const promptCount = await this.page.locator('#prompt-count').textContent();
      if (!promptCount.includes('67')) { // Length of test prompt
        console.warn(`Prompt character count unexpected: ${promptCount}`);
      }
      
      // Test search functionality
      const searchInput = this.page.locator('#preset-search');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
      }

      return { 
        success: true, 
        message: "Preset Library validation completed successfully"
      };
      
    } catch (error) {
      console.error(`  ❌ Preset Library test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'Preset Library'
      };
    }
  }

  // Test Case 6: Settings Configuration
  async testSettingsConfiguration() {
    console.log('⚙️ Testing Settings Configuration...');
    
    try {
      // Navigate to settings
      await this.page.goto(`${this.baseUrl}/settings`);
      
      // Wait for settings form to load
      await this.page.waitForSelector('#zeus-settings-form', { timeout: 5000 });
      
      // Test feature toggles
      const featureToggles = [
        '#feature-aiConversations',
        '#feature-presetLibrary', 
        '#feature-mcpExplorer',
        '#feature-themeSystem'
      ];
      
      for (const toggle of featureToggles) {
        if (await this.page.locator(toggle).count() > 0) {
          await this.page.check(toggle);
          const isChecked = await this.page.locator(toggle).isChecked();
          if (!isChecked) {
            throw new Error(`Feature toggle ${toggle} not checked`);
          }
        }
      }
      
      // Test AI configuration
      await this.page.fill('#ai-endpoint', 'http://localhost:4001');
      await this.page.fill('#ai-max-tokens', '3000');
      await this.page.fill('#ai-temperature', '0.8');
      
      // Verify AI configuration values
      const endpoint = await this.page.locator('#ai-endpoint').inputValue();
      if (endpoint !== 'http://localhost:4001') {
        throw new Error('AI endpoint not set correctly');
      }
      
      // Test MCP configuration
      await this.page.fill('#mcp-timeout', '45000');
      
      // Test language selection
      await this.page.selectOption('#language-select', 'en');
      const selectedLang = await this.page.locator('#language-select').inputValue();
      if (selectedLang !== 'en') {
        throw new Error('Language selection not working');
      }

      return { 
        success: true, 
        message: "Settings configuration validation completed successfully"
      };
      
    } catch (error) {
      console.error(`  ❌ Settings test failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
        phase: 'Settings Configuration'
      };
    }
  }

  // Main test execution
  async runAllTests() {
    console.log('🎯 Starting Zeus E2E Test Suite...');
    
    await this.initialize();
    
    const testMethods = [
      this.testNavigationFlow,
      this.testThemeSystem,
      this.testMCPEditor,
      this.testAIConversation,
      this.testPresetLibrary,
      this.testSettingsConfiguration
    ];
    
    const results = [];
    
    for (const testMethod of testMethods) {
      try {
        const result = await testMethod.call(this);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          phase: testMethod.name
        });
      }
    }
    
    await this.cleanup();
    
    return this.generateReport(results);
  }

  generateReport(results) {
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    const report = {
      summary: {
        total: results.length,
        passed,
        failed,
        successRate: `${Math.round((passed / results.length) * 100)}%`
      },
      results,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 E2E Test Results:');
    console.log(`  Total: ${report.summary.total}`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.phase}: ${r.error}`);
      });
    }
    
    return report;
  }
}

module.exports = ZeusE2ETestSuite;