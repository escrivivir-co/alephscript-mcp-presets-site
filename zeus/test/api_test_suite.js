#!/usr/bin/env node

/**
 * Quick API Test Suite for Zeus Phase 5 Backend
 * Tests basic functionality of all implemented API endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3012/api';
const TEST_TIMEOUT = 5000;

// Test configuration
const testClient = axios.create({
  baseURL: BASE_URL,
  timeout: TEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

class APITester {
  constructor() {
    this.testResults = [];
    this.createdResources = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Zeus Phase 5 API Test Suite...\n');
    
    try {
      await this.testHealthCheck();
      await this.testAIConversationAPIs();
      await this.testPresetLibraryAPIs();
      await this.testMCPEditorAPIs();
      await this.testStatisticsAPIs();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Testing: ${testName}`);
      await testFunction();
      console.log(`✅ PASS: ${testName}\n`);
      this.testResults.push({ name: testName, status: 'PASS' });
    } catch (error) {
      console.error(`❌ FAIL: ${testName} - ${error.message}\n`);
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
    }
  }

  async testHealthCheck() {
    await this.runTest('Health Check', async () => {
      const response = await testClient.get('/health');
      if (response.data.status !== 'ok') {
        throw new Error('Health check failed');
      }
    });
  }

  async testAIConversationAPIs() {
    let conversationId;

    // Test creating conversation
    await this.runTest('Create AI Conversation', async () => {
      const response = await testClient.post('/ai/conversations', {
        title: 'Test Conversation',
        initialMessage: 'Hello, this is a test message'
      });
      
      if (!response.data.success || !response.data.conversation.id) {
        throw new Error('Failed to create conversation');
      }
      
      conversationId = response.data.conversation.id;
      this.createdResources.push({ type: 'conversation', id: conversationId });
    });

    // Test listing conversations
    await this.runTest('List AI Conversations', async () => {
      const response = await testClient.get('/ai/conversations');
      if (!response.data.success || !Array.isArray(response.data.conversations)) {
        throw new Error('Failed to list conversations');
      }
    });

    // Test getting conversation details
    if (conversationId) {
      await this.runTest('Get AI Conversation Details', async () => {
        const response = await testClient.get(`/ai/conversations/${conversationId}`);
        if (!response.data.success || !response.data.conversation) {
          throw new Error('Failed to get conversation details');
        }
      });

      // Test adding message to conversation
      await this.runTest('Add Message to Conversation', async () => {
        const response = await testClient.post(`/ai/conversations/${conversationId}/messages`, {
          message: 'This is a test message',
          role: 'user'
        });
        
        if (!response.data.success || !response.data.message) {
          throw new Error('Failed to add message');
        }
      });
    }
  }

  async testPresetLibraryAPIs() {
    let presetId;

    // Test creating preset
    await this.runTest('Create Preset', async () => {
      const response = await testClient.post('/presets', {
        name: 'Test Preset',
        description: 'A test preset for API testing',
        category: 'Development',
        prompt: 'This is a test prompt for development tasks',
        tags: ['test', 'development']
      });
      
      if (!response.data.success || !response.data.preset.id) {
        throw new Error('Failed to create preset');
      }
      
      presetId = response.data.preset.id;
      this.createdResources.push({ type: 'preset', id: presetId });
    });

    // Test listing presets
    await this.runTest('List Presets', async () => {
      const response = await testClient.get('/presets');
      if (!response.data.success || !Array.isArray(response.data.presets)) {
        throw new Error('Failed to list presets');
      }
    });

    // Test preset search and filtering
    await this.runTest('Search Presets', async () => {
      const response = await testClient.get('/presets?search=test&category=Development');
      if (!response.data.success) {
        throw new Error('Failed to search presets');
      }
    });

    // Test getting preset details
    if (presetId) {
      await this.runTest('Get Preset Details', async () => {
        const response = await testClient.get(`/presets/${presetId}`);
        if (!response.data.success || !response.data.preset) {
          throw new Error('Failed to get preset details');
        }
      });

      // Test updating preset
      await this.runTest('Update Preset', async () => {
        const response = await testClient.put(`/presets/${presetId}`, {
          description: 'Updated description for test preset'
        });
        
        if (!response.data.success) {
          throw new Error('Failed to update preset');
        }
      });
    }

    // Test preset export
    await this.runTest('Export Presets', async () => {
      const response = await testClient.get('/presets/export');
      if (!response.data.success || !Array.isArray(response.data.presets)) {
        throw new Error('Failed to export presets');
      }
    });
  }

  async testMCPEditorAPIs() {
    // Test listing MCP servers
    await this.runTest('List MCP Servers', async () => {
      const response = await testClient.get('/mcp/servers');
      if (!response.data.success || !Array.isArray(response.data.servers)) {
        throw new Error('Failed to list MCP servers');
      }
    });

    // Test server tools (using sample server)
    await this.runTest('List Server Tools', async () => {
      const response = await testClient.get('/mcp/servers/local-filesystem/tools');
      if (!response.data.success) {
        throw new Error('Failed to list server tools');
      }
    });

    // Test server resources
    await this.runTest('List Server Resources', async () => {
      const response = await testClient.get('/mcp/servers/web-browser/resources');
      if (!response.data.success) {
        throw new Error('Failed to list server resources');
      }
    });

    // Test server prompts
    await this.runTest('List Server Prompts', async () => {
      const response = await testClient.get('/mcp/servers/local-filesystem/prompts');
      if (!response.data.success) {
        throw new Error('Failed to list server prompts');
      }
    });

    // Test MCP tool call
    await this.runTest('Execute MCP Tool Call', async () => {
      const response = await testClient.post('/mcp/servers/local-filesystem/call', {
        toolName: 'read_file',
        arguments: { path: '/test/file.txt' }
      });
      
      if (!response.data.success) {
        throw new Error('Failed to execute MCP tool call');
      }
    });
  }

  async testStatisticsAPIs() {
    // Test system overview
    await this.runTest('Get System Overview Statistics', async () => {
      const response = await testClient.get('/stats/overview');
      if (!response.data.success || !response.data.stats) {
        throw new Error('Failed to get overview statistics');
      }
    });

    // Test usage statistics
    await this.runTest('Get Usage Statistics', async () => {
      const response = await testClient.get('/stats/usage?timeframe=7d');
      if (!response.data.success || !response.data.usage) {
        throw new Error('Failed to get usage statistics');
      }
    });

    // Test performance metrics
    await this.runTest('Get Performance Metrics', async () => {
      const response = await testClient.get('/stats/performance');
      if (!response.data.success || !response.data.performance) {
        throw new Error('Failed to get performance metrics');
      }
    });
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('=======================');
    
    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📝 Total:  ${this.testResults.length}\n`);
    
    if (failCount > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error}`);
        });
    }

    if (passCount === this.testResults.length) {
      console.log('🎉 All tests passed! Backend Phase 5 APIs are ready for frontend integration.\n');
    } else {
      console.log('⚠️  Some tests failed. Please review the backend implementation.\n');
    }

    // Cleanup created resources
    if (this.createdResources.length > 0) {
      console.log('🧹 Note: Created test resources should be cleaned up manually if needed:');
      this.createdResources.forEach(resource => {
        console.log(`   - ${resource.type}: ${resource.id}`);
      });
      console.log('');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;