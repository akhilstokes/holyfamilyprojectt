const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { validateWorkerProfileUpdate, validateHealthInfoUpdate } = require('../middleware/validationMiddleware');
const ctrl = require('../controllers/workerController');

// Field staff endpoints (protected but not admin-only)
router.get('/me', protect, ctrl.getSelfWorker);
router.put('/me', protect, validateWorkerProfileUpdate, ctrl.updateSelfWorker);
router.post('/me/documents', protect, ctrl.addSelfDocument);
router.delete('/me/documents/:idx', protect, ctrl.removeSelfDocument);
router.get('/me/salary-history', protect, ctrl.getSelfSalaryHistory);
router.get('/me/salary-summary', protect, ctrl.getMonthlySummary);
router.post('/field/barrels', protect, ctrl.addBarrelEntry);
router.get('/field/barrels', protect, ctrl.listBarrelEntries);
router.post('/field/trips', protect, ctrl.addTripLog);
router.get('/field/trips', protect, ctrl.listTripLogs);
router.get('/field/today', protect, ctrl.getTodaySnapshot);
router.post('/field/route/start', protect, ctrl.startRoute);
router.post('/field/route/complete', protect, ctrl.completeRoute);

// Attendance self-service
router.post('/field/attendance/check-in', protect, ctrl.checkIn);
router.post('/field/attendance/check-out', protect, ctrl.checkOut);
router.get('/field/attendance/history', protect, ctrl.getAttendanceHistory);

// Staff dashboard minimal
router.get('/field/dashboard', protect, ctrl.staffDashboard);

// Staff shift schedule
router.get('/field/shift-schedule', protect, ctrl.getMyShiftSchedule);


// Admin attendance override and monthly summary for a staff
router.post('/attendance/admin-mark', ctrl.adminMarkAttendance);
router.get('/attendance', protect, admin, ctrl.listAttendance);
router.post('/:staffId/payroll', protect, admin, ctrl.recordPayrollEntry);
router.get('/:staffId/payroll', protect, admin, ctrl.listPayrollEntries);
router.get('/me/payroll', protect, ctrl.listMyPayrollEntries);
router.get('/:staffId/salary-summary', ctrl.getMonthlySummary);

module.exports = router;


