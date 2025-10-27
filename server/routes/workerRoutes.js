const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/enhancedAuth');
const { 
  validateWorkerProfileUpdate, 
  validateHealthInfoUpdate, 
  validateStaffCheckIn, 
  validateStaffCheckOut, 
  validateTripLog,
  validateBarrelEntry
} = require('../middleware/validationMiddleware');
const ctrl = require('../controllers/workerController');
const scheduleChangeCtrl = require('../controllers/scheduleChangeRequestController');

// Rate limiters for different endpoint groups
const staffRateLimiter = rateLimiter(60 * 1000, 200); // 200 requests per minute for staff
const adminRateLimiter = rateLimiter(60 * 1000, 300); // 300 requests per minute for admin/manager

// Field staff endpoints (protected but not admin-only) - Higher rate limit for dashboard polling
router.get('/me', protect, staffRateLimiter, ctrl.getSelfWorker);
router.put('/me', protect, staffRateLimiter, validateWorkerProfileUpdate, ctrl.updateSelfWorker);
router.post('/me/documents', protect, staffRateLimiter, ctrl.addSelfDocument);
router.delete('/me/documents/:idx', protect, staffRateLimiter, ctrl.removeSelfDocument);
router.get('/me/salary-history', protect, staffRateLimiter, ctrl.getSelfSalaryHistory);
router.get('/me/salary-summary', protect, staffRateLimiter, ctrl.getMonthlySummary);
router.post('/field/barrels', protect, staffRateLimiter, validateBarrelEntry, ctrl.addBarrelEntry);
router.get('/field/barrels', protect, staffRateLimiter, ctrl.listBarrelEntries);
router.post('/field/trips', protect, staffRateLimiter, validateTripLog, ctrl.addTripLog);
router.get('/field/trips', protect, staffRateLimiter, ctrl.listTripLogs);
router.get('/field/today', protect, staffRateLimiter, ctrl.getTodaySnapshot);
router.post('/field/route/start', protect, staffRateLimiter, ctrl.startRoute);
router.post('/field/route/complete', protect, staffRateLimiter, ctrl.completeRoute);

// Attendance self-service
router.post('/field/attendance/check-in', protect, staffRateLimiter, ctrl.checkIn);
router.post('/field/attendance/check-out', protect, staffRateLimiter, ctrl.checkOut);
router.get('/field/attendance/history', protect, staffRateLimiter, ctrl.getAttendanceHistory);

// Lab: today's snapshot and attendance self-service
router.get('/lab/today', protect, staffRateLimiter, ctrl.getTodaySnapshot);
router.get('/lab/attendance/history', protect, staffRateLimiter, ctrl.getAttendanceHistory);
router.post('/lab/attendance/check-in', protect, staffRateLimiter, ctrl.checkInLab);
router.post('/lab/attendance/check-out', protect, staffRateLimiter, ctrl.checkOutLab);

// Staff dashboard minimal - High rate limit for frequent polling
router.get('/field/dashboard', protect, staffRateLimiter, ctrl.staffDashboard);

// Staff shift schedule - High rate limit for frequent polling
router.get('/field/shift-schedule', protect, staffRateLimiter, ctrl.getMyShiftSchedule);
router.get('/lab/shift-schedule', protect, staffRateLimiter, ctrl.getMyLabShiftSchedule);

// Schedule change requests
router.post('/schedule-change-requests', protect, staffRateLimiter, scheduleChangeCtrl.createScheduleChangeRequest);
router.get('/schedule-change-requests', protect, staffRateLimiter, scheduleChangeCtrl.getMyScheduleChangeRequests);
router.put('/schedule-change-requests/:id', protect, staffRateLimiter, scheduleChangeCtrl.updateScheduleChangeRequest);
router.delete('/schedule-change-requests/:id', protect, staffRateLimiter, scheduleChangeCtrl.deleteScheduleChangeRequest);


// Admin/Manager attendance override and list - Higher rate limit for dashboard polling
router.post('/attendance/admin-mark', protect, adminOrManager, adminRateLimiter, ctrl.adminMarkAttendance);
router.get('/attendance', protect, adminOrManager, adminRateLimiter, ctrl.listAttendance);
// Attendance verification (manager/admin)
router.post('/attendance/verify', protect, adminOrManager, adminRateLimiter, ctrl.verifyAttendance);
// Manager attendance verification endpoints
router.get('/attendance/verification', protect, adminOrManager, adminRateLimiter, ctrl.getAttendanceForVerification);
router.post('/attendance/bulk-verify', protect, adminOrManager, adminRateLimiter, ctrl.bulkVerifyAttendance);
router.get('/attendance/stats', protect, adminOrManager, adminRateLimiter, ctrl.getAttendanceStats);
// Attendance summaries for manager/admin dashboards
router.get('/attendance/summary/today', protect, adminOrManager, adminRateLimiter, ctrl.getTodayAttendanceSummary);
router.get('/attendance/summary/week', protect, adminOrManager, adminRateLimiter, ctrl.getWeekAttendanceSummary);
router.post('/:staffId/payroll', protect, admin, adminRateLimiter, ctrl.recordPayrollEntry);
router.get('/:staffId/payroll', protect, admin, adminRateLimiter, ctrl.listPayrollEntries);
router.get('/me/payroll', protect, staffRateLimiter, ctrl.listMyPayrollEntries);
router.get('/:staffId/salary-summary', protect, staffRateLimiter, ctrl.getMonthlySummary);

module.exports = router;


