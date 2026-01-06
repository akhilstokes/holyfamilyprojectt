# Leave History API Structure

## API Endpoint
`GET /api/leave/history`

## Expected Response Structure

```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "staffName": "John Doe",
      "staff": {
        "name": "John Doe",
        "email": "john.doe@company.com",
        "department": "Production"
      },
      "leaveType": "sick",
      "dayType": "full",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-16T00:00:00.000Z",
      "reason": "Fever and flu symptoms",
      "status": "approved",
      "createdAt": "2024-01-10T08:30:00.000Z",
      "processedAt": "2024-01-11T10:15:00.000Z",
      "processedBy": "Manager Name"
    },
    {
      "_id": "64a1b2c3d4e5f6789012346",
      "staffName": "Jane Smith",
      "staff": {
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "department": "Quality Control"
      },
      "leaveType": "casual",
      "dayType": "half",
      "startDate": "2024-01-20T00:00:00.000Z",
      "endDate": "2024-01-20T00:00:00.000Z",
      "reason": "Personal appointment",
      "status": "rejected",
      "createdAt": "2024-01-18T14:20:00.000Z",
      "processedAt": "2024-01-19T09:45:00.000Z",
      "processedBy": "Manager Name",
      "rejectionReason": "Insufficient notice period"
    }
  ]
}
```

## Leave Types
- `sick` - Sick Leave
- `casual` - Casual Leave
- `annual` - Annual Leave
- `emergency` - Emergency Leave
- `maternity` - Maternity Leave
- `paternity` - Paternity Leave

## Day Types
- `full` - Full Day
- `half` - Half Day

## Status Types
- `pending` - Awaiting approval
- `approved` - Approved by manager
- `rejected` - Rejected by manager

## Required Fields
- `_id` - Unique identifier
- `staffName` - Name of staff member
- `leaveType` - Type of leave
- `dayType` - Full or half day
- `startDate` - Leave start date
- `endDate` - Leave end date
- `status` - Current status
- `createdAt` - Application date

## Optional Fields
- `reason` - Reason for leave
- `processedAt` - Date when processed
- `processedBy` - Manager who processed
- `rejectionReason` - Reason for rejection (if rejected)