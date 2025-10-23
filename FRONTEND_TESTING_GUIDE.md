# 🎨 Frontend Testing Guide - React Testing Library

## Overview

This guide covers frontend testing for the Holy Family Polymers React application using **React Testing Library** and **Jest**.

---

## 📚 Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Running Frontend Tests](#running-frontend-tests)
3. [Test Structure](#test-structure)
4. [Writing Component Tests](#writing-component-tests)
5. [Testing Best Practices](#testing-best-practices)
6. [Common Patterns](#common-patterns)
7. [Mocking Strategies](#mocking-strategies)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup & Installation

### Dependencies

Your React app (created with Create React App) already includes:

```json
{
  "@testing-library/jest-dom": "^5.17.0",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "^13.5.0",
  "react-scripts": "5.0.1"
}
```

### Additional Setup (if needed)

```bash
cd client
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

---

## 🎯 Running Frontend Tests

### Basic Commands

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- LoginPage.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run tests without watch mode (for CI)
npm test -- --watchAll=false
```

### Coverage Reports

```bash
# Generate and view coverage
npm test -- --coverage --watchAll=false

# Open HTML coverage report (Windows)
start coverage\lcov-report\index.html
```

---

## 📁 Test Structure

### File Organization

```
client/src/
├── __tests__/                  # Test files
│   ├── App.test.js             # App component tests
│   ├── LoginPage.test.js       # Login page tests
│   ├── RegisterPage.test.js    # Register page tests
│   ├── Dashboard.test.js       # Dashboard tests
│   └── ...
│
├── components/                 # Components to test
│   ├── common/
│   ├── auth/
│   └── ...
│
├── pages/                      # Page components
│   ├── auth/
│   │   ├── LoginPage.js
│   │   └── RegisterPage.js
│   └── ...
│
└── setupTests.js              # Test setup (auto-imported)
```

### Naming Convention

- Test files: `ComponentName.test.js` or `ComponentName.spec.js`
- Place tests near components or in `__tests__` folder
- Use descriptive test names: `should render login form`

---

## ✍️ Writing Component Tests

### Basic Test Template

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../components/MyComponent';
import '@testing-library/jest-dom';

describe('MyComponent', () => {
  // Setup before each test
  beforeEach(() => {
    // Reset mocks, clear storage, etc.
  });

  // Test rendering
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  // Test user interaction
  it('should handle button click', () => {
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

---

## 🧪 Testing Best Practices

### 1. Query by Accessibility

Use queries that reflect how users interact with your app:

```javascript
// ✅ GOOD - User-centric queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Welcome')

// ❌ AVOID - Implementation details
screen.getByClassName('submit-btn')
screen.getByTestId('submit-button')
```

### 2. Test User Behavior, Not Implementation

```javascript
// ✅ GOOD - Tests what user sees and does
it('should show error for invalid email', async () => {
  render(<LoginPage />);
  
  const emailInput = screen.getByPlaceholderText(/email/i);
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.blur(emailInput);
  
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});

// ❌ AVOID - Tests implementation details
it('should update state on input change', () => {
  const { rerender } = render(<LoginPage />);
  expect(component.state.email).toBe(''); // DON'T test state directly
});
```

### 3. Use waitFor for Async Operations

```javascript
// ✅ GOOD - Wait for async updates
it('should submit form', async () => {
  render(<LoginPage />);
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### 4. Clean Up After Tests

```javascript
describe('Component Tests', () => {
  beforeEach(() => {
    // Setup before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });
});
```

---

## 🎭 Common Patterns

### Testing Forms

```javascript
it('should validate and submit form', async () => {
  const mockSubmit = jest.fn();
  render(<LoginForm onSubmit={mockSubmit} />);
  
  // Fill form
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  // Submit
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Testing Navigation

```javascript
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

it('should navigate after login', async () => {
  render(<LoginPage />);
  
  // Perform login...
  
  await waitFor(() => {
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
```

### Testing Context

```javascript
import { AuthContext } from '../context/AuthContext';

const mockAuthContext = {
  user: { name: 'Test User' },
  login: jest.fn(),
  logout: jest.fn()
};

it('should use auth context', () => {
  render(
    <AuthContext.Provider value={mockAuthContext}>
      <MyComponent />
    </AuthContext.Provider>
  );
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

### Testing API Calls

```javascript
import axios from 'axios';

jest.mock('axios');

it('should fetch and display data', async () => {
  axios.get.mockResolvedValue({
    data: { products: [{ id: 1, name: 'Product 1' }] }
  });
  
  render(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });
  
  expect(axios.get).toHaveBeenCalledWith('/api/products');
});
```

### Testing Conditional Rendering

```javascript
it('should show loading state', () => {
  render(<Component loading={true} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

it('should show content when not loading', () => {
  render(<Component loading={false} data="Content" />);
  expect(screen.getByText('Content')).toBeInTheDocument();
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### Testing Error States

```javascript
it('should display error message', async () => {
  const errorMessage = 'Something went wrong';
  render(<Component error={errorMessage} />);
  
  expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
});
```

---

## 🎭 Mocking Strategies

### Mock React Router

```javascript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null, pathname: '/' }),
  useParams: () => ({ id: '123' })
}));
```

### Mock Context/Hooks

```javascript
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn()
  })
}));
```

### Mock External Libraries

```javascript
// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div>Google Login Mock</div>
}));

// Mock Axios
jest.mock('axios');
```

### Mock LocalStorage

```javascript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;
```

---

## 📖 Examples

### Example 1: Testing Login Form

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../pages/auth/LoginPage';

describe('LoginPage', () => {
  it('should login successfully with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ user: { role: 'user' } });
    
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

### Example 2: Testing Validation

```javascript
it('should show validation errors', async () => {
  render(<RegisterPage />);
  
  const emailInput = screen.getByPlaceholderText(/email/i);
  
  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.blur(emailInput);
  
  await waitFor(() => {
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });
});
```

### Example 3: Testing Lists

```javascript
it('should render product list', () => {
  const products = [
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' }
  ];
  
  render(<ProductList products={products} />);
  
  expect(screen.getByText('Product 1')).toBeInTheDocument();
  expect(screen.getByText('Product 2')).toBeInTheDocument();
});
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Issue: "Not wrapped in act(...)"

```javascript
// ✅ Fix: Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

#### Issue: "Unable to find element"

```javascript
// ✅ Fix: Use proper queries and wait for elements
// Instead of: screen.getBy...
// Use: screen.findBy... (async) or screen.queryBy... (returns null if not found)

await screen.findByText('Async Text'); // Waits for element
const element = screen.queryByText('Maybe Not There'); // Returns null if not found
```

#### Issue: "Router context not found"

```javascript
// ✅ Fix: Wrap component in BrowserRouter
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <MyComponent />
  </BrowserRouter>
);
```

#### Issue: Tests fail due to external dependencies

```javascript
// ✅ Fix: Mock external dependencies
jest.mock('axios');
jest.mock('../services/api');
```

---

## 📊 Coverage Goals

### Target Coverage

```
Statements   : 80%
Branches     : 75%
Functions    : 80%
Lines        : 80%
```

### View Coverage

```bash
npm test -- --coverage --watchAll=false

# View detailed HTML report
start coverage/lcov-report/index.html
```

---

## ✅ Testing Checklist

Before committing:

- [ ] All tests pass (`npm test`)
- [ ] New components have tests
- [ ] Forms are tested (validation, submission)
- [ ] Error states are tested
- [ ] Loading states are tested
- [ ] Navigation is tested
- [ ] User interactions are tested
- [ ] Coverage doesn't decrease
- [ ] No act() warnings
- [ ] Mocks are cleaned up

---

## 🎯 What to Test

### ✅ DO Test

- Component rendering
- User interactions (clicks, typing, etc.)
- Form validation
- Error handling
- Loading states
- Conditional rendering
- Navigation/routing
- API integration
- Context usage

### ❌ DON'T Test

- Implementation details (state, internal methods)
- Third-party libraries
- Styles/CSS (use visual regression instead)
- Complex Redux selectors (test in integration)

---

## 📚 Quick Reference

### Query Priority

1. `getByRole` - Preferred (accessibility)
2. `getByLabelText` - Form inputs
3. `getByPlaceholderText` - Form inputs
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

### Assertion Types

```javascript
// Presence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).not.toBeInTheDocument();

// Text content
expect(element).toHaveTextContent('text');
expect(element).toContainHTML('<span>text</span>');

// Attributes
expect(element).toHaveAttribute('href', '/home');
expect(element).toHaveClass('active');
expect(element).toBeDisabled();
expect(element).toBeEnabled();

// Form elements
expect(element).toHaveValue('value');
expect(element).toBeChecked();
expect(element).toHaveFocus();
```

### Async Testing

```javascript
// Wait for element to appear
const element = await screen.findByText('Async Text');

// Wait for condition
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});

// Wait with timeout
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 3000 });
```

---

## 🔗 Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🎓 Next Steps

1. **Run existing tests**: `cd client && npm test`
2. **Review examples**: Check `LoginPage.test.js` and `RegisterPage.test.js`
3. **Write new tests**: Use templates from this guide
4. **Increase coverage**: Aim for 80%+
5. **Integrate with CI**: Tests run on every push

---

**Happy Testing! 🎨**

*Last Updated: 2025-10-21*
