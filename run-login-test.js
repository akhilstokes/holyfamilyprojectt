const { execSync } = require('child_process');
const { spawn } = require('child_process');
const http = require('http');

const checkServer = (port, retries = 30) => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${port}`, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (attempts < retries) {
          setTimeout(check, 2000);
        } else {
          reject(new Error(`Server on port ${port} not responding after ${retries} attempts`));
        }
      });
      req.setTimeout(1000);
    };
    check();
  });
};

console.log('🚀 Starting Login Page Playwright Test...\n');
console.log('='.repeat(60));
console.log('TEST SUITE: Login Page Functionality');
console.log('='.repeat(60));

(async () => {
  try {
    console.log('\n⚠️  IMPORTANT: Make sure both servers are running:');
    console.log('   1. Backend: cd server && npm start (port 5000)');
    console.log('   2. Frontend: cd client && npm start (port 3000)');
    console.log('\n🔍 Checking if servers are running...\n');

    try {
      await checkServer(5000);
      console.log('✅ Backend server is running on port 5000');
    } catch (e) {
      console.error('❌ Backend server (port 5000) is NOT running!');
      console.log('\n💡 Start it with: cd server && npm start');
      process.exit(1);
    }

    try {
      await checkServer(3000);
      console.log('✅ Frontend client is running on port 3000');
    } catch (e) {
      console.error('❌ Frontend client (port 3000) is NOT running!');
      console.log('\n💡 Start it with: cd client && npm start');
      process.exit(1);
    }

    console.log('\n📋 Running Playwright tests...\n');
    
    execSync(
      'npx playwright test tests/e2e/login.spec.js --reporter=html,list',
      { 
        cwd: __dirname,
        encoding: 'utf-8',
        stdio: 'inherit'
      }
    );
    
    console.log('\n✅ Tests completed!');
    console.log('\n📊 Opening HTML report in browser...');
    
    setTimeout(() => {
      execSync('npx playwright show-report', {
        cwd: __dirname,
        stdio: 'inherit'
      });
    }, 1000);
    
  } catch (error) {
    console.error('\n⚠️  Some tests may have failed. Check the HTML report for details.');
    console.log('\n📊 Opening HTML report in browser...');
    
    try {
      execSync('npx playwright show-report', {
        cwd: __dirname,
        stdio: 'inherit'
      });
    } catch (e) {
      console.error('Could not open report automatically.');
      console.log('\nManually open: playwright-report/index.html');
    }
  }
})();
