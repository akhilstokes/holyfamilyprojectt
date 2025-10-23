# Leave History Modal - Simple Usage Guide

## Overview
The **LeaveHistoryModal** is a simple, lightweight modal component that displays leave history for staff members. It's designed to be easy to use and integrate anywhere in your application.

## Features
✅ Simple and clean UI  
✅ Easy to integrate with just 3 lines of code  
✅ Auto-loads leave history when opened  
✅ Supports both staff (own history) and manager (staff history) views  
✅ Refresh button to reload data  
✅ Responsive design  
✅ Built-in error handling  

## Basic Usage

### 1. Import the Modal
```javascript
import LeaveHistoryModal from '../../components/common/LeaveHistoryModal';
```

### 2. Add State to Control Modal
```javascript
const [showHistoryModal, setShowHistoryModal] = useState(false);
```

### 3. Add Button to Open Modal
```javascript
<button 
  className="btn btn-outline-primary"
  onClick={() => setShowHistoryModal(true)}
>
  📋 View Leave History
</button>
```

### 4. Add Modal Component
```javascript
<LeaveHistoryModal 
  isOpen={showHistoryModal} 
  onClose={() => setShowHistoryModal(false)} 
/>
```

## Complete Example

```javascript
import React, { useState } from 'react';
import LeaveHistoryModal from '../../components/common/LeaveHistoryModal';

const MyComponent = () => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <div>
      <h2>My Page</h2>
      
      {/* Open Modal Button */}
      <button 
        className="btn btn-outline-primary"
        onClick={() => setShowHistoryModal(true)}
      >
        📋 View Leave History
      </button>

      {/* Modal Component */}
      <LeaveHistoryModal 
        isOpen={showHistoryModal} 
        onClose={() => setShowHistoryModal(false)} 
      />
    </div>
  );
};

export default MyComponent;
```

## Advanced Usage (For Managers)

If you want to view a specific staff member's leave history (for managers/admins):

```javascript
<LeaveHistoryModal 
  isOpen={showHistoryModal} 
  onClose={() => setShowHistoryModal(false)} 
  staffId={selectedStaffId}  // Pass staff ID to view their history
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | - | Controls modal visibility |
| `onClose` | function | Yes | - | Callback when modal closes |
| `staffId` | string | No | null | Staff ID to view history for (managers only) |

## Integration Examples

### Staff Leave Page
```javascript
// Already integrated in:
// - client/src/pages/staff/StaffLeave.js
// - client/src/pages/delivery/DeliveryLeave.js
// - client/src/pages/lab/LabLeave.js
// - client/src/pages/accountant/AccountantLeave.js
```

### Manager Dashboard
```javascript
// Can be added to any manager page to view staff history
const [selectedStaff, setSelectedStaff] = useState(null);
const [showHistoryModal, setShowHistoryModal] = useState(false);

// In your staff list table
<button onClick={() => {
  setSelectedStaff(staff._id);
  setShowHistoryModal(true);
}}>
  View History
</button>

// Modal
<LeaveHistoryModal 
  isOpen={showHistoryModal} 
  onClose={() => {
    setShowHistoryModal(false);
    setSelectedStaff(null);
  }} 
  staffId={selectedStaff}
/>
```

## API Endpoints Used

- **Own history**: `GET /api/leave/my-leaves`
- **Staff history** (managers): `GET /api/leave/staff/:staffId/history`

## Styling

The modal uses inline styles and Bootstrap classes for consistency with the rest of the application. No additional CSS files needed.

## Benefits Over Full Component

| Feature | LeaveHistoryModal | LeaveHistory Component |
|---------|-------------------|------------------------|
| Lines of Code | ~200 | ~360 |
| Integration Complexity | Simple (3 lines) | Complex (full section) |
| UI Space | Modal (overlay) | Full page section |
| Filters | No (simple view) | Yes (complex filters) |
| Use Case | Quick history view | Detailed analysis |

## When to Use

✅ Use **LeaveHistoryModal** when:
- You want a quick view of leave history
- Space is limited on the page
- User just needs to check their past leaves
- Simple is better

❌ Use **LeaveHistory Component** when:
- You need advanced filtering
- You want detailed statistics
- Leave history is the main focus of the page
- Users need to export or analyze data

---

**Created**: 2025-10-23  
**Component Location**: `client/src/components/common/LeaveHistoryModal.js`
