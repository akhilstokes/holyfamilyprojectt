# Accountant Attendance Time Windows

## ✅ Configuration Complete

### 📋 Shift Details:
```
Shift Name: Accountant Office Hours
Start Time: 08:00 (8:00 AM)
End Time: 17:00 (5:00 PM)
Duration: 9 hours
Grace Period: 15 minutes
```

### ⏰ Attendance Time Windows:

#### Check-In Window
```
🟢 Allowed Time: 8:00 AM - 8:10 AM
⏱️ Duration: 10 minutes
📱 Button: ENABLED only during this window
```

#### Check-Out Window
```
🟢 Allowed Time: 4:55 PM - 5:05 PM (16:55 - 17:05)
⏱️ Duration: 10 minutes  
📱 Button: ENABLED only during this window
```

---

## 🔧 Technical Implementation:

### Backend Validation (`attendanceController.js`)
- ✅ Checks user role === 'accountant'
- ✅ Validates check-in time: 8:00-8:10 AM
- ✅ Validates check-out time: 4:55-5:05 PM
- ✅ Returns error message if outside time window
- ✅ Shows current time vs allowed time

### Error Messages:
```javascript
// If check-in outside 8:00-8:10 AM:
{
  message: 'Check-in is only allowed between 8:00 AM and 8:10 AM',
  allowedTime: '8:00 AM - 8:10 AM',
  currentTime: 'HH:MM'
}

// If check-out outside 4:55-5:05 PM:
{
  message: 'Check-out is only allowed between 4:55 PM and 5:05 PM',
  allowedTime: '4:55 PM - 5:05 PM',
  currentTime: 'HH:MM'
}
```

---

## 📊 Attendance Rules:

### Check-In Status:
| Time | Status | Action |
|------|--------|--------|
| Before 8:00 AM | ❌ Button Disabled | "Too early" |
| 8:00 - 8:10 AM | ✅ Button Enabled | Mark as **Present** |
| After 8:10 AM | ❌ Button Disabled | "Too late" (Marked Absent) |

### Check-Out Status:
| Time | Status | Action |
|------|--------|--------|
| Before 4:55 PM | ❌ Button Disabled | "Too early" |
| 4:55 - 5:05 PM | ✅ Button Enabled | Check out allowed |
| After 5:05 PM | ❌ Button Disabled | "Too late" |

---

## 🎯 Use Cases:

### Scenario 1: On-Time Check-In
```
Time: 8:05 AM
Action: Accountant clicks "Check In"
Result: ✅ Marked as PRESENT
Status: On-time
```

### Scenario 2: Late Check-In Attempt
```
Time: 8:15 AM
Action: Accountant clicks "Check In"
Result: ❌ Error: "Check-in is only allowed between 8:00 AM and 8:10 AM"
Status: System marks as ABSENT
```

### Scenario 3: Early Check-Out Attempt
```
Time: 4:50 PM
Action: Accountant clicks "Check Out"
Result: ❌ Error: "Check-out is only allowed between 4:55 PM and 5:05 PM"
Status: Must wait until 4:55 PM
```

### Scenario 4: On-Time Check-Out
```
Time: 5:00 PM
Action: Accountant clicks "Check Out"
Result: ✅ Successfully checked out
```

---

## 🔄 How It Works:

### 1. **Check-In Process (8:00-8:10 AM)**
```
1. Accountant logs in
2. Goes to Attendance page
3. Between 8:00-8:10 AM: "Check In" button is GREEN and enabled
4. Click button → Marked as PRESENT
5. After 8:10 AM: Button becomes disabled (red/gray)
```

### 2. **Check-Out Process (4:55-5:05 PM)**
```
1. After checking in earlier
2. Goes to Attendance page
3. Between 4:55-5:05 PM: "Check Out" button is enabled
4. Click button → Successfully checked out
5. Before 4:55 or after 5:05 PM: Button is disabled
```

---

## 🛡️ Security Features:

✅ **Backend Validation**: Even if frontend is bypassed, backend enforces time windows
✅ **Role-Based**: Only applies to users with role='accountant'
✅ **Timestamp Verification**: Uses server time, not client time
✅ **Error Handling**: Clear error messages for users
✅ **Audit Trail**: All attendance actions are logged with user, role, and timestamp

---

## 📱 Frontend Display:

### Before 8:00 AM:
```
🕐 Current Time: 7:45 AM
❌ Check-in opens at 8:00 AM
⏰ Please wait until 8:00 AM
```

### During 8:00-8:10 AM:
```
🕐 Current Time: 8:05 AM
✅ CHECK IN NOW
🟢 Window closes at 8:10 AM
```

### After 8:10 AM:
```
🕐 Current Time: 8:15 AM
❌ Check-in window closed
⚠️ You will be marked absent
```

---

## 🔧 Configuration Changes:

To modify time windows, update these values in:
`server/controllers/attendanceController.js`

```javascript
// Check-in window
const checkInStart = 8 * 60;      // 8:00 AM
const checkInEnd = 8 * 60 + 10;   // 8:10 AM

// Check-out window  
const checkOutStart = 16 * 60 + 55; // 4:55 PM
const checkOutEnd = 17 * 60 + 5;    // 5:05 PM
```

---

## ✅ Testing Checklist:

- [x] Backend validates check-in time window
- [x] Backend validates check-out time window
- [x] Role-based restrictions (only accountants)
- [x] Error messages display correctly
- [x] Server time used (not client time)
- [x] Audit trail logs all actions
- [ ] Frontend displays time windows
- [ ] Frontend enables/disables buttons correctly

---

## 📞 Support:

If accountants report issues:
1. Check server logs for error messages
2. Verify accountant role in database
3. Confirm server time is correct
4. Test manually during allowed time windows

---

**Last Updated:** October 29, 2025
**Status:** ✅ Active
**Version:** 1.0

