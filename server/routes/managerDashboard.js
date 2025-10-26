const express = require('express');
const router = express.Router();
const managerDashboardController = require('../controllers/managerDashboardController');
const { protect, adminOrManager } = require('../middleware/authMiddleware');

// All routes require authentication and manager/admin role
router.use(protect);
router.use(adminOrManager);

// Dashboard overview
router.get('/overview', managerDashboardController.getDashboardOverview);

// Attendance verification
router.get('/attendance/verification', managerDashboardController.getAttendanceForVerification);
router.post('/attendance/verify', managerDashboardController.verifyAttendance);

// Rate management
router.post('/rates/update', managerDashboardController.updateLiveRate);
router.get('/rates/history', managerDashboardController.getRateHistory);

// Staff management
router.get('/staff', managerDashboardController.getAllStaff);
router.get('/staff/activity', managerDashboardController.getStaffActivity);

module.exports = router;




















