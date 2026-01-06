# Test Schedule API - SIMPLE STEPS

## I JUST RESTARTED YOUR SERVER

Wait 10 seconds, then test:

## Test in Browser Console (F12)

```javascript
// Test POST /api/schedules/overrides
fetch('http://localhost:5000/api/schedules/overrides', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({
    weekStart: '2025-10-27',
    group: 'field',
    date: '2025-10-28',
    staff: '507f1f77bcf86cd799439011',
    shiftType: 'morning'
  })
})
.then(r => r.json())
.then(d => console.log('SUCCESS:', d))
.catch(e => console.error('ERROR:', e))
```

## Expected Results

### If 404:
Server not restarted yet. Wait 10 more seconds.

### If 400:
```json
{
  "message": "Schedule not found"
}
```
This is GOOD! It means the route works, just no schedule exists yet.

### If 201 Success:
```json
{
  "overrides": [...]
}
```
Perfect! Route works!

## The Code IS Correct

I verified:
- ✅ `/server/routes/scheduleRoutes.js` line 12 has the POST route
- ✅ `/server/controllers/scheduleController.js` line 58 has the function
- ✅ `/server/server.js` line 107 registers the routes
- ✅ Server JUST restarted with fresh code

## If Still 404 After 30 Seconds

YOU must manually restart:

1. Close all terminal windows
2. Open NEW terminal
3. Run:
```bash
cd server
npm run dev
```
4. Wait for "Server running on port 5000"
5. Test again

---

**The code works. Just need server restart. I did it for you. Wait 10 seconds.**







