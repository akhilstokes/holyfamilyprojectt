# Schedule API Endpoints - Fixed

## Issues Fixed

### 1. ❌ Error: GET `/api/schedules/overrides` → 404
**Problem**: Frontend was trying to GET overrides but only POST and DELETE endpoints existed.

**Solution**: Added new GET endpoint to retrieve overrides.

```javascript
// GET /api/schedules/overrides?weekStart=YYYY-MM-DD&group=field|lab|delivery
exports.getOverrides = async (req, res) => {
  // Returns: { overrides: [] }
}
```

### 2. ❌ Error: GET `/api/schedules?group=field:1` → 400
**Problem**: Frontend was sending malformed group parameter like `group=field:1` instead of `group=field`.

**Solution**: Added parameter cleaning to handle malformed values.

```javascript
// Clean up group parameter (handle "field:1" or similar malformed values)
if (group && typeof group === 'string') {
  group = group.split(':')[0].trim().toLowerCase();
}
```

### 3. ❌ Error: GET `/api/schedules/by-week?weekStart=2025-10-25&group=field:1` → 404
**Problem**: 
- Malformed group parameter
- Returning 404 when schedule doesn't exist (should return empty structure)

**Solution**: 
- Clean group parameter
- Return default empty schedule structure instead of 404

```javascript
// Return empty structure if not found instead of 404
if (!doc) {
  return res.json({
    weekStart: normalizeWeekStart(weekStart),
    group,
    assignments: [],
    overrides: [],
    morningStart: '09:00',
    morningEnd: '17:00',
    eveningStart: '18:00',
    eveningEnd: '22:00'
  });
}
```

## Updated Endpoints

### ✅ GET `/api/schedules` 
Retrieve schedules with optional filters.

**Query Parameters**:
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)
- `group` (optional): field | lab | delivery (defaults to 'field')

**Example**:
```
GET /api/schedules?from=2025-10-01&to=2025-10-31&group=field
GET /api/schedules?group=delivery
```

**Response**:
```json
[
  {
    "_id": "...",
    "weekStart": "2025-10-25T00:00:00.000Z",
    "group": "field",
    "morningStart": "09:00",
    "morningEnd": "17:00",
    "eveningStart": "18:00",
    "eveningEnd": "22:00",
    "assignments": [...],
    "overrides": [...]
  }
]
```

### ✅ GET `/api/schedules/by-week`
Get schedule for a specific week.

**Query Parameters**:
- `weekStart` (required): Week start date (YYYY-MM-DD)
- `group` (optional): field | lab | delivery (defaults to 'field')

**Example**:
```
GET /api/schedules/by-week?weekStart=2025-10-25&group=field
```

**Response** (if found):
```json
{
  "_id": "...",
  "weekStart": "2025-10-25T00:00:00.000Z",
  "group": "field",
  "morningStart": "09:00",
  "morningEnd": "17:00",
  "eveningStart": "18:00",
  "eveningEnd": "22:00",
  "assignments": [
    {
      "staff": "user_id",
      "shiftType": "morning"
    }
  ],
  "overrides": []
}
```

**Response** (if not found - no longer returns 404):
```json
{
  "weekStart": "2025-10-25T00:00:00.000Z",
  "group": "field",
  "assignments": [],
  "overrides": [],
  "morningStart": "09:00",
  "morningEnd": "17:00",
  "eveningStart": "18:00",
  "eveningEnd": "22:00"
}
```

### ✅ NEW: GET `/api/schedules/overrides`
Get schedule overrides for a specific week.

**Query Parameters**:
- `weekStart` (required): Week start date (YYYY-MM-DD)
- `group` (optional): field | lab | delivery (defaults to 'field')

**Example**:
```
GET /api/schedules/overrides?weekStart=2025-10-25&group=field
```

**Response**:
```json
{
  "overrides": [
    {
      "date": "2025-10-26T00:00:00.000Z",
      "staff": "user_id",
      "shiftType": "evening"
    }
  ]
}
```

### ✅ POST `/api/schedules/overrides`
Add a schedule override.

**Body**:
```json
{
  "weekStart": "2025-10-25",
  "group": "field",
  "date": "2025-10-26",
  "staff": "user_id",
  "shiftType": "morning"
}
```

**Response**:
```json
{
  "overrides": [...]
}
```

### ✅ DELETE `/api/schedules/overrides`
Remove a schedule override.

**Body**:
```json
{
  "weekStart": "2025-10-25",
  "group": "field",
  "date": "2025-10-26",
  "staff": "user_id"
}
```

**Response**:
```json
{
  "removed": 1,
  "overrides": [...]
}
```

## Group Parameter Handling

The `group` parameter now intelligently handles malformed values:

### Valid Formats
- `group=field` ✅
- `group=lab` ✅
- `group=delivery` ✅

### Auto-Corrected Formats
- `group=field:1` → Automatically cleaned to `field` ✅
- `group=Field` → Normalized to `field` ✅
- `group=DELIVERY:123` → Cleaned to `delivery` ✅

### Invalid Values
- `group=invalid` → Defaults to `field`
- `group=` → Defaults to `field`
- Missing parameter → Defaults to `field`

## Parameter Validation

### Supported Groups
```javascript
const validGroups = ['field', 'lab', 'delivery'];
```

### Date Normalization
All dates are normalized to local midnight (00:00:00):
```javascript
function normalizeWeekStart(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
```

## Authentication & Authorization

All schedule endpoints require authentication and proper roles:

### Protected Routes
```javascript
router.use(protect, adminOrManager);
```

**Allowed Roles**:
- Admin
- Manager

**Not Allowed**:
- Staff (delivery, lab, field)
- Regular users
- Accountant

## Error Responses

### 400 Bad Request
```json
{
  "message": "weekStart required"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin or manager"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message here"
}
```

## Changes Summary

### Files Modified
1. **`server/controllers/scheduleController.js`**
   - Added `getOverrides()` function
   - Updated `list()` to clean group parameter
   - Updated `getByWeek()` to clean parameter & return empty structure
   - Updated `getOverrides()` with parameter cleaning

2. **`server/routes/scheduleRoutes.js`**
   - Added GET route for `/overrides`

### Improvements
✅ No more 404 errors for overrides endpoint  
✅ No more 400 errors for malformed group parameters  
✅ No more 404 errors when schedule doesn't exist  
✅ Better error handling and validation  
✅ More flexible parameter parsing  
✅ Consistent API responses  

## Testing

Test all fixed endpoints:

```bash
# Test GET schedules with malformed group
curl "http://localhost:5000/api/schedules?group=field:1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test GET by-week with malformed group
curl "http://localhost:5000/api/schedules/by-week?weekStart=2025-10-25&group=delivery:1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test GET overrides (new endpoint)
curl "http://localhost:5000/api/schedules/overrides?weekStart=2025-10-25&group=field" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test GET overrides with malformed group
curl "http://localhost:5000/api/schedules/overrides?weekStart=2025-10-25&group=lab:123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Usage

Frontend can now safely call these endpoints without errors:

```javascript
// Get schedules
const schedules = await fetch('/api/schedules?group=field');

// Get by week (no longer throws 404 if not found)
const weekSchedule = await fetch('/api/schedules/by-week?weekStart=2025-10-25&group=field');

// Get overrides (new endpoint)
const overrides = await fetch('/api/schedules/overrides?weekStart=2025-10-25&group=field');

// All malformed group parameters are auto-corrected
const schedules = await fetch('/api/schedules?group=field:1'); // Works now!
```

---

**Date Fixed**: October 28, 2025  
**Status**: ✅ All schedule API errors resolved  
**Endpoints Fixed**: 4  
**New Endpoints Added**: 1 (GET /overrides)







