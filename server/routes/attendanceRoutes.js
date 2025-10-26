const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, admin, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');

// Staff routes (all authenticated users can mark attendance and view their own)
router.get('/shift', protect, attendanceController.getUserShift);
router.get('/today', protect, attendanceController.getTodayAttendance);
router.post('/mark', protect, attendanceController.markAttendance);
router.get('/history', protect, attendanceController.getAttendanceHistory);

// Manager/Admin/Accountant routes
router.get('/all', protect, adminManagerAccountant, attendanceController.getAllAttendance);
router.get('/today-all', protect, adminManagerAccountant, attendanceController.getTodayAttendanceAll);
router.get('/analytics', protect, adminManagerAccountant, attendanceController.getAttendanceAnalytics);
router.get('/summary/week', protect, adminManagerAccountant, attendanceController.getWeeklySummary);
router.post('/:id/approve', protect, adminManagerAccountant, attendanceController.approveAttendance);
// Admin/Manager/Accountant explicit mark
router.post('/admin/mark', protect, adminManagerAccountant, attendanceController.adminMarkAttendance);

module.exports = router;



