# 🧪 Login Page Playwright Test Guide

## ❌ Why Tests Failed

All 42 tests failed because:
- **The application wasn't running** when tests executed
- Playwright tried to connect to `http://localhost:3000` but found nothing
- Both backend (port 5000) and frontend (port 3000) must be running

---

## ✅ Solution: 3 Ways to Run Tests

### **Method 1: Automatic (Recommended) - Using Playwright Config**

The `playwright.config.js` is now configured to auto-start servers:

```bash
npm run test:login-page
```

This will:
1. ✅ Auto-start backend server (port 5000)
2. ✅ Auto-start frontend client (port 3000)
3. ✅ Run login page tests
4. ✅ Generate HTML report

---

### **Method 2: Using Batch File (Windows)**

Double-click the file:
```
start-and-test-login.bat
```

Or run from terminal:
```bash
.\start-and-test-login.bat
```

---

### **Method 3: Manual Start (Full Control)**

#### Step 1: Start Backend Server
Open **Terminal 1**:
```bash
cd server
npm start
```

Wait until you see: `✅ Server running on port 5000`

#### Step 2: Start Frontend Client
Open **Terminal 2**:
```bash
cd client
npm start
```

Wait until you see: `✅ Serving on http://localhost:3000`

#### Step 3: Run Tests
Open **Terminal 3**:
```bash
npm run test:login-page
```

---

## 📊 View Test Results

After tests complete, the HTML report will auto-open in your browser.

If not, manually open:
```bash
npm run test:report
```

Or open directly:
```
playwright-report/index.html
```

---

## 🎯 Test Coverage

The login page test suite includes **12 comprehensive tests**:

### ✅ Page Load Tests
- Login page loads correctly
- Form fields are empty by default
- Company logo visibility
- Navigation links functionality

### ✅ Validation Tests
- Empty form submission validation
- Invalid email format detection
- Short password validation
- Field-level error messages

### ✅ Authentication Tests
- Invalid credentials error handling
- **Successful login with valid credentials** (admin@xyz.com / admin@123)
- Loading state during submission

### ✅ UI/UX Tests
- Password field type verification
- Form state maintenance
- Error clearing on user input
- Google Sign-In button visibility

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

**Backend (5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: MongoDB Not Connected

Make sure MongoDB is running and `.env` files are configured:
- `server/.env` - Backend environment variables
- `client/.env` - Frontend environment variables

### Issue: Tests Timeout

Increase timeout in `playwright.config.js`:
```javascript
timeout: 180000, // 3 minutes
```

---

## 📁 Project Structure

```
holy-family-polymers/
├── tests/
│   └── e2e/
│       └── login.spec.js          ← Login page tests
├── playwright.config.js            ← Playwright configuration
├── playwright-report/              ← HTML test reports
├── start-and-test-login.bat        ← Quick start script
└── LOGIN_TEST_GUIDE.md             ← This guide
```

---

## 🚀 Quick Start Commands

| Command | Description |
|---------|-------------|
| `npm run test:login-page` | Run login page tests with HTML report |
| `npm run test:report` | Open last HTML report |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:e2e` | Run all E2E tests |

---

## 📸 Screenshots & Videos

Failed tests automatically capture:
- ✅ Screenshots (saved in `test-results/`)
- ✅ Videos (saved in `test-results/`)
- ✅ Traces (for debugging)

View in HTML report or use:
```bash
npx playwright show-trace test-results/path/to/trace.zip
```

---

## ✨ Next Steps

1. ✅ Fix any failing tests
2. ✅ Review HTML report for detailed insights
3. ✅ Add more test cases as needed
4. ✅ Integrate with CI/CD (GitHub Actions already configured)

---

**Need Help?** Check the HTML report for:
- Detailed error messages
- Screenshots of failures
- Video recordings
- Network activity logs
