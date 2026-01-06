# 🧪 Dashboard Pages - Playwright Test Guide

## 📋 Overview

Comprehensive Playwright test suite for **Manager Dashboard** and **Accountant Dashboard** pages.

**Test File**: `tests/e2e/dashboard-pages.spec.js`

---

## 🎯 Test Coverage (38 Tests)

### ✅ **Manager Dashboard Tests** (10 tests)
- Dashboard loads correctly
- Loading state display
- Attendance summary section
- Notifications section
- Mark notification as read
- Bills pending section
- Stock summary section
- Periodic data refresh
- API error handling
- Notification navigation

### ✅ **Accountant Dashboard Tests** (28 tests)
- Dashboard loads correctly
- Header display
- Quick actions section
- All quick action buttons (4 buttons)
- Button navigation links
- Notifications section
- Notifications header
- Unread badge display
- Empty state handling
- Notification list display
- Notification items structure
- Mark as read functionality
- Notification open links
- Icon display
- Timestamp display
- API error handling
- Button styling

---

## 🚀 How to Run Tests

### **Step 1: Start Servers**

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Wait for: `✅ Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Wait for: `✅ Serving on http://localhost:3000`

---

### **Step 2: Run Dashboard Tests**

**Terminal 3:**
```bash
npm run test:dashboards
```

This will:
1. ✅ Run all 38 dashboard tests
2. ✅ Test both Manager & Accountant dashboards
3. ✅ Generate HTML report with screenshots
4. ✅ Automatically open report in browser

---

## 🔑 Test Credentials

### **Manager Dashboard Tests**
- **Email**: `manager@xyz.com`
- **Password**: `manager@123`

### **Accountant Dashboard Tests**
- **Email**: `accountant@xyz.com`
- **Password**: `accountant@123`

**Note**: Make sure these users exist in your database with the correct roles!

---

## 📊 What Gets Tested

### **Manager Dashboard**
```
Login as Manager
 ↓
Navigate to /manager/dashboard
 ↓
Check page load
 ↓
Verify sections:
  - Attendance Summary
  - Bills Pending
  - Stock Summary
  - Notifications
 ↓
Test interactions:
  - Mark notifications as read
  - View notification details
  - Handle errors
```

### **Accountant Dashboard**
```
Login as Accountant
 ↓
Navigate to /accountant/dashboard
 ↓
Check page load
 ↓
Verify sections:
  - Dashboard Header
  - Quick Actions (4 buttons)
  - Notifications
 ↓
Test interactions:
  - Click action buttons
  - Navigate to features
  - Mark notifications as read
  - View notification details
```

---

## 🎨 Quick Actions Tested

### Accountant Dashboard Actions:
1. ✅ **Verify Latex Billing** → `/accountant/latex`
2. ✅ **Auto Wages** → `/accountant/wages`
3. ✅ **Stock Monitor** → `/accountant/stock`
4. ✅ **Bill Payments** → `/accountant/payments`

All buttons are tested for:
- Visibility
- Correct navigation links
- Proper styling
- Icon display

---

## 📸 Test Results

The HTML report includes:
- ✅ Pass/Fail status for each test
- 📸 Screenshots of failures
- 🎥 Video recordings of test runs
- 🕵️ Network logs for API calls
- ⏱️ Execution time per test

---

## 🛠️ Common Issues & Solutions

### ❌ **Manager/Accountant login fails**

**Problem**: User doesn't exist or wrong password

**Solution**:
```bash
# Create default users
cd server
node create-default-users.js
```

Or manually create users in MongoDB with roles:
- Manager: `role: 'manager'`
- Accountant: `role: 'accountant'`

---

### ❌ **Dashboard loads but no data**

**Problem**: API endpoints not responding

**Solution**:
1. Check backend server is running
2. Check MongoDB connection
3. Verify API routes exist
4. Check browser console for errors

---

### ❌ **Notifications not loading**

**Problem**: Notifications API failing

**Solution**:
```bash
# Check notifications endpoint
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### ❌ **Tests timeout on navigation**

**Problem**: Dashboard takes too long to load

**Solution**: Increase timeout in test:
```javascript
await page.waitForURL('**/manager/**', { timeout: 30000 });
```

---

## 🎯 Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:dashboards` | Run dashboard tests (38 tests) |
| `npm run test:e2e` | Run all E2E tests |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | Run with visible browser |
| `npm run test:report` | Open last HTML report |

---

## 📂 File Structure

```
tests/
└── e2e/
    ├── login.spec.js                # Login tests (12)
    ├── admin-staff-invite.spec.js   # Staff invite tests (26)
    └── dashboard-pages.spec.js      # Dashboard tests (38) ← NEW!
```

---

## ✨ Expected Output (Success)

```bash
🚀 Running Dashboard Tests...

Running 38 tests using 3 workers

Manager Dashboard Tests
  ✓ Manager dashboard should load correctly (2.3s)
  ✓ Should display loading state initially (1.8s)
  ✓ Should display attendance summary section (2.1s)
  ✓ Should display notifications section (1.9s)
  ✓ Should handle mark notification as read (2.4s)
  ✓ Should display bills pending section (1.7s)
  ✓ Should display stock summary section (1.8s)
  ✓ Should refresh data periodically (3.2s)
  ✓ Should display error message if API fails (2.0s)
  ✓ Should navigate to notification link (1.9s)

Accountant Dashboard Tests
  ✓ Accountant dashboard should load correctly (2.2s)
  ✓ Should display dashboard header (1.6s)
  ✓ Should display quick actions section (1.8s)
  ✓ Should display all quick action buttons (1.7s)
  ✓ Should have verify latex billing button (1.9s)
  ✓ Should have auto wages button (1.8s)
  ✓ Should have stock monitor button (1.7s)
  ✓ Should have bill payments button (1.8s)
  ✓ Should display notifications section (2.0s)
  ✓ Should display notifications header (1.6s)
  ✓ Should show unread badge if notifications (2.1s)
  ✓ Should display empty state when no notifications (1.9s)
  ✓ Should display notification list (2.0s)
  ✓ Should display notification items correctly (2.3s)
  ✓ Should mark notification as read (2.5s)
  ✓ Should navigate when open link clicked (1.8s)
  ✓ Should display notification icons (1.7s)
  ✓ Should display notification timestamp (1.6s)
  ✓ Should handle API errors gracefully (2.0s)
  ✓ Quick action buttons styling (1.8s)
  ... and 8 more tests

  38 passed (68.4s)

✅ All tests passed!
📊 Opening HTML report...
```

---

## 📊 Total Test Suite Summary

| Test Suite | Tests | Command |
|------------|-------|---------|
| Login Page | 12 | `npm run test:login-page` |
| Staff Invite | 26 | `npm run test:staff-invite` |
| **Dashboards** | **38** | **`npm run test:dashboards`** |
| **TOTAL** | **76 tests** | `npm run test:e2e` |

---

## 🔍 What Makes These Tests Unique

1. **Role-Based Testing**: Tests different user roles (Manager vs Accountant)
2. **Real-Time Features**: Tests notification system and data refresh
3. **Navigation Testing**: Validates all quick action links
4. **State Management**: Tests loading, error, and empty states
5. **API Integration**: Tests real backend data fetching

---

## ✅ Next Steps

1. ✅ **Run the tests**: `npm run test:dashboards`
2. ✅ **Review HTML report** for detailed results
3. ✅ **Fix any failures** based on screenshots
4. ✅ **Add more dashboard tests** as features grow

---

**Happy Testing! 🧪✨**
