# Software Test Case Document

## Project Name: Holy Family Polymers - Login Module

---

### Test Case ID: TC_LOGIN_001
**Test Priority:** High  
**Test Designed By:** QA Team  
**Test Designed Date:** October 29, 2025

---

### Module Name: Authentication - Login
**Test Title:** Verify Login Functionality with Valid Credentials  
**Test Executed By:** _____________  
**Test Execution Date:** _____________

---

### Description:
This test case verifies that a user can successfully log in to the Holy Family Polymers system using valid credentials and is redirected to the appropriate dashboard based on their role (Admin, Manager, Lab Staff, Accountant, User, Staff, or Delivery).

---

### Pre-Condition:
- User has a valid registered account with username and password
- The application is accessible at http://localhost:3000/login
- Database is connected and running
- Server is running on port 5000

---

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Navigate to the login page | URL: http://localhost:3000/login | Login page should load successfully with email and password fields visible | | |
| 2 | Enter valid email address in the email field | Email: akhilnk856@gmail.com | Email should be entered in the email input field without any error | | |
| 3 | Enter valid password in the password field | Password: Akhil@68 | Password should be entered in masked format in the password input field | | |
| 4 | Click on the "Login" or "Submit" button | Click action on submit button | System should process the login request and validate credentials | | |
| 5 | Verify authentication process | - | System should authenticate user against database and retrieve user role | | |
| 6 | Verify redirection based on role | - | User should be redirected to role-specific dashboard (e.g., /admin, /manager, /lab, /accountant, /user, /staff, /delivery) | | |
| 7 | Verify URL after successful login | - | Current URL should match pattern: /(admin\|manager\|lab\|accountant\|user\|staff\|delivery)/ | | |
| 8 | Verify user session is created | - | User authentication token should be stored in browser (localStorage/sessionStorage) | | |

---

### Post-Condition:
- User is successfully logged in to the system
- User session is active and authenticated
- User is on their role-specific dashboard
- User can access role-based features and functionalities

---

### Additional Test Notes:
- Test execution timeout: 30 seconds
- Browser compatibility: Chrome (latest version)
- Platform: Windows 10
- Expected behavior: The system should complete the login process within 10 seconds
- Security: Password should be displayed in masked format during input
- Error handling: Invalid credentials should show appropriate error message

---

## Additional Test Cases for Login Module

### Test Case ID: TC_LOGIN_002
**Test Title:** Verify Login with Invalid Email  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter invalid email | Email: invalid@test.com | Email entered | | |
| 3 | Enter valid password | Password: Test@123 | Password entered | | |
| 4 | Click Login button | - | Error message: "Invalid email or password" displayed | | |
| 5 | Verify user remains on login page | - | User should stay on /login page | | |

---

### Test Case ID: TC_LOGIN_003
**Test Title:** Verify Login with Invalid Password  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter valid email | Email: akhilnk856@gmail.com | Email entered | | |
| 3 | Enter invalid password | Password: WrongPass123 | Password entered (masked) | | |
| 4 | Click Login button | - | Error message: "Invalid email or password" displayed | | |
| 5 | Verify user remains on login page | - | User should stay on /login page | | |

---

### Test Case ID: TC_LOGIN_004
**Test Title:** Verify Login with Empty Fields  
**Test Priority:** Medium

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Leave email field empty | Email: (empty) | Field remains empty | | |
| 3 | Leave password field empty | Password: (empty) | Field remains empty | | |
| 4 | Click Login button | - | Validation error: "Email is required" and "Password is required" | | |
| 5 | Verify form validation | - | User cannot submit form with empty fields | | |

---

### Test Case ID: TC_LOGIN_005
**Test Title:** Verify Email Field Validation  
**Test Priority:** Medium

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter invalid email format | Email: invalidemail | Validation error: "Please enter a valid email" | | |
| 3 | Clear email field | - | Error message clears | | |
| 4 | Enter email with spaces | Email: " test@test.com " | Email should be trimmed automatically | | |
| 5 | Enter valid email format | Email: test@test.com | No validation error displayed | | |

---

### Test Case ID: TC_LOGIN_006
**Test Title:** Verify Password Field Security  
**Test Priority:** Medium

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter password | Password: MyPass123 | Characters displayed as dots/asterisks | | |
| 3 | Verify password masking | - | Actual password characters should not be visible | | |
| 4 | Check page source | - | Password should not be visible in plain text in page source | | |

---

### Test Case ID: TC_LOGIN_007
**Test Title:** Verify Role-Based Dashboard Redirection for Admin  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter admin credentials | Email: admin@xyz.com<br>Password: Admin@123 | Credentials entered | | |
| 3 | Click Login button | - | Login processed | | |
| 4 | Verify redirection | - | User redirected to /admin-dashboard | | |
| 5 | Verify admin features visible | - | Admin-specific menu and features are accessible | | |

---

### Test Case ID: TC_LOGIN_008
**Test Title:** Verify Role-Based Dashboard Redirection for Manager  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter manager credentials | Email: manager@xyz.com<br>Password: Manager@123 | Credentials entered | | |
| 3 | Click Login button | - | Login processed | | |
| 4 | Verify redirection | - | User redirected to /manager-dashboard | | |
| 5 | Verify manager features visible | - | Manager-specific menu and features are accessible | | |

---

### Test Case ID: TC_LOGIN_009
**Test Title:** Verify Role-Based Dashboard Redirection for Lab Staff  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to login page | URL: http://localhost:3000/login | Login page loads | | |
| 2 | Enter lab staff credentials | Email: labstaff@xyz.com<br>Password: labstaff@123 | Credentials entered | | |
| 3 | Click Login button | - | Login processed | | |
| 4 | Verify redirection | - | User redirected to /lab or lab-specific dashboard | | |
| 5 | Verify lab features visible | - | Lab staff-specific menu and features are accessible | | |

---

### Test Case ID: TC_LOGIN_010
**Test Title:** Verify Session Management After Login  
**Test Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Login successfully | Valid credentials | User logged in and redirected | | |
| 2 | Check localStorage/sessionStorage | - | Authentication token should be stored | | |
| 3 | Refresh the page | - | User should remain logged in | | |
| 4 | Navigate to different pages | - | Session should persist across pages | | |
| 5 | Close and reopen browser | - | User should remain logged in (if "Remember Me" selected) | | |

---

## Test Execution Summary

**Total Test Cases:** 10  
**Priority Breakdown:**
- High: 7
- Medium: 3

**Execution Status:**
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Executed: ___

**Tested By:** _____________  
**Test Date:** _____________  
**Browser:** Chrome (Latest)  
**Platform:** Windows 10  
**Build Version:** _____________

---

## Defect Summary

| Defect ID | Test Case ID | Severity | Description | Status |
|-----------|--------------|----------|-------------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## Sign-Off

**Tester Signature:** _______________  
**Date:** _______________

**Test Lead Signature:** _______________  
**Date:** _______________






