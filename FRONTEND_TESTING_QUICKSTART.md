# 🎨 Frontend Testing - Quick Start

## ⚡ Run Tests in 3 Commands

```bash
# 1. Navigate to client folder
cd client

# 2. Run tests
npm test

# 3. View results
# Tests run in watch mode by default!
```

---

## 📊 What's Included

### ✅ Test Files Created

1. **`LoginPage.test.js`** (260 lines, 20+ tests)
   - Form rendering
   - Email validation
   - Password validation
   - Form submission
   - Navigation
   - Error handling
   - Loading states

2. **`RegisterPage.test.js`** (304 lines, 25+ tests)
   - Multi-step form
   - Name validation
   - Email validation
   - Phone number validation
   - Password strength
   - Form submission
   - Error handling

3. **`App.test.js`** (43 lines, 3 tests)
   - App rendering
   - Routes configuration

### Total: **50+ Frontend Tests!**

---

## 🚀 Quick Commands

```bash
cd client

# Run all tests
npm test

# Run tests once (no watch)
npm test -- --watchAll=false

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- LoginPage.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

---

## 📝 Test Template

### Copy & Paste Template

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../components/MyComponent';
import '@testing-library/jest-dom';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(
      <BrowserRouter>
        <MyComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<BrowserRouter><MyComponent /></BrowserRouter>);
    
    const button = screen.getByRole('button', { name: /click/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Common Test Patterns

### Test Form Input

```javascript
const input = screen.getByPlaceholderText(/email/i);
fireEvent.change(input, { target: { value: 'test@example.com' } });
expect(input).toHaveValue('test@example.com');
```

### Test Button Click

```javascript
const button = screen.getByRole('button', { name: /submit/i });
fireEvent.click(button);
```

### Test Validation

```javascript
const input = screen.getByPlaceholderText(/email/i);
fireEvent.change(input, { target: { value: 'invalid' } });
fireEvent.blur(input);

await waitFor(() => {
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

### Test Navigation

```javascript
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

// In test
await waitFor(() => {
  expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
});
```

### Test API Call

```javascript
import axios from 'axios';
jest.mock('axios');

axios.get.mockResolvedValue({ data: { products: [] } });

render(<ProductList />);

await waitFor(() => {
  expect(axios.get).toHaveBeenCalledWith('/api/products');
});
```

---

## 🔍 Finding Elements

### By Role (Preferred)

```javascript
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { name: /welcome/i })
```

### By Placeholder

```javascript
screen.getByPlaceholderText(/enter email/i)
screen.getByPlaceholderText(/password/i)
```

### By Text

```javascript
screen.getByText(/welcome back/i)
screen.getByText('Exact Text')
```

### By Label

```javascript
screen.getByLabelText(/email address/i)
```

---

## ✅ Assertions

```javascript
// Element exists
expect(element).toBeInTheDocument()
expect(element).toBeVisible()

// Text content
expect(element).toHaveTextContent('text')

// Attributes
expect(element).toHaveAttribute('href', '/home')
expect(element).toHaveClass('active')
expect(element).toBeDisabled()

// Form values
expect(input).toHaveValue('value')
expect(checkbox).toBeChecked()
```

---

## 🎭 Mocking

### Mock React Router

```javascript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null })
}));
```

### Mock Context

```javascript
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn()
  })
}));
```

### Mock Axios

```javascript
import axios from 'axios';
jest.mock('axios');

axios.get.mockResolvedValue({ data: {} });
axios.post.mockResolvedValue({ data: {} });
```

---

## 🐛 Debugging

### View What's Rendered

```javascript
import { screen } from '@testing-library/react';

// Print current DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));
```

### Check Available Roles

```javascript
screen.logTestingPlaygroundURL();
```

### Use getBy vs queryBy vs findBy

```javascript
// getBy - Throws error if not found
screen.getByText('Text')

// queryBy - Returns null if not found (good for checking absence)
screen.queryByText('Text')

// findBy - Async, waits for element
await screen.findByText('Async Text')
```

---

## ⚠️ Common Issues

### Issue: "Not wrapped in act(...)"

```javascript
// ✅ Fix: Use waitFor
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

### Issue: "Unable to find element"

```javascript
// ✅ Fix: Use findBy (async) or check element exists
const element = await screen.findByText('Text');

// Or check if element exists
const element = screen.queryByText('Text');
expect(element).not.toBeInTheDocument();
```

### Issue: Router error

```javascript
// ✅ Fix: Wrap in BrowserRouter
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <MyComponent />
  </BrowserRouter>
);
```

---

## 📊 View Coverage

```bash
# Generate coverage report
npm test -- --coverage --watchAll=false

# View HTML report (Windows)
start coverage\lcov-report\index.html

# View in terminal
npm test -- --coverage --watchAll=false
```

---

## 📚 Examples in Your Project

### Location of Test Files

```
client/src/__tests__/
├── App.test.js              ✓ Created
├── LoginPage.test.js        ✓ Created (260 lines)
└── RegisterPage.test.js     ✓ Created (304 lines)
```

### Run a Specific Test

```bash
# Run LoginPage tests only
npm test -- LoginPage.test.js

# Run specific test by name
npm test -- --testNamePattern="should render login form"
```

---

## 🎯 Testing Checklist

For each component, test:

- [ ] Renders correctly
- [ ] Handles user input
- [ ] Validates forms
- [ ] Shows error messages
- [ ] Handles loading states
- [ ] Navigates correctly
- [ ] Calls APIs
- [ ] Uses context/props correctly

---

## 🚀 Next Steps

1. **Run tests**: `cd client && npm test`
2. **Review examples**: Check `LoginPage.test.js`
3. **Write new tests**: Use templates above
4. **Check coverage**: `npm test -- --coverage`
5. **Read full guide**: [FRONTEND_TESTING_GUIDE.md](./FRONTEND_TESTING_GUIDE.md)

---

## 📖 Full Documentation

For detailed information, see:
- **[FRONTEND_TESTING_GUIDE.md](./FRONTEND_TESTING_GUIDE.md)** - Complete frontend testing guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Full project testing guide
- **[React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)**

---

## 🎉 You're Ready!

```bash
cd client
npm test
```

Watch your frontend tests run! ✓

---

**Happy Testing! 🎨**

*Last Updated: 2025-10-21*
