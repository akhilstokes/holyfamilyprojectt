# FIX Schedule 404 Error - Step by Step

## The Problem
You're getting: `404 (Not Found)` on `/api/schedules/overrides`

## The Solution (3 Simple Steps)

### Step 1: Stop ALL Servers
Open Terminal/Command Prompt and run:
```bash
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
killall node
```

### Step 2: Start Backend Server
```bash
cd server
npm run dev
```

**Wait for this message:**
```
MongoDB Connected
Server running on port 5000
```

### Step 3: Start Frontend
Open a NEW terminal:
```bash
cd client
npm start
```

### Step 4: Test
Go to browser and hard refresh:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## If Still Getting 404

The route IS in the code. Check:

1. **File: `server/routes/scheduleRoutes.js` Line 11:**
```javascript
router.get('/overrides', protect, adminOrManager, ctrl.getOverrides);
```

2. **File: `server/controllers/scheduleController.js` Line 40:**
```javascript
exports.getOverrides = async (req, res) => {
  // ... function exists
}
```

3. **File: `server/server.js` Line 107:**
```javascript
app.use('/api/schedules', require('./routes/scheduleRoutes'));
```

## Manual Verification

Test the endpoint directly:

### Using Browser Console:
```javascript
fetch('http://localhost:5000/api/schedules/overrides?weekStart=2025-10-25&group=field', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Using curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/schedules/overrides?weekStart=2025-10-25&group=field"
```

## What Should Happen

**Success Response:**
```json
{
  "overrides": []
}
```

**If 404:**
- Server didn't restart
- Wrong port (check if server is on 5000)
- Routes not loaded

## Nuclear Option (If Nothing Works)

1. Delete `node_modules` in server:
```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

2. Check server logs for errors

3. Verify server is actually running:
```bash
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000
```

---

**The code is 100% correct. The issue is the server needs to restart to load the changes.**







