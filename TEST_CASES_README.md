# Login Test Cases - Usage Guide

This folder contains comprehensive test case documentation for the **Holy Family Polymers Login Module**.

## Files Created

### 1. **TEST_CASE_LOGIN.md** (Markdown Format)
- Comprehensive documentation in Markdown format
- Contains 10 detailed test cases for login functionality
- Includes test execution summary and defect tracking
- Best for: Version control, GitHub, documentation repositories

### 2. **LOGIN_TEST_CASE_TEMPLATE.html** (HTML Format)
- Professional HTML table format matching standard test case templates
- Ready to print or convert to PDF
- 4 detailed test cases with proper formatting
- Includes execution summary and sign-off section
- **How to use:**
  - Open in any web browser (Chrome, Firefox, Edge, Safari)
  - Print directly or use "Print to PDF" to save as PDF
  - Fill in the blank fields (Actual Result, Status, etc.) after test execution

### 3. **LOGIN_TEST_CASES.csv** (Excel/Spreadsheet Format)
- CSV format compatible with Microsoft Excel and Google Sheets
- Contains all 10 test cases in tabular format
- Easy to edit and update
- Includes execution summary and sign-off section
- **How to use:**
  - Open with Microsoft Excel, Google Sheets, or any spreadsheet application
  - Fill in blank columns during test execution
  - Add formulas to calculate pass percentage automatically
  - Export as .xlsx or keep as .csv

## Test Cases Covered

### High Priority Test Cases (7):
1. **TC_LOGIN_001** - Verify Login with Valid Credentials
2. **TC_LOGIN_002** - Verify Login Fails with Invalid Email
3. **TC_LOGIN_003** - Verify Login Fails with Invalid Password
4. **TC_LOGIN_007** - Verify Role-Based Redirection for Admin
5. **TC_LOGIN_008** - Verify Role-Based Redirection for Manager
6. **TC_LOGIN_009** - Verify Role-Based Redirection for Lab Staff
7. **TC_LOGIN_010** - Verify Session Management After Login

### Medium Priority Test Cases (3):
4. **TC_LOGIN_004** - Verify Login Form Validation with Empty Fields
5. **TC_LOGIN_005** - Verify Email Field Format Validation
6. **TC_LOGIN_006** - Verify Password Field Security (Masking)

## How to Execute Tests

### Manual Testing:
1. Open the HTML file in a browser and print it
2. Follow each test step in order
3. Record the actual results in the "Actual Result" column
4. Mark "Pass" or "Fail" in the Status column
5. Fill in the execution summary
6. Get sign-off from Test Lead

### Automated Testing:
- Refer to `holy-family-polymers/nodejs-selenium-sample/tests/login.test.js` for Selenium automation
- Run tests using: `npm test` or `node tests/login.test.js`

### Test Data:
The following test accounts are available (from server seed data):

**Lab Staff:**
- Email: labstaff@xyz.com
- Password: labstaff@123
- Expected Role: lab_staff
- Expected Redirect: /lab

**Lab Manager:**
- Email: labmanager@xyz.com
- Password: labmanager@123
- Expected Role: lab_manager
- Expected Redirect: /lab (manager view)

**Admin (Example):**
- Email: admin@xyz.com
- Password: Admin@123
- Expected Role: admin
- Expected Redirect: /admin-dashboard

**Regular User (From Selenium test):**
- Email: akhilnk856@gmail.com
- Password: Akhil@68
- Expected Redirect: Role-based dashboard

## Test Environment Requirements

### Prerequisites:
- **Application URL:** http://localhost:3000/login
- **Server:** Running on localhost:5000
- **Database:** MongoDB connected and operational
- **Browser:** Chrome (Latest version recommended)
- **Platform:** Windows 10 (or cross-platform)

### Setup Steps:
1. Start MongoDB database
2. Start backend server: `cd server && npm start`
3. Start frontend: `cd client && npm start`
4. Verify server is running on port 5000
5. Verify frontend is accessible at http://localhost:3000

## Filling Out Test Results

### During Test Execution:
1. **Test Designed By:** Enter tester's name
2. **Test Designed Date:** Enter date when test was created
3. **Test Executed By:** Enter name of person executing the test
4. **Test Execution Date:** Enter actual test execution date
5. **Actual Result:** Record what actually happened during the test
6. **Status:** Mark as "Pass" or "Fail"

### After Test Execution:
1. Count total Pass/Fail results
2. Calculate Pass Percentage: (Passed / Total) × 100
3. Document any defects found
4. Get signatures from Tester and Test Lead
5. Archive the completed test case document

## Defect Reporting

If any test fails, create a defect entry with:
- **Defect ID:** Unique identifier (e.g., BUG_LOGIN_001)
- **Test Case ID:** Reference to failed test case
- **Severity:** Critical, High, Medium, Low
- **Description:** Detailed description of the issue
- **Status:** Open, In Progress, Fixed, Closed

## Integration with Existing Tests

### Selenium Tests:
The project already has automated Selenium tests in:
```
holy-family-polymers/nodejs-selenium-sample/tests/login.test.js
```

These test cases can be used to:
- Validate the manual test cases
- Automate regression testing
- Run tests on LambdaTest cloud platform

### Frontend Tests:
Check `holy-family-polymers/client/src/__tests__/` for component tests.

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 29, 2025 | QA Team | Initial test case creation |

## Contact

For questions or updates to these test cases, please contact the QA team.

---

**Note:** These test cases should be reviewed and updated whenever there are changes to the login functionality or requirements.






