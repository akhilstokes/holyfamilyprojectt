const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
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

// Field staff endpoints (protected but not admin-only)
router.get('/me', protect, ctrl.getSelfWorker);
router.put('/me', protect, validateWorkerProfileUpdate, ctrl.updateSelfWorker);
router.post('/me/documents', protect, ctrl.addSelfDocument);
router.delete('/me/documents/:idx', protect, ctrl.removeSelfDocument);
router.get('/me/salary-history', protect, ctrl.getSelfSalaryHistory);
router.get('/me/salary-summary', protect, ctrl.getMonthlySummary);
router.post('/field/barrels', protect, validateBarrelEntry, ctrl.addBarrelEntry);
router.get('/field/barrels', protect, ctrl.listBarrelEntries);
router.post('/field/trips', protect, validateTripLog, ctrl.addTripLog);
router.get('/field/trips', protect, ctrl.listTripLogs);
router.get('/field/today', protect, ctrl.getTodaySnapshot);
router.post('/field/route/start', protect, ctrl.startRoute);
router.post('/field/route/complete', protect, ctrl.completeRoute);

// Attendance self-service
router.post('/field/attendance/check-in', protect, ctrl.checkIn);
router.post('/field/attendance/check-out', protect, ctrl.checkOut);
router.get('/field/attendance/history', protect, ctrl.getAttendanceHistory);

// Lab: today's snapshot and attendance self-service
router.get('/lab/today', protect, ctrl.getTodaySnapshot);
router.get('/lab/attendance/history', protect, ctrl.getAttendanceHistory);
router.post('/lab/attendance/check-in', protect, ctrl.checkInLab);
router.post('/lab/attendance/check-out', protect, ctrl.checkOutLab);

// Staff dashboard minimal
router.get('/field/dashboard', protect, ctrl.staffDashboard);

// Staff shift schedule
router.get('/field/shift-schedule', protect, ctrl.getMyShiftSchedule);
router.get('/lab/shift-schedule', protect, ctrl.getMyLabShiftSchedule);

// Schedule change requests
router.post('/schedule-change-requests', protect, scheduleChangeCtrl.createScheduleChangeRequest);
router.get('/schedule-change-requests', protect, scheduleChangeCtrl.getMyScheduleChangeRequests);
router.put('/schedule-change-requests/:id', protect, scheduleChangeCtrl.updateScheduleChangeRequest);
router.delete('/schedule-change-requests/:id', protect, scheduleChangeCtrl.deleteScheduleChangeRequest);


// Admin/Manager attendance override and list
router.post('/attendance/admin-mark', protect, adminOrManager, ctrl.adminMarkAttendance);
router.get('/attendance', protect, adminOrManager, ctrl.listAttendance);
// Attendance verification (manager/admin)
router.post('/attendance/verify', protect, adminOrManager, ctrl.verifyAttendance);
// Manager attendance verification endpoints
router.get('/attendance/verification', protect, adminOrManager, ctrl.getAttendanceForVerification);
router.post('/attendance/bulk-verify', protect, adminOrManager, ctrl.bulkVerifyAttendance);
router.get('/attendance/stats', protect, adminOrManager, ctrl.getAttendanceStats);
// Attendance summaries for manager/admin dashboards
router.get('/attendance/summary/today', protect, adminOrManager, ctrl.getTodayAttendanceSummary);
router.get('/attendance/summary/week', protect, adminOrManager, ctrl.getWeekAttendanceSummary);
router.post('/:staffId/payroll', protect, admin, ctrl.recordPayrollEntry);
router.get('/:staffId/payroll', protect, admin, ctrl.listPayrollEntries);
router.get('/me/payroll', protect, ctrl.listMyPayrollEntries);
router.get('/:staffId/salary-summary', ctrl.getMonthlySummary);

module.exports = router;


