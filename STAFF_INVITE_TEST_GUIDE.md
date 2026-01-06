# 🧪 Admin Staff Invite Page - Playwright Test Guide

## 📋 Overview

Comprehensive Playwright test suite for the **Admin Staff Invite** functionality.

**Test File**: `tests/e2e/admin-staff-invite.spec.js`

---

## 🎯 Test Coverage (26 Tests)

### ✅ **Page Load & UI Tests** (4 tests)
- Staff management page loads correctly
- Staff invite form fields display
- Role selection dropdown functionality
- Staff list/table displays

### ✅ **Form Validation Tests** (6 tests)
- Empty email validation
- Invalid email format validation
- Phone number validation
- Name field validation
- Address field validation
- Staff ID field validation

### ✅ **Invite Workflow Tests** (6 tests)
- Confirmation dialog before sending
- Success message after invite
- Duplicate email prevention
- Form clears after submission
- Loading state during submission
- Phone number sanitization

### ✅ **Staff Management Features** (5 tests)
- Display list of invited staff
- Search/filter functionality
- Role filter dropdown
- Staff status badges
- Resend invite option

### ✅ **Additional Features** (5 tests)
- Approve button for verified staff
- Download/export staff list
- Staff ID field display
- Form field sanitization
- Error handling

---

## 🚀 How to Run Tests

### **Prerequisite: Start Servers**

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

### **Method 1: Run Staff Invite Tests Only**

**Terminal 3:**
```bash
npm run test:staff-invite
```

This will:
1. ✅ Run all 26 staff invite page tests
2. ✅ Generate HTML report with screenshots
3. ✅ Automatically open report in browser

---

### **Method 2: Run All E2E Tests**

Run login + staff invite + other tests:
```bash
npm run test:e2e
```

---

### **Method 3: Interactive UI Mode**

```bash
npm run test:ui
```
Then select `admin-staff-invite.spec.js` from the list.

---

### **Method 4: Watch Mode (See Browser)**

```bash
npx playwright test tests/e2e/admin-staff-invite.spec.js --headed
```

---

## 📊 What Gets Tested

### 1. **Authentication Flow**
```
Login as Admin → Navigate to Staff Page → Access Invite Form
```

### 2. **Form Validation**
- ✅ Email format validation
- ✅ Phone number format
- ✅ Required field checks
- ✅ Duplicate prevention

### 3. **Invite Process**
```
Fill Form → Validation → Confirmation → API Call → Success/Error
```

### 4. **Staff List Management**
- ✅ View all invited staff
- ✅ Filter by role
- ✅ Filter by status
- ✅ Search by name/email

### 5. **Staff Actions**
- ✅ Resend invite
- ✅ Approve staff
- ✅ Download PDF
- ✅ Toggle active status

---

## 🎨 Test Results

The HTML report shows:
- ✅ **Pass/Fail status** for each of 26 tests
- 📸 **Screenshots** of failures
- 🎥 **Video recordings** of test runs
- 🕵️ **Network logs** for API calls
- ⏱️ **Execution time** per test

---

## 🔧 Test Credentials

The tests use these admin credentials:
- **Email**: `admin@xyz.com`
- **Password**: `admin@123`

Make sure this user exists in your database with admin role.

---

## 📂 File Structure

```
tests/
└── e2e/
    ├── login.spec.js                    ← Login page tests
    └── admin-staff-invite.spec.js       ← Staff invite tests (NEW!)

playwright-report/
└── index.html                           ← HTML test report

test-results/
└── [test-name]/
    ├── screenshots/
    ├── videos/
    └── traces/
```

---

## ✨ Expected Output (Success)

```bash
🚀 Running Admin Staff Invite Tests...

Running 26 tests using 3 workers

  ✓ Staff management page should load correctly (2.1s)
  ✓ Should display staff invite form fields (1.8s)
  ✓ Should have role selection dropdown (1.9s)
  ✓ Should validate email field - empty (2.2s)
  ✓ Should validate email format (2.1s)
  ✓ Should validate phone number field (2.0s)
  ✓ Should validate name field (1.9s)
  ✓ Should show confirmation dialog (2.5s)
  ✓ Should display success message (3.2s)
  ✓ Should prevent duplicate email invites (3.1s)
  ✓ Should display list of invited staff (1.7s)
  ✓ Should have search/filter functionality (2.3s)
  ✓ Should have role filter dropdown (1.8s)
  ✓ Should display staff status badges (1.6s)
  ✓ Should have resend invite option (1.9s)
  ✓ Should have approve button (1.8s)
  ✓ Should clear form after submission (3.4s)
  ✓ Should sanitize phone number input (2.1s)
  ✓ Should validate address field (2.0s)
  ✓ Should display staff ID field (1.5s)
  ✓ Should have download/export option (1.7s)
  ✓ Should show loading state (2.2s)
  ... and 4 more tests

  26 passed (54.2s)

✅ All tests passed!
📊 Opening HTML report...
```

---

## 🛠️ Troubleshooting

### ❌ **Test fails at login step**

**Check:**
1. Admin credentials are correct
2. MongoDB is running
3. Backend server is started

**Fix:**
```bash
# Verify admin user exists
cd server
node check-admin-user.js
```

---

### ❌ **Cannot find staff page**

**Check:**
1. Frontend is running on port 3000
2. Admin routes are properly configured

**Navigate manually:**
- Login: http://localhost:3000/login
- Admin Staff: http://localhost:3000/admin/staff

---

### ❌ **Form submission fails**

**Check:**
1. Backend API endpoint `/api/staff/invite` exists
2. No rate limiting issues
3. Database connection is active

**View API logs** in backend terminal

---

### ❌ **Duplicate email error**

This is **expected behavior** for existing emails.

The test validates that the system correctly prevents duplicate invites.

---

## 📸 Screenshots & Videos

Failed tests automatically capture:
- ✅ Screenshot at failure point
- ✅ Video of entire test run
- ✅ Network activity logs
- ✅ Console errors

**Location**: `test-results/admin-staff-invite-*/`

---

## 🎯 Quick Commands

| Command | Description |
|---------|-------------|
| `npm run test:staff-invite` | Run staff invite tests |
| `npm run test:report` | Open last HTML report |
| `npm run test:ui` | Interactive UI mode |
| `npm run test:headed` | Run with visible browser |
| `npx playwright test --debug` | Debug mode |

---

## 📊 Test Scenarios Covered

### Scenario 1: Successful Staff Invite
```
Fill Form → Validate → Confirm → API Call → Success Message → Form Clears
```

### Scenario 2: Invalid Email
```
Enter Invalid Email → Submit → Show Validation Error
```

### Scenario 3: Duplicate Email
```
Enter Existing Email → Submit → Show Error: "Email already used"
```

### Scenario 4: Search Staff
```
Enter Search Term → Filter Results → Display Matching Staff
```

### Scenario 5: Approve Staff
```
View Verified Staff → Click Approve → Update Status → Show Success
```

---

## 🔍 What Makes These Tests Unique

1. **Full Authentication Flow**: Tests login before accessing admin features
2. **Real Form Validation**: Tests actual validation rules, not just UI
3. **API Integration**: Validates backend responses
4. **User Experience**: Tests loading states, error messages, success feedback
5. **Data Integrity**: Prevents duplicate emails, validates phone formats

---

## ✅ Next Steps

1. ✅ **Run the tests**: `npm run test:staff-invite`
2. ✅ **Review HTML report** for detailed results
3. ✅ **Fix any failures** based on screenshot evidence
4. ✅ **Add more tests** as new features are added

---

## 📞 Need Help?

1. Check the HTML report for detailed error messages
2. View screenshots in `test-results/` folder
3. Check server logs in backend terminal
4. Ensure MongoDB connection is active

---

**Happy Testing! 🧪✨**

---

## 🎓 Learn More

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
