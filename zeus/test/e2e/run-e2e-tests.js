#!/usr/bin/env node

/**
 * Zeus E2E Test Runner
 * Integration point for Debug Agent E2E protocol
 */

const ZeusE2ETestSuite = require('./zeus-e2e-test-suite');
const fs = require('fs');
const path = require('path');

class E2ETestRunner {
  constructor() {
    this.reportPath = path.join(__dirname, '../../PLANIFICACION/ITERATIONS/');
    this.isHeaded = process.env.HEADED === 'true';
  }

  async checkZeusServer() {
    console.log('🔍 Checking Zeus server availability...');
    
    try {
      const response = await fetch('http://localhost:3012/health');
      if (response.ok) {
        console.log('✅ Zeus server is running on port 3012');
        return true;
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Zeus server not available:', error.message);
      console.log('💡 Please start Zeus server with: cd zeus && npm start');
      return false;
    }
  }

  async runE2ETests() {
    console.log('🚀 Initializing Zeus E2E Test Suite...');
    console.log(`   Mode: ${this.isHeaded ? 'Headed (visible browser)' : 'Headless'}`);
    
    // Check server availability
    const serverAvailable = await this.checkZeusServer();
    if (!serverAvailable) {
      return {
        success: false,
        error: 'Zeus server not available',
        recommendation: 'Start Zeus server before running E2E tests'
      };
    }
    
    // Run test suite
    const testSuite = new ZeusE2ETestSuite();
    const results = await testSuite.runAllTests();
    
    // Generate enhanced report
    const enhancedReport = this.enhanceReport(results);
    
    // Save report
    await this.saveReport(enhancedReport);
    
    return enhancedReport;
  }

  enhanceReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return {
      ...results,
      metadata: {
        testSuiteVersion: '1.0.0',
        zeusVersion: 'Latest',
        executionMode: this.isHeaded ? 'headed' : 'headless',
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch
        },
        urls: {
          zeusServer: 'http://localhost:3012',
          mcpProxy: 'http://localhost:4001',
          mcpServer: 'http://localhost:3003'
        }
      },
      analysis: this.analyzeResults(results),
      recommendations: this.generateRecommendations(results)
    };
  }

  analyzeResults(results) {
    const analysis = {
      criticalFailures: [],
      warnings: [],
      performance: {
        averageDuration: 0,
        slowestTest: null,
        fastestTest: null
      }
    };

    // Analyze failures
    const failures = results.results.filter(r => !r.success);
    failures.forEach(failure => {
      if (failure.phase && failure.phase.includes('Navigation')) {
        analysis.criticalFailures.push({
          category: 'Navigation',
          impact: 'High - Core user navigation affected',
          issue: failure.error
        });
      } else if (failure.phase && failure.phase.includes('MCP')) {
        analysis.criticalFailures.push({
          category: 'MCP Integration',
          impact: 'High - Core functionality affected',
          issue: failure.error
        });
      } else {
        analysis.warnings.push({
          category: failure.phase || 'Unknown',
          impact: 'Medium - Feature functionality affected',
          issue: failure.error
        });
      }
    });

    return analysis;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    const failedTests = results.results.filter(r => !r.success);
    
    if (failedTests.length === 0) {
      recommendations.push({
        type: 'success',
        message: '✅ All E2E tests passed! Zeus UI is fully functional.',
        action: 'Continue with development or deployment'
      });
    } else {
      recommendations.push({
        type: 'action_required',
        message: `❌ ${failedTests.length} E2E test(s) failed`,
        action: 'Review and fix failing test cases before deployment'
      });
      
      failedTests.forEach(test => {
        recommendations.push({
          type: 'fix_required',
          phase: test.phase,
          issue: test.error,
          action: `Debug and fix ${test.phase} functionality`
        });
      });
    }
    
    return recommendations;
  }

  async saveReport(report) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_');
    const filename = `e2e_test_report_${timestamp}.md`;
    const filepath = path.join(this.reportPath, filename);
    
    const markdownReport = this.generateMarkdownReport(report);
    
    try {
      // Ensure directory exists
      if (!fs.existsSync(this.reportPath)) {
        fs.mkdirSync(this.reportPath, { recursive: true });
      }
      
      fs.writeFileSync(filepath, markdownReport);
      console.log(`📄 E2E test report saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
    }
  }

  generateMarkdownReport(report) {
    const { summary, results, metadata, analysis, recommendations } = report;
    
    return `# Zeus E2E Test Report
**Date**: ${new Date().toISOString().split('T')[0]}  
**Time**: ${new Date().toTimeString().split(' ')[0]}  
**Agent**: Debug & Validation Agent (E2E Extension)  
**Status**: ${summary.failed === 0 ? '✅ ALL PASSED' : `❌ ${summary.failed} FAILED`}

---

## Executive Summary

### Test Results Overview
- **Total Test Cases**: ${summary.total}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ${summary.failed > 0 ? '❌' : ''}
- **Success Rate**: ${summary.successRate}
- **Execution Mode**: ${metadata.executionMode}

### System Under Test
- **Zeus Server**: ${metadata.urls.zeusServer}
- **MCP Proxy**: ${metadata.urls.mcpProxy}  
- **MCP Server**: ${metadata.urls.mcpServer}
- **Platform**: ${metadata.environment.platform} ${metadata.environment.arch}
- **Node Version**: ${metadata.environment.nodeVersion}

---

## Detailed Test Results

| Test Case | Status | Phase | Result |
|-----------|--------|--------|---------|
${results.map(r => `| ${r.phase || 'Unknown'} | ${r.success ? '✅ PASS' : '❌ FAIL'} | E2E Automation | ${r.success ? 'All interactions validated' : r.error} |`).join('\n')}

---

## Test Case Details

${results.map(r => `
### ${r.phase || 'Unknown Test'}
**Status**: ${r.success ? '✅ PASSED' : '❌ FAILED'}  
**Result**: ${r.success ? r.message : r.error}  
${r.success ? '' : `**Impact**: User workflow affected - ${r.phase} functionality not working as expected`}
`).join('\n')}

---

## Analysis & Impact Assessment

### Critical Issues
${analysis.criticalFailures.length === 0 ? 'None detected ✅' : analysis.criticalFailures.map(f => `
- **${f.category}**: ${f.issue}
  - **Impact**: ${f.impact}
`).join('')}

### Warnings  
${analysis.warnings.length === 0 ? 'None detected ✅' : analysis.warnings.map(w => `
- **${w.category}**: ${w.issue}  
  - **Impact**: ${w.impact}
`).join('')}

---

## Recommendations

${recommendations.map(r => `
### ${r.type.toUpperCase().replace('_', ' ')}
${r.message}  
**Action**: ${r.action}
`).join('\n')}

---

## Integration with Debug Protocol

This E2E test report extends the standard Debug Agent validation protocol with automated user interaction testing:

- **Pre-E2E**: Standard health checks and API validation ✅
- **E2E Phase**: Automated user workflow validation ${summary.failed === 0 ? '✅' : '❌'}
- **Post-E2E**: Enhanced validation report with user experience assessment ✅

### Next Steps
${summary.failed === 0 ? 
`✅ **E2E Validation Complete**: All user workflows functional
- System ready for continued development
- No blocking issues detected
- User experience validation passed` :
`❌ **E2E Issues Detected**: User workflow problems found
- Review and fix failing test cases
- Re-run E2E validation after fixes
- Consider impact on user experience`}

---

*Generated by Debug Agent E2E Testing Extension*  
*Report saved: ${new Date().toISOString()}*`;
  }
}

// Main execution
async function main() {
  const runner = new E2ETestRunner();
  
  console.log('🎯 Zeus E2E Test Runner - Debug Agent Extension');
  console.log('================================================\n');
  
  try {
    const results = await runner.runE2ETests();
    
    if (results.success === false) {
      console.error('\n❌ E2E Test execution failed:', results.error);
      if (results.recommendation) {
        console.log('💡', results.recommendation);
      }
      process.exit(1);
    }
    
    console.log('\n📊 E2E Test Summary:');
    console.log(`   Success Rate: ${results.summary.successRate}`);
    console.log(`   Passed: ${results.summary.passed}/${results.summary.total}`);
    
    if (results.summary.failed > 0) {
      console.log(`   Failed: ${results.summary.failed}`);
      console.log('\n❌ Some tests failed. Check the report for details.');
      process.exit(1);
    } else {
      console.log('\n✅ All E2E tests passed! Zeus UI is fully functional.');
    }
    
  } catch (error) {
    console.error('\n💥 Unexpected error during E2E testing:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = E2ETestRunner;