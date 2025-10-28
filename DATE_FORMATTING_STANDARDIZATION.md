# Date Formatting Standardization

## Overview
This document outlines the standardization of date formatting across the Holy Family Polymers application to ensure consistency and maintainability.

## Centralized Date Utility

### Location
`client/src/utils/dateUtils.js`

### Available Functions

#### 1. `formatDateTime(dateInput, options)`
- **Purpose**: Format date and time with consistent format: DD/MM/YYYY, HH:MM:SS AM/PM
- **Usage**: For summary cards and detailed timestamps
- **Example**: `27/10/2025, 9:31:51 pm`

#### 2. `formatDate(dateInput)`
- **Purpose**: Format date only: DD/MM/YYYY
- **Usage**: For date-only displays
- **Example**: `27/10/2025`

#### 3. `formatTime(dateInput)`
- **Purpose**: Format time only: HH:MM:SS AM/PM
- **Usage**: For time-only displays
- **Example**: `9:31:51 pm`

#### 4. `formatTableDateTime(dateInput)`
- **Purpose**: Format date for display in tables: DD/MM/YYYY, HH:MM AM/PM
- **Usage**: For table columns (shorter format)
- **Example**: `27/10/2025, 9:31 pm`

#### 5. `formatFileNameDateTime(dateInput)`
- **Purpose**: Format date for file names: YYYY-MM-DD_HH-MM-SS
- **Usage**: For generating file names
- **Example**: `2025-10-27_21-31-51`

#### 6. `getRelativeTime(dateInput)`
- **Purpose**: Get relative time (e.g., "2 hours ago", "3 days ago")
- **Usage**: For user-friendly time displays
- **Example**: `2 hours ago`

#### 7. `isToday(dateInput)` / `isYesterday(dateInput)`
- **Purpose**: Check if date is today or yesterday
- **Usage**: For conditional formatting
- **Returns**: Boolean

## Updated Components

### 1. Yard Stock (`pages/admin/YardStock.js`)
- **Summary Card**: Uses `formatDateTime()` for the "Updated" field
- **Table**: Uses `formatTableDateTime()` for the "Updated At" column

### 2. Manager Stock (`pages/manager/ManagerStock.js`)
- **Summary Cards**: Uses `formatDateTime()` for both "Updated At" fields
- **Table**: Uses `formatTableDateTime()` for the "Updated" column

### 3. Stock History (`components/common/StockHistory.js`)
- **Table**: Uses `formatTableDateTime()` for date columns
- **Replaced**: Custom `formatDate()` function with centralized utility

### 4. Stock Transaction Form (`components/common/StockTransactionForm.js`)
- **Current Stock Info**: Uses `formatDateTime()` for "Last updated" display

### 5. Leave History (`components/common/LeaveHistory.js`)
- **Table**: Uses `formatDate()` and `formatTableDateTime()` for date columns
- **Replaced**: Custom date formatting functions with centralized utilities

### 6. Accountant Latex Verify (`pages/accountant/AccountantLatexVerify.js`)
- **Table**: Uses `formatTableDateTime()` for timestamp columns

## Benefits

### 1. **Consistency**
- All date/time displays follow the same format across the application
- DD/MM/YYYY format for dates
- 12-hour time format with AM/PM

### 2. **Maintainability**
- Single source of truth for date formatting logic
- Easy to update formatting rules globally
- Reduced code duplication

### 3. **Error Handling**
- Centralized error handling for invalid dates
- Consistent fallback to '-' for invalid dates
- Console logging for debugging

### 4. **Flexibility**
- Multiple formatting options for different use cases
- Configurable options for specific needs
- Easy to add new formatting functions

### 5. **Performance**
- Reusable functions reduce bundle size
- Consistent behavior across components

## Usage Examples

```javascript
import { formatDateTime, formatTableDateTime, formatDate } from '../../utils/dateUtils';

// For summary cards
<div>{formatDateTime(data.updatedAt)}</div>

// For table columns
<td>{formatTableDateTime(item.updatedAt)}</td>

// For date-only displays
<span>{formatDate(leave.startDate)}</span>
```

## Migration Notes

### Before
```javascript
// Inconsistent formatting across components
{new Date(data.updatedAt).toLocaleString()}
{new Date(data.updatedAt).toLocaleDateString('en-GB', {...})}
{data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'}
```

### After
```javascript
// Consistent formatting using centralized utilities
{formatDateTime(data.updatedAt)}
{formatTableDateTime(data.updatedAt)}
{formatDate(data.updatedAt)}
```

## Future Enhancements

1. **Timezone Support**: Add timezone-aware formatting
2. **Localization**: Support for different locale formats
3. **Custom Formats**: Allow custom format strings
4. **Date Validation**: Enhanced date validation and parsing
5. **Relative Time**: More sophisticated relative time calculations

## Testing

All date formatting functions include:
- Input validation
- Error handling
- Fallback values
- Console logging for debugging

The utilities are designed to be robust and handle edge cases gracefully.
