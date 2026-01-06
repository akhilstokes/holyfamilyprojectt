# 🚀 Notification System - Quick Start Guide

## ⚡ 3-Minute Setup

### **Step 1: Start Server** (if not running)
```bash
cd holy-family-polymers/server
npm run dev
```

### **Step 2: Access Application**
```
http://localhost:5000
```

---

## 👥 FOR STAFF

### **How to See Your Notifications:**

#### 1️⃣ Login
```
http://localhost:5000
Email: your-email@example.com
Password: your-password
```

#### 2️⃣ Look at Top-Right Corner
```
🔔 Bell Icon (with red badge showing unread count)
```

#### 3️⃣ Click Bell Icon
```
→ See all your notifications
→ Click "Mark Read" to clear
→ Click "Open" to navigate to related page
```

### **What Notifications You'll Get:**

#### ✅ **Attendance:**
- "You checked in at 8:05 AM - On time!"
- "You checked in at 8:15 AM - 15 minutes late"
- "You checked out at 5:00 PM. Have a great day!"

#### 💰 **Salary:**
- "Your salary has been credited"
- "Advance payment processed"

#### 📋 **Announcements:**
- Office closures
- Meeting notices
- Important updates

---

## 👔 FOR MANAGERS

### **How to Send Notifications:**

#### 1️⃣ Login as Manager
```
http://localhost:5000
Login with manager credentials
```

#### 2️⃣ Navigate to Notifications
```
Sidebar → 📢 Send Notifications
OR
Direct: http://localhost:5000/manager/notifications
```

#### 3️⃣ Quick Action - Attendance Reminder
```
1. Select Role: Accountant, Lab Staff, Field Worker, etc.
2. Click "📤 Send Reminder"
✅ Done! All selected role members notified
```

#### 4️⃣ Custom Notification
```
1. Select Target: All Staff or Specific Role
2. Enter Title: "Important Announcement"
3. Enter Message: "Office closed tomorrow"
4. (Optional) Add Link: "/staff/dashboard"
5. Click "📤 Send Notification"
✅ Done!
```

---

## 🎯 Common Use Cases

### **Use Case 1: Send Office Closure Notice**
```
Manager Dashboard → 📢 Send Notifications

Target: All Staff
Title: ⚠️ Office Closed Tomorrow
Message: Office will be closed tomorrow due to public holiday
Link: (leave empty)

Click Send → All staff notified instantly!
```

---

### **Use Case 2: Remind Accountants About Attendance**
```
Manager Dashboard → 📢 Send Notifications → Quick Actions

Select Role: Accountant
Click "📤 Send Reminder"

✅ All accountants get: "⏰ Don't forget to mark your attendance today!"
```

---

### **Use Case 3: Meeting Notice for Lab Staff**
```
Manager Dashboard → 📢 Send Notifications

Target: Specific Role → Lab Staff
Title: 📅 Team Meeting Tomorrow
Message: Lab team meeting tomorrow at 10 AM. Please be on time!
Link: (leave empty)

Click Send → All lab staff notified!
```

---

## 📊 Check Notification Statistics

```
Manager Dashboard → 📢 Send Notifications

Statistics shown at top:
┌─────────────┬─────────┬──────────┬───────────┐
│ Total Sent  │  Read   │  Unread  │ Read Rate │
│     245     │   198   │    47    │   80.8%   │
└─────────────┴─────────┴──────────┴───────────┘
```

---

## 💡 Pro Tips

### **Use Templates:**
Click example cards at bottom to auto-fill form:
- 🏢 Office Closure
- 📊 Report Reminder
- 📅 Meeting Notice

### **Target Efficiently:**
- Use "All Staff" for company-wide announcements
- Use specific roles for targeted messages
- Use attendance reminders for quick check-in prompts

### **Keep Messages Clear:**
- Use emojis for visual appeal
- Keep titles under 100 characters
- Keep messages under 500 characters
- Add links for related actions

---

## 🔍 Troubleshooting

### **Notifications not showing?**
```
1. Hard refresh: Ctrl + Shift + R
2. Clear cache and reload
3. Check you're logged in
4. Verify server is running
```

### **Can't send bulk notifications?**
```
1. Verify you're logged in as Manager/Admin
2. Fill all required fields (Title, Message)
3. Check at least 1 user exists for target role
```

### **Server not running?**
```bash
cd holy-family-polymers/server
npm run dev

# If port 5000 in use:
taskkill /F /IM node.exe
npm run dev
```

---

## 🎉 You're All Set!

### **Staff:** Check your notifications via 🔔 bell icon
### **Managers:** Send notifications at `/manager/notifications`

**Enjoy the notification system! 🚀**

