#!/usr/bin/env node

/**
 * Test Runner Script for Holy Family Polymers
 * 
 * Usage:
 *   node run-tests.js [options]
 * 
 * Options:
 *   --unit          Run only unit tests
 *   --integration   Run only integration tests
 *   --e2e           Run only E2E tests
 *   --all           Run all tests
 *   --coverage      Generate coverage report
 *   --watch         Run tests in watch mode
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Running: ${command}`, 'bright');
    log('='.repeat(60), 'cyan');
    
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    log(`\n✓ Success!`, 'green');
    return true;
  } catch (error) {
    log(`\n✗ Failed with exit code ${error.status}`, 'red');
    return false;
  }
}

function main() {
  const hasArg = (arg) => args.includes(arg);
  const rootDir = process.cwd();
  const serverDir = path.join(rootDir, 'server');
  const clientDir = path.join(rootDir, 'client');

  log('\n🧪 Holy Family Polymers Test Suite\n', 'bright');

  let allPassed = true;

  // Run unit tests
  if (hasArg('--unit') || hasArg('--all')) {
    log('\n📦 Running Unit Tests...', 'blue');
    const watchFlag = hasArg('--watch') ? '--watch' : '';
    const coverageFlag = hasArg('--coverage') ? '--coverage' : '';
    
    const passed = runCommand(
      `npm run test:unit ${watchFlag} ${coverageFlag}`.trim(),
      serverDir
    );
    allPassed = allPassed && passed;
  }

  // Run integration tests
  if (hasArg('--integration') || hasArg('--all')) {
    log('\n🔗 Running Integration Tests...', 'blue');
    const passed = runCommand('npm run test:integration', serverDir);
    allPassed = allPassed && passed;
  }

  // Run E2E tests
  if (hasArg('--e2e') || hasArg('--all')) {
    log('\n🌐 Running E2E Tests...', 'blue');
    const headedFlag = hasArg('--headed') ? '--headed' : '';
    const uiFlag = hasArg('--ui') ? '--ui' : '';
    
    const passed = runCommand(
      `npx playwright test ${headedFlag} ${uiFlag}`.trim(),
      rootDir
    );
    allPassed = allPassed && passed;
  }

  // Default: run all backend tests
  if (!hasArg('--unit') && !hasArg('--integration') && !hasArg('--e2e') && !hasArg('--all')) {
    log('\n📦 Running All Backend Tests...', 'blue');
    const watchFlag = hasArg('--watch') ? '--watch' : '';
    const coverageFlag = hasArg('--coverage') ? '--coverage' : '';
    
    const passed = runCommand(
      `npm test ${watchFlag} ${coverageFlag}`.trim(),
      serverDir
    );
    allPassed = allPassed && passed;
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    log('✓ All tests passed!', 'green');
  } else {
    log('✗ Some tests failed. Please check the output above.', 'red');
  }
  log('='.repeat(60) + '\n', 'cyan');

  process.exit(allPassed ? 0 : 1);
}

main();
