# Lab Staff Management Guide

## Problem Solved ✅
**Issue**: "No active Lab Staff found. Please add employees with role 'lab_staff' first."

**Solution**: Created lab staff users with the correct role and provided management tools.

## Lab Staff Users Created

### 1. **Lab Staff Users** (Role: `lab_staff`)
- **Lab Staff 1**: `labstaff1@holyfamily.com` / `LAB001`
- **Lab Staff 2**: `labstaff2@holyfamily.com` / `LAB002`
- **Default Lab Staff**: `labstaff@xyz.com` / `labstaff@123`

### 2. **Lab Manager Users** (Role: `lab_manager`)
- **Lab Manager**: `labmanager@holyfamily.com` / `LABMGR`
- **Default Lab Manager**: `labmanager@xyz.com` / `labmanager@123`

## How to Add More Lab Staff

### Method 1: Using Admin Panel
1. **Login as Admin**
2. **Go to Admin → Staff Management**
3. **Click "Add New Staff"**
4. **Fill in the form:**
   - Name: Lab Staff Name
   - Email: labstaff@holyfamily.com
   - Phone: Contact number
   - Role: Select "Lab Staff"
   - Staff ID: Will be auto-generated (LAB###)
5. **Click "Add Staff"**

### Method 2: Direct Database (For Developers)
```javascript
// Run this script in the server directory
node add-lab-staff.js
```

### Method 3: Using API (For Integration)
```javascript
POST /api/user-management/add-user
{
  "name": "New Lab Staff",
  "email": "newlabstaff@holyfamily.com",
  "password": "LabStaff@123",
  "role": "lab_staff",
  "phoneNumber": "9876543210"
}
```

## Role Hierarchy

### Lab Staff Roles
1. **`lab_staff`** - Regular lab workers
   - Can perform lab tests
   - Can update test results
   - Can view lab schedules
   - Cannot manage other staff

2. **`lab_manager`** - Lab supervisors
   - All lab_staff permissions
   - Can manage lab staff
   - Can approve test results
   - Can view lab reports
   - Can manage lab schedules

3. **`lab`** - Legacy role (being phased out)
   - Same as lab_staff
   - Will be migrated to lab_staff

## Lab Staff Features Available

### 1. **Lab Dashboard**
- View assigned tests
- Update test results
- Check lab schedule
- View lab notifications

### 2. **Test Management**
- Perform DRC tests
- Update test results
- View test history
- Generate test reports

### 3. **Attendance Management**
- Mark attendance
- View attendance history
- Request leave
- View schedule

### 4. **Lab Reports**
- Test completion reports
- Quality control reports
- Performance metrics
- Lab utilization reports

## Troubleshooting

### Issue: "No active Lab Staff found"
**Cause**: No users with role `lab_staff` exist in the database
**Solution**: 
1. Use the Admin panel to add lab staff
2. Or run the lab staff creation script
3. Or manually create users via API

### Issue: "Lab Staff cannot login"
**Cause**: User account not active or wrong credentials
**Solution**:
1. Check user status in Admin panel
2. Verify email and password
3. Reset password if needed
4. Ensure user role is `lab_staff`

### Issue: "Lab Staff cannot access lab features"
**Cause**: Insufficient permissions or wrong role
**Solution**:
1. Verify user has `lab_staff` or `lab_manager` role
2. Check user status is `active`
3. Verify lab features are enabled for the role

## Lab Staff Workflow

### Daily Workflow
1. **Login** with lab staff credentials
2. **Check Dashboard** for assigned tests
3. **Perform Tests** as assigned
4. **Update Results** in the system
5. **Mark Attendance** for the day
6. **Logout** when work is complete

### Test Assignment Workflow
1. **Manager assigns** tests to lab staff
2. **Lab staff receives** notification
3. **Lab staff performs** the test
4. **Results are updated** in the system
5. **Manager reviews** and approves results
6. **Results are published** to relevant parties

## Security Considerations

### Password Requirements
- Minimum 6 characters
- Must contain uppercase, lowercase, number, and special character
- No spaces allowed
- Must be unique

### Access Control
- Lab staff can only access lab-related features
- Lab managers have additional management permissions
- All actions are logged for audit purposes
- Session timeout for security

### Data Protection
- Test results are encrypted
- Personal information is protected
- Access logs are maintained
- Regular security audits

## Monitoring and Maintenance

### Regular Checks
1. **User Status**: Ensure all lab staff accounts are active
2. **Role Assignment**: Verify correct roles are assigned
3. **Permission Levels**: Check if permissions are appropriate
4. **Login Activity**: Monitor for unusual login patterns

### Maintenance Tasks
1. **Password Resets**: Regular password updates
2. **Account Cleanup**: Remove inactive accounts
3. **Role Updates**: Update roles as needed
4. **Permission Reviews**: Regular permission audits

## Support and Contact

### For Lab Staff Issues
- **Technical Support**: Contact system administrator
- **Account Issues**: Contact HR or manager
- **Feature Requests**: Submit through feedback system

### For Administrators
- **User Management**: Use Admin panel
- **Bulk Operations**: Use API endpoints
- **Database Issues**: Check server logs
- **Performance Issues**: Monitor system metrics

## Quick Reference

### Lab Staff Login Credentials
```
Lab Staff 1: labstaff1@holyfamily.com / LAB001
Lab Staff 2: labstaff2@holyfamily.com / LAB002
Lab Manager: labmanager@holyfamily.com / LABMGR
Default Lab Staff: labstaff@xyz.com / labstaff@123
Default Lab Manager: labmanager@xyz.com / labmanager@123
```

### Role Codes
- `lab_staff` - Regular lab workers
- `lab_manager` - Lab supervisors
- `lab` - Legacy role (use lab_staff instead)

### Status Codes
- `active` - User can login and use system
- `pending` - User needs approval
- `inactive` - User cannot login

This guide should resolve the "No active Lab Staff found" error and provide comprehensive lab staff management capabilities.
