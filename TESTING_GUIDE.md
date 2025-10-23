# Holy Family Polymers - Testing Guide

## Overview

This project implements a comprehensive testing strategy covering:
- ✅ Unit Tests (Backend controllers, models, utilities)
- ✅ Integration Tests (API endpoints)
- ✅ E2E Tests (User flows with Playwright)
- ✅ Component Tests (React components)

## Test Structure

```
holy-family-polymers/
├── server/
│   ├── __tests__/
│   │   ├── setup.js                    # Jest setup file
│   │   ├── unit/                       # Unit tests
│   │   │   ├── authController.test.js
│   │   │   └── userModel.test.js
│   │   └── integration/                # Integration tests
│   │       └── auth.api.test.js
│   └── jest.config.js                  # Jest configuration
├── client/
│   └── src/
│       └── __tests__/                  # React component tests
│           └── App.test.js
├── tests/
│   └── e2e/                            # End-to-end tests
│       ├── auth.spec.js
│       └── dashboard.spec.js
├── nodejs-selenium-sample/
│   └── tests/                          # Legacy Selenium tests
│       ├── login.test.js
│       └── registration.test.js
└── playwright.config.js                # Playwright configuration
```

## Getting Started

### Prerequisites

```bash
# Install root dependencies (Playwright)
npm install

# Install server dependencies (Jest, Supertest)
cd server
npm install

# Install client dependencies (React Testing Library)
cd ../client
npm install
```

## Running Tests

### Backend Tests (Jest)

```bash
# Navigate to server directory
cd server

# Run all backend tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Frontend Component Tests (React Testing Library)

```bash
# Navigate to client directory
cd client

# Run all component tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### End-to-End Tests (Playwright)

```bash
# From project root directory

# Run all E2E tests (headless)
npm test

# Run E2E tests only
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode (interactive)
npm run test:ui

# View test report
npm run test:report
```

### Run All Tests

```bash
# From project root
npm run test:all
```

## Test Coverage

### Backend Unit Tests

**Auth Controller Tests** (`server/__tests__/unit/authController.test.js`)
- ✅ User registration with valid data
- ✅ Password requirement validation
- ✅ Duplicate email prevention
- ✅ Phone number validation and cleaning
- ✅ Phone number with country code handling
- ✅ Validation error handling
- ✅ Duplicate key error handling
- ✅ Email sending failure graceful handling
- ✅ Buyer registration
- ✅ Buyer password validation

**User Model Tests** (`server/__tests__/unit/userModel.test.js`)
- ✅ Field validation (name, email, phone, password)
- ✅ Name length and character validation
- ✅ Email format validation
- ✅ Indian phone number validation
- ✅ Password strength requirements
- ✅ Role enum validation
- ✅ Staff ID validation
- ✅ Status enum validation
- ✅ Default values (role, status, location)
- ✅ Model methods (matchPassword, getResetPasswordToken)
- ✅ Schema options (timestamps, password select)

### Backend Integration Tests

**Auth API Tests** (`server/__tests__/integration/auth.api.test.js`)
- ✅ POST /api/auth/register - successful registration
- ✅ POST /api/auth/register - duplicate email error
- ✅ POST /api/auth/register - missing password error
- ✅ POST /api/auth/register - missing phone number error
- ✅ POST /api/auth/register - phone number cleaning
- ✅ POST /api/auth/register - validation errors
- ✅ POST /api/auth/login - successful login
- ✅ POST /api/auth/login - invalid email
- ✅ POST /api/auth/login - invalid password
- ✅ POST /api/auth/register-buyer - buyer registration

### E2E Tests (Playwright)

**Authentication Flow** (`tests/e2e/auth.spec.js`)
- ✅ User registration flow
- ✅ Registration with existing email
- ✅ Password mismatch validation
- ✅ Required fields validation
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Login empty fields validation
- ✅ Forgot password link presence
- ✅ Navigation between login and register
- ✅ Responsive design (mobile, tablet)

**Dashboard & Features** (`tests/e2e/dashboard.spec.js`)
- ✅ Product list viewing
- ✅ Product search functionality
- ✅ Product filtering by category
- ✅ Orders list viewing
- ✅ Order creation
- ✅ Order filtering by status
- ✅ Dashboard statistics display
- ✅ Navigation from dashboard
- ✅ User profile information
- ✅ Logout functionality

### Frontend Component Tests

**App Component** (`client/src/__tests__/App.test.js`)
- ✅ Renders without crashing
- ✅ Homepage rendering
- ✅ Routes configuration

## Writing New Tests

### Backend Unit Test Template

```javascript
const Controller = require('../../controllers/yourController');
const Model = require('../../models/yourModel');

jest.mock('../../models/yourModel');

describe('Your Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  it('should do something', async () => {
    // Arrange
    req.body = { /* test data */ };
    Model.findOne.mockResolvedValue(null);

    // Act
    await Controller.yourMethod(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
```

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('should perform action', async ({ page }) => {
    await page.click('button');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## CI/CD Integration

The project includes GitHub Actions workflow for automated testing:

**File:** `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Independence
- Each test should be independent
- Use `beforeEach` to reset state
- Clean up data after tests

### 3. Mock External Dependencies
- Mock API calls, database operations
- Use Jest mocks for unit tests
- Avoid hitting real external services

### 4. Assertions
- Make specific assertions
- Test both success and failure cases
- Validate error messages and status codes

### 5. Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical business logic
- Test edge cases and error handling

## Environment Variables

Create `.env.test` file for test environment:

```env
# Test Database
MONGO_URI_TEST=mongodb://localhost:27017/holy-family-test

# JWT Secret
JWT_SECRET=test_secret_key_for_testing

# Base URL for E2E tests
BASE_URL=http://localhost:3000

# Test User Credentials
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=Test@1234
```

## Debugging Tests

### Backend Tests
```bash
# Run specific test file
npm test -- authController.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Debug with Node
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Debug mode with browser visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug specific test
npx playwright test auth.spec.js --debug

# View trace
npx playwright show-trace trace.zip
```

## Common Issues & Solutions

### Issue: Tests timeout
**Solution:** Increase timeout in jest.config.js or test file
```javascript
jest.setTimeout(10000);
```

### Issue: Database connection errors
**Solution:** Ensure MongoDB is running and connection string is correct
```bash
# Start MongoDB locally
mongod --dbpath /data/db
```

### Issue: Playwright browser not found
**Solution:** Install browsers
```bash
npx playwright install
```

### Issue: Port already in use
**Solution:** Change test server port or kill existing process
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

## Test Data Management

### Database Seeding for Tests
Create test fixtures in `server/__tests__/fixtures/`:

```javascript
// fixtures/users.js
module.exports = {
  testUser: {
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '9876543210',
    password: 'Test@1234'
  },
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '9876543211',
    password: 'Admin@1234',
    role: 'admin'
  }
};
```

## Performance Testing

For load testing, consider using:
- **Artillery** for API load testing
- **k6** for performance testing
- **Lighthouse** for frontend performance

## Security Testing

Consider adding:
- **OWASP ZAP** for security scanning
- **Snyk** for dependency vulnerability scanning
- **npm audit** for package security

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation

## Support

For issues or questions:
- Check existing tests for examples
- Review test output and error messages
- Consult the documentation links above
- Contact the development team

---

**Last Updated:** 2025-10-21
**Maintained by:** Holy Family Polymers Development Team
