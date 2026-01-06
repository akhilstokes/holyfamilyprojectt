# 🎯 How to Run Login Page Tests - Step by Step

## ⚠️ Why Your Tests Failed

**All 42 tests failed** because the application wasn't running. Playwright tests need:
- ✅ **Backend Server** running on `http://localhost:5000`
- ✅ **Frontend Client** running on `http://localhost:3000`

---

## 🚀 EASIEST METHOD - Just 3 Steps!

### Step 1: Open Terminal #1 - Start Backend
```bash
cd server
npm start
```

**Wait for:** `✅ MongoDB Connected` and `Server running on port 5000`

### Step 2: Open Terminal #2 - Start Frontend  
```bash
cd client
npm start
```

**Wait for:** `Compiled successfully!` and `Accepting connections at http://localhost:3000`

### Step 3: Open Terminal #3 - Run Tests
```bash
node run-login-test.js
```

**OR**

```bash
npm run test:login-page
```

---

## 📊 What Happens Next

1. ✅ Script checks if servers are running
2. ✅ Runs all login page tests (12 tests)
3. ✅ Generates HTML report with screenshots
4. ✅ Automatically opens report in your browser

---

## 🎨 Test Results in Beautiful HTML Report

The HTML report shows:
- ✅ **Pass/Fail Status** for each test
- 📸 **Screenshots** of failures
- 🎥 **Video recordings** of test runs
- 🕵️ **Detailed traces** for debugging
- ⏱️ **Execution time** for each test
- 🌐 **Network logs** and API calls

---

## 📋 What Tests Are Included

### 1. **Page Load Tests** (3 tests)
- ✅ Login page loads correctly
- ✅ Form fields are empty by default
- ✅ All UI elements visible (logo, buttons, inputs)

### 2. **Validation Tests** (4 tests)
- ✅ Empty form submission validation
- ✅ Invalid email format detection
- ✅ Short password validation
- ✅ Field-level error messages

### 3. **Authentication Tests** (3 tests)
- ✅ Invalid credentials error handling
- ✅ **Successful login** with admin credentials
- ✅ Loading state during submission

### 4. **UI/UX Tests** (2 tests)
- ✅ Navigation links functional
- ✅ Google Sign-In button visible

---

## 🔍 Alternative Ways to Run

### Option A: Playwright UI Mode (Interactive)
```bash
npm run test:ui
```
Then select `login.spec.js` from the UI

### Option B: Watch Mode (See Browser)
```bash
npm run test:headed
```

### Option C: Specific Browser
```bash
# Chrome only
npx playwright test tests/e2e/login.spec.js --project=chromium

# Firefox only
npx playwright test tests/e2e/login.spec.js --project=firefox
```

---

## 🛠️ Troubleshooting

### ❌ "Backend server (port 5000) is NOT running"

**Solution:**
```bash
cd server
npm install   # If first time
npm start
```

Check `server/.env` file exists with MongoDB connection string.

---

### ❌ "Frontend client (port 3000) is NOT running"

**Solution:**
```bash
cd client
npm install   # If first time
npm start
```

---

### ❌ "ECONNREFUSED" or Timeout Errors

**Check:**
1. Both servers are fully started (not just starting)
2. No firewall blocking ports 3000 or 5000
3. MongoDB is running

**Fix:**
```bash
# Kill any stuck processes
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

### ❌ Tests Still Fail After Server Started

1. **Clear browser cache:**
   ```bash
   npx playwright clean
   ```

2. **Check test credentials:**
   - Email: `admin@xyz.com`
   - Password: `admin@123`
   
   Make sure this user exists in your database.

3. **Increase timeout:**
   Edit `playwright.config.js`:
   ```javascript
   timeout: 30000, // 30 seconds per test
   ```

---

## 📂 Where to Find Results

### HTML Report:
```
playwright-report/index.html
```

### Screenshots:
```
test-results/[test-name]/[screenshot].png
```

### Videos:
```
test-results/[test-name]/video.webm
```

### Trace Files:
```
test-results/[test-name]/trace.zip
```

Open trace with:
```bash
npx playwright show-trace test-results/path/to/trace.zip
```

---

## ✨ Expected Output (Success)

```
🚀 Starting Login Page Playwright Test...

============================================================
TEST SUITE: Login Page Functionality
============================================================

🔍 Checking if servers are running...

✅ Backend server is running on port 5000
✅ Frontend client is running on port 3000

📋 Running Playwright tests...

Running 12 tests using 3 workers

  ✓ [chromium] › e2e/login.spec.js:10:3 › Login page should load correctly (2.1s)
  ✓ [chromium] › e2e/login.spec.js:33:3 › Form fields should be empty by default (1.8s)
  ✓ [chromium] › e2e/login.spec.js:41:3 › Should show validation errors (1.9s)
  ✓ [chromium] › e2e/login.spec.js:58:3 › Should display error for invalid email (2.3s)
  ✓ [chromium] › e2e/login.spec.js:77:3 › Should display error for short password (2.1s)
  ✓ [chromium] › e2e/login.spec.js:94:3 › Should show loading state (1.7s)
  ✓ [chromium] › e2e/login.spec.js:115:3 › Should display error for invalid credentials (3.2s)
  ✓ [chromium] › e2e/login.spec.js:136:3 › Should successfully login (3.8s)
  ✓ [chromium] › e2e/login.spec.js:159:3 › Navigation links visible (2.4s)
  ✓ [chromium] › e2e/login.spec.js:181:3 › Google Sign-In button visible (1.9s)
  ✓ [chromium] › e2e/login.spec.js:192:3 › Password field type (1.6s)
  ✓ [chromium] › e2e/login.spec.js:202:3 › Form state maintenance (2.2s)

  12 passed (27.0s)

✅ Tests completed!
📊 Opening HTML report in browser...
```

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| Run tests | `node run-login-test.js` |
| View report | `npm run test:report` |
| UI mode | `npm run test:ui` |
| Headed mode | `npm run test:headed` |
| Debug mode | `npx playwright test --debug` |

---

## 📞 Need More Help?

1. Check `LOGIN_TEST_GUIDE.md` for detailed information
2. View the HTML report for specific failure details
3. Check server logs in terminals #1 and #2
4. Ensure MongoDB is connected

---

**Happy Testing! 🧪✨**
