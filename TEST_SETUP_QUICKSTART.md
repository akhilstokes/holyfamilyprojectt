# Testing Setup - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install root dependencies (Playwright)
npm install

# Install Playwright browsers
npx playwright install

# Install server test dependencies
cd server
npm install

# Install client test dependencies  
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy test environment file
copy .env.test server\.env.test

# Or create manually with:
# - MONGO_URI_TEST for test database
# - JWT_SECRET for testing
# - Test user credentials
```

### 3. Start Test Database (if using local MongoDB)

```bash
# Windows
mongod --dbpath C:\data\test-db

# Linux/Mac
mongod --dbpath /data/test-db
```

### 4. Run Tests

```bash
# Backend tests (from server directory)
cd server
npm test

# E2E tests (from root)
cd ..
npm test

# Or use the test runner
node run-tests.js --all
```

## 📋 Quick Test Commands

### Backend Tests

```bash
cd server

# Run all backend tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### E2E Tests

```bash
# From project root

# Run all E2E tests
npm test

# Run with visible browser
npm run test:headed

# Interactive UI mode
npm run test:ui

# Run specific test file
npx playwright test auth.spec.js

# View test report
npm run test:report
```

### Frontend Component Tests

```bash
cd client

# Run component tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## 🎯 What's Included

### ✅ Backend Tests (Jest)
- **Unit Tests**: Controllers, Models, Utilities
  - `server/__tests__/unit/authController.test.js`
  - `server/__tests__/unit/userModel.test.js`
  - `server/__tests__/unit/productController.test.js`

- **Integration Tests**: API Endpoints
  - `server/__tests__/integration/auth.api.test.js`

### ✅ E2E Tests (Playwright)
- **Authentication Flow**: Login, Register, Logout
  - `tests/e2e/auth.spec.js`

- **Dashboard & Features**: Products, Orders, Navigation
  - `tests/e2e/dashboard.spec.js`

### ✅ Frontend Tests (React Testing Library)
- **Component Tests**: React components
  - `client/src/__tests__/App.test.js`

## 🛠️ Test Utilities

### Test Helpers
Location: `server/__tests__/helpers/testHelper.js`

```javascript
const { 
  generateTestToken,
  createTestUser,
  mockRequest,
  mockResponse 
} = require('./__tests__/helpers/testHelper');

// Use in your tests
const token = generateTestToken('userId', 'admin');
const testUser = await createTestUser({ role: 'admin' });
const req = mockRequest({ body: { name: 'Test' } });
const res = mockResponse();
```

## 📊 Viewing Coverage

```bash
# Generate coverage report
cd server
npm run test:coverage

# Open coverage report
# Windows
start coverage\lcov-report\index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

## 🔍 Debugging Tests

### Backend Tests
```bash
# Run specific test file
npm test -- authController.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Debug mode with visible browser
npx playwright test --debug

# Debug specific test
npx playwright test auth.spec.js --debug

# Run with UI mode (recommended)
npx playwright test --ui
```

## 🚨 Common Issues

### Issue: MongoDB connection failed
**Solution:**
```bash
# Ensure MongoDB is running
mongod --dbpath /data/test-db

# Or update MONGO_URI_TEST in .env.test
```

### Issue: Port already in use
**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 5000 (test server)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: Playwright browsers not found
**Solution:**
```bash
npx playwright install
```

### Issue: Tests timeout
**Solution:**
- Increase timeout in `jest.config.js` (backend)
- Increase timeout in test file: `jest.setTimeout(15000)`
- For Playwright: Add `timeout` in `playwright.config.js`

## 📁 File Structure

```
holy-family-polymers/
├── server/
│   ├── __tests__/
│   │   ├── setup.js              # Jest setup
│   │   ├── helpers/
│   │   │   └── testHelper.js     # Test utilities
│   │   ├── unit/                 # Unit tests
│   │   │   ├── authController.test.js
│   │   │   ├── userModel.test.js
│   │   │   └── productController.test.js
│   │   └── integration/          # Integration tests
│   │       └── auth.api.test.js
│   └── jest.config.js
├── tests/
│   └── e2e/                      # E2E tests
│       ├── auth.spec.js
│       └── dashboard.spec.js
├── client/src/
│   └── __tests__/                # Component tests
│       └── App.test.js
├── playwright.config.js
├── .env.test                     # Test environment
├── run-tests.js                  # Test runner script
└── TESTING_GUIDE.md              # Full documentation
```

## 🎓 Next Steps

1. **Read Full Documentation**: Check `TESTING_GUIDE.md` for detailed information

2. **Write Your Own Tests**: Use the templates in the guide

3. **Set Up CI/CD**: Tests run automatically on GitHub Actions

4. **Increase Coverage**: Aim for 80%+ code coverage

5. **Add More E2E Tests**: Cover critical user journeys

## 🆘 Need Help?

- **Full Documentation**: `TESTING_GUIDE.md`
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Playwright Docs**: https://playwright.dev/docs/intro
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/

## ✅ Verification Checklist

Before committing code, ensure:

- [ ] All tests pass locally
- [ ] Added tests for new features
- [ ] Coverage doesn't decrease
- [ ] No console errors in tests
- [ ] Test names are descriptive
- [ ] Mock external dependencies
- [ ] Clean up test data

---

**Happy Testing! 🧪**
