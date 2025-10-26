# Role-Based API Matrix

## Overview
This document maps user roles to their available API endpoints and capabilities in the Holy Family Polymers system.

## User Roles
- **Admin**: Full system control and final approvals
- **Manager**: Review and first-level approvals, monitoring
- **Staff/Field Staff**: Self-service operations and data submission
- **Customer/User**: View rates and submit requests

---

## 🔴 Admin (Full Power)

### User Management
- `GET /api/user-management/stats` - System overview dashboard
- `GET /api/user-management/` - List all users with filtering
- `GET /api/user-management/activity-logs` - User activity logs
- `POST /api/user-management/add` - Add new users
- `PUT /api/user-management/:id/status` - Update user status
- `PUT /api/user-management/:id/role` - Update user role
- `DELETE /api/user-management/:id` - Delete users
- `POST /api/user-management/bulk-actions` - Bulk user operations

### Bill Management (Final Approval)
- `GET /api/bills/admin` - All bill requests
- `GET /api/bills/admin/:id` - Specific bill details
- `POST /api/bills/admin/:id/approve` - Final approve bill
- `POST /api/bills/admin/:id/reject` - Final reject bill
- `PUT /api/bills/admin/:id` - Update bill request
- `GET /api/bills/admin/reports/generate` - Generate reports

### Live Rate Management (Final Approval)
- `POST /api/daily-rates/` - Add/update rates directly
- `PUT /api/daily-rates/:id` - Update rate by ID
- `GET /api/daily-rates/admin/pending` - Pending rate updates
- `POST /api/daily-rates/admin/:id/approve` - Approve rate update
- `POST /api/daily-rates/admin/:id/reject` - Reject rate update
- `GET /api/daily-rates/history` - Rate history
- `GET /api/daily-rates/export/csv` - Export CSV
- `GET /api/daily-rates/export/pdf` - Export PDF

### Attendance Management
- `GET /api/workers/attendance` - All attendance records
- `POST /api/workers/attendance/admin-mark` - Override attendance
- `POST /api/workers/attendance/verify` - Verify attendance
- `GET /api/workers/attendance/verification` - Attendance for verification
- `POST /api/workers/attendance/bulk-verify` - Bulk verify attendance

### Leave Management (Final Control)
- `GET /api/leaves/all` - All leave requests
- `PUT /api/leaves/:id/status` - Update leave status
- `GET /api/leaves/stats` - Leave statistics

### Stock Management (Final Control)
- `PUT /api/stock/` - Update stock levels
- `GET /api/stock/item/:name` - Get specific item
- `PUT /api/stock/item/:name` - Update specific item

### Barrel Management (Final Approval)
- `POST /api/barrel-logistics/approve/purchase` - Approve barrel purchase
- `POST /api/barrel-logistics/approve/disposal` - Approve barrel disposal

### Latex Requests (Final Control)
- `GET /api/latex/admin/requests` - All latex requests
- `PUT /api/latex/admin/requests/:id` - Update latex request

---

## 🟡 Manager (Review & First-Level Approval)

### Bill Management (First-Level Review)
- `GET /api/bills/manager/pending` - Pending bill requests
- `POST /api/bills/manager/:id/approve` - Approve bill (first level)
- `POST /api/bills/manager/:id/reject` - Reject bill (first level)

### Live Rate Management (Submit for Approval)
- `POST /api/daily-rates/manager/submit` - Submit rate update for admin approval

### Attendance Management (Verification)
- `GET /api/workers/attendance/verification` - Attendance for verification
- `POST /api/workers/attendance/verify` - Verify attendance
- `POST /api/workers/attendance/bulk-verify` - Bulk verify attendance
- `GET /api/workers/attendance/stats` - Attendance statistics
- `GET /api/workers/attendance/summary/today` - Today's summary
- `GET /api/workers/attendance/summary/week` - Week's summary

### Leave Management (First-Level Review)
- `GET /api/leaves/pending` - Pending leave requests
- `POST /api/leaves/approve/:id` - Approve leave (first level)
- `POST /api/leaves/reject/:id` - Reject leave (first level)
- `GET /api/leaves/pending-count` - Pending count

### Stock Management (Monitoring & CRUD)
- `GET /api/stock/summary` - Stock summary
- `GET /api/stock/items` - List stock items
- `POST /api/stock/items` - Create stock item
- `PUT /api/stock/items/:id` - Update stock item
- `DELETE /api/stock/items/:id` - Delete stock item

### Latex Requests (Review)
- `GET /api/latex/admin/requests` - All latex requests
- `PUT /api/latex/admin/requests/:id` - Update latex request

---

## 🟢 Staff/Field Staff (Self-Service)

### Attendance (GPS-Based)
- `POST /api/workers/field/attendance/check-in` - Check in with GPS
- `POST /api/workers/field/attendance/check-out` - Check out with GPS
- `GET /api/workers/field/attendance/history` - Personal attendance history

### Bill Requests (Submit)
- `POST /api/bills/submit` - Submit bill request
- `GET /api/bills/staff` - Personal bill requests
- `GET /api/bills/staff/:id` - Specific bill details

### Field Operations
- `GET /api/workers/field/dashboard` - Staff dashboard
- `GET /api/workers/field/shift-schedule` - Personal shift schedule
- `POST /api/workers/field/barrels` - Add barrel entry
- `GET /api/workers/field/barrels` - List barrel entries
- `POST /api/workers/field/trips` - Add trip log
- `GET /api/workers/field/trips` - List trip logs
- `GET /api/workers/field/today` - Today's snapshot

### Profile Management
- `GET /api/workers/me` - Personal profile
- `PUT /api/workers/me` - Update profile
- `POST /api/workers/me/documents` - Add documents
- `DELETE /api/workers/me/documents/:idx` - Remove documents
- `GET /api/workers/me/salary-history` - Salary history
- `GET /api/workers/me/salary-summary` - Monthly summary

### Leave Requests (Submit)
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-leaves` - Personal leave requests
- `DELETE /api/leaves/cancel/:leaveId` - Cancel leave

### Live Rate (View Approved)
- `GET /api/daily-rates/latest` - Latest approved rate

---

## 🔵 Customer/User (View & Submit)

### Live Rate (View Approved)
- `GET /api/daily-rates/latest` - Latest approved rate
- `GET /api/daily-rates/public-history` - Rate history

### Latex Sell Requests
- `POST /api/latex/submit-request` - Submit sell request
- `GET /api/latex/requests` - Personal requests
- `GET /api/latex/requests/:id` - Specific request details
- `GET /api/latex/receipt/:id` - Generate receipt

---

## 🔄 Approval Flows

### Bill Request Flow
1. **Staff** → `POST /api/bills/submit` (Submit)
2. **Manager** → `POST /api/bills/manager/:id/approve` (First approval)
3. **Admin** → `POST /api/bills/admin/:id/approve` (Final approval)

### Live Rate Flow
1. **Manager** → `POST /api/daily-rates/manager/submit` (Submit for approval)
2. **Admin** → `POST /api/daily-rates/admin/:id/approve` (Approve)
3. **Staff/Customers** → `GET /api/daily-rates/latest` (View approved rate)

### Leave Request Flow
1. **Staff** → `POST /api/leaves/apply` (Submit)
2. **Manager** → `POST /api/leaves/approve/:id` (First approval)
3. **Admin** → `PUT /api/leaves/:id/status` (Final control)

### Attendance Flow
1. **Staff** → `POST /api/workers/field/attendance/check-in` (GPS check-in)
2. **Manager** → `POST /api/workers/attendance/verify` (Verify)
3. **Admin** → `GET /api/workers/attendance` (View all history)

---

## 🛡️ Security Notes

- All routes require authentication (`protect` middleware)
- Role-based access control enforced via middleware
- Admin routes: `admin` middleware
- Manager routes: `adminOrManager` middleware
- Staff routes: `protect` middleware (role checked in controller)
- Public routes: No authentication required

## 📊 Dashboard Endpoints

### Admin Dashboard
- `GET /api/user-management/stats` - System overview
- `GET /api/leaves/stats` - Leave statistics
- `GET /api/workers/attendance/stats` - Attendance statistics

### Manager Dashboard
- `GET /api/leaves/pending-count` - Pending leave count
- `GET /api/workers/attendance/summary/today` - Today's attendance
- `GET /api/stock/summary` - Stock overview

### Staff Dashboard
- `GET /api/workers/field/dashboard` - Personal dashboard
- `GET /api/workers/field/today` - Today's tasks























