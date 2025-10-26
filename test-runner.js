#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Holy Family Polymers Application
 * 
 * This script runs all test suites individually and provides detailed results
 * for each test category: Login, Register, Staff, User, and Authentication Flow
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  clientPath: './client',
  testSuites: [
    {
      name: 'Login Page Tests',
      file: 'LoginPageComprehensive.test.js',
      description: 'Comprehensive tests for user login functionality'
    },
    {
      name: 'Register Page Tests', 
      file: 'RegisterPageComprehensive.test.js',
      description: 'Comprehensive tests for user registration functionality'
    },
    {
      name: 'Staff Functionality Tests',
      file: 'StaffFunctionalityComprehensive.test.js', 
      description: 'Comprehensive tests for staff login, salary view, and attendance'
    },
    {
      name: 'User Functionality Tests',
      file: 'UserFunctionalityComprehensive.test.js',
      description: 'Comprehensive tests for user dashboard, profile, and transactions'
    },
    {
      name: 'Authentication Flow Tests',
      file: 'AuthenticationFlowComprehensive.test.js',
      description: 'End-to-end authentication flow tests'
    }
  ],
  outputFile: './test-results.json',
  reportFile: './test-report.html'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results storage
let allTestResults = {
  summary: {
    totalSuites: 0,
    passedSuites: 0,
    failedSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    startTime: null,
    endTime: null,
    duration: 0
  },
  suites: []
};

/**
 * Log colored messages to console
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Run a single test suite
 */
function runTestSuite(suite) {
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`Running: ${suite.name}`, 'bright');
  log(`Description: ${suite.description}`, 'blue');
  log(`${'='.repeat(80)}`, 'cyan');

  const testFile = path.join(TEST_CONFIG.clientPath, 'src', '__tests__', suite.file);
  
  if (!fs.existsSync(testFile)) {
    log(`❌ Test file not found: ${testFile}`, 'red');
    return {
      name: suite.name,
      status: 'FAILED',
      error: 'Test file not found',
      tests: [],
      duration: 0
    };
  }

  const startTime = Date.now();
  
  try {
    // Change to client directory and run the specific test
    const command = `cd ${TEST_CONFIG.clientPath} && npm test -- --testPathPattern=${suite.file} --verbose --no-coverage --watchAll=false`;
    
    log(`Executing: ${command}`, 'yellow');
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Parse test results from output
    const results = parseTestOutput(output, suite.name, duration);
    
    log(`✅ ${suite.name} completed in ${duration}ms`, 'green');
    log(`   Tests: ${results.totalTests}, Passed: ${results.passedTests}, Failed: ${results.failedTests}`, 'green');
    
    return results;

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    log(`❌ ${suite.name} failed: ${error.message}`, 'red');
    
    return {
      name: suite.name,
      status: 'FAILED',
      error: error.message,
      tests: [],
      duration: duration,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    };
  }
}

/**
 * Parse test output to extract results
 */
function parseTestOutput(output, suiteName, duration) {
  const lines = output.split('\n');
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const tests = [];

  // Look for test results in the output
  for (const line of lines) {
    // Match patterns like "✓ should render login form (5ms)"
    const passedMatch = line.match(/✓\s+(.+?)\s+\((\d+)ms\)/);
    if (passedMatch) {
      totalTests++;
      passedTests++;
      tests.push({
        name: passedMatch[1],
        status: 'PASSED',
        duration: parseInt(passedMatch[2])
      });
    }

    // Match patterns like "✗ should handle error (2ms)"
    const failedMatch = line.match(/✗\s+(.+?)\s+\((\d+)ms\)/);
    if (failedMatch) {
      totalTests++;
      failedTests++;
      tests.push({
        name: failedMatch[1],
        status: 'FAILED',
        duration: parseInt(failedMatch[2])
      });
    }

    // Look for test suite results
    const suiteMatch = line.match(/Tests:\s+(\d+),\s+(\d+)\s+passed,\s+(\d+)\s+failed/);
    if (suiteMatch) {
      totalTests = parseInt(suiteMatch[1]);
      passedTests = parseInt(suiteMatch[2]);
      failedTests = parseInt(suiteMatch[3]);
    }
  }

  return {
    name: suiteName,
    status: failedTests === 0 ? 'PASSED' : 'FAILED',
    tests: tests,
    duration: duration,
    totalTests: totalTests,
    passedTests: passedTests,
    failedTests: failedTests
  };
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Holy Family Polymers - Test Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        .summary-card.passed {
            border-left-color: #28a745;
        }
        .summary-card.failed {
            border-left-color: #dc3545;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .summary-card p {
            margin: 0;
            color: #666;
        }
        .suites {
            padding: 30px;
        }
        .suite {
            margin-bottom: 30px;
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-header h3 {
            margin: 0;
        }
        .suite-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.8em;
        }
        .suite-status.passed {
            background: #d4edda;
            color: #155724;
        }
        .suite-status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .suite-details {
            padding: 20px;
        }
        .test-list {
            display: grid;
            gap: 10px;
        }
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #007bff;
        }
        .test-item.passed {
            border-left-color: #28a745;
        }
        .test-item.failed {
            border-left-color: #dc3545;
        }
        .test-name {
            font-weight: 500;
        }
        .test-status {
            font-size: 0.9em;
            font-weight: bold;
        }
        .test-status.passed {
            color: #28a745;
        }
        .test-status.failed {
            color: #dc3545;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Report</h1>
            <p>Holy Family Polymers Application - Comprehensive Testing Results</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>${allTestResults.summary.totalSuites}</h3>
                    <p>Test Suites</p>
                </div>
                <div class="summary-card ${allTestResults.summary.failedSuites === 0 ? 'passed' : 'failed'}">
                    <h3>${allTestResults.summary.passedSuites}</h3>
                    <p>Passed Suites</p>
                </div>
                <div class="summary-card">
                    <h3>${allTestResults.summary.totalTests}</h3>
                    <p>Total Tests</p>
                </div>
                <div class="summary-card ${allTestResults.summary.failedTests === 0 ? 'passed' : 'failed'}">
                    <h3>${allTestResults.summary.passedTests}</h3>
                    <p>Passed Tests</p>
                </div>
                <div class="summary-card">
                    <h3>${allTestResults.summary.duration}ms</h3>
                    <p>Total Duration</p>
                </div>
                <div class="summary-card ${allTestResults.summary.failedTests === 0 ? 'passed' : 'failed'}">
                    <h3>${((allTestResults.summary.passedTests / allTestResults.summary.totalTests) * 100).toFixed(1)}%</h3>
                    <p>Success Rate</p>
                </div>
            </div>
        </div>
        
        <div class="suites">
            <h2>📋 Test Suite Details</h2>
            ${allTestResults.suites.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <h3>${suite.name}</h3>
                        <div class="suite-status ${suite.status.toLowerCase()}">${suite.status}</div>
                    </div>
                    <div class="suite-details">
                        <p><strong>Duration:</strong> ${suite.duration}ms</p>
                        <p><strong>Tests:</strong> ${suite.totalTests} | <strong>Passed:</strong> ${suite.passedTests} | <strong>Failed:</strong> ${suite.failedTests}</p>
                        ${suite.tests.length > 0 ? `
                            <div class="test-list">
                                ${suite.tests.map(test => `
                                    <div class="test-item ${test.status.toLowerCase()}">
                                        <span class="test-name">${test.name}</span>
                                        <span class="test-status ${test.status.toLowerCase()}">${test.status} (${test.duration}ms)</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${suite.error ? `<p style="color: #dc3545;"><strong>Error:</strong> ${suite.error}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Test execution completed at ${new Date().toLocaleString()}</p>
            <p>Holy Family Polymers - Quality Assurance Report</p>
        </div>
    </div>
</body>
</html>`;

  fs.writeFileSync(TEST_CONFIG.reportFile, html);
  log(`📄 HTML report generated: ${TEST_CONFIG.reportFile}`, 'green');
}

/**
 * Save results to JSON file
 */
function saveResultsToJSON() {
  fs.writeFileSync(TEST_CONFIG.outputFile, JSON.stringify(allTestResults, null, 2));
  log(`💾 Results saved to: ${TEST_CONFIG.outputFile}`, 'green');
}

/**
 * Main execution function
 */
async function main() {
  log('🚀 Starting Comprehensive Test Suite Execution', 'bright');
  log(`📅 Started at: ${new Date().toLocaleString()}`, 'blue');
  
  allTestResults.summary.startTime = new Date().toISOString();
  allTestResults.summary.totalSuites = TEST_CONFIG.testSuites.length;

  // Run each test suite
  for (const suite of TEST_CONFIG.testSuites) {
    const result = runTestSuite(suite);
    allTestResults.suites.push(result);
    
    // Update summary
    allTestResults.summary.totalTests += result.totalTests;
    allTestResults.summary.passedTests += result.passedTests;
    allTestResults.summary.failedTests += result.failedTests;
    
    if (result.status === 'PASSED') {
      allTestResults.summary.passedSuites++;
    } else {
      allTestResults.summary.failedSuites++;
    }
  }

  allTestResults.summary.endTime = new Date().toISOString();
  allTestResults.summary.duration = new Date(allTestResults.summary.endTime) - new Date(allTestResults.summary.startTime);

  // Generate reports
  saveResultsToJSON();
  generateHTMLReport();

  // Final summary
  log(`\n${'='.repeat(80)}`, 'cyan');
  log('📊 FINAL TEST RESULTS SUMMARY', 'bright');
  log(`${'='.repeat(80)}`, 'cyan');
  
  log(`📅 Completed at: ${new Date().toLocaleString()}`, 'blue');
  log(`⏱️  Total Duration: ${allTestResults.summary.duration}ms`, 'blue');
  log(`📦 Test Suites: ${allTestResults.summary.totalSuites}`, 'blue');
  log(`✅ Passed Suites: ${allTestResults.summary.passedSuites}`, 'green');
  log(`❌ Failed Suites: ${allTestResults.summary.failedSuites}`, 'red');
  log(`🧪 Total Tests: ${allTestResults.summary.totalTests}`, 'blue');
  log(`✅ Passed Tests: ${allTestResults.summary.passedTests}`, 'green');
  log(`❌ Failed Tests: ${allTestResults.summary.failedTests}`, 'red');
  
  const successRate = ((allTestResults.summary.passedTests / allTestResults.summary.totalTests) * 100).toFixed(2);
  log(`📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  log(`\n📄 Reports Generated:`, 'bright');
  log(`   📊 JSON Results: ${TEST_CONFIG.outputFile}`, 'cyan');
  log(`   🌐 HTML Report: ${TEST_CONFIG.reportFile}`, 'cyan');
  
  log(`\n${'='.repeat(80)}`, 'cyan');
  
  // Exit with appropriate code
  if (allTestResults.summary.failedTests === 0) {
    log('🎉 All tests passed successfully!', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Please review the results.', 'yellow');
    process.exit(1);
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Rejection: ${reason}`, 'red');
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main, runTestSuite, generateHTMLReport };

