const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard overview
router.get('/overview', adminDashboardController.getDashboardOverview);

// Staff invitation management
router.get('/invitations', adminDashboardController.getStaffInvitations);

// User management
router.get('/users', adminDashboardController.getAllUsers);
router.put('/users/:userId/status', adminDashboardController.updateUserStatus);
router.put('/users/:userId/role', adminDashboardController.updateUserRole);

// Reports and analytics
router.get('/reports/attendance', adminDashboardController.getAttendanceReports);
router.get('/reports/activity', adminDashboardController.getActivityLogs);
router.get('/reports/stats', adminDashboardController.getSystemStats);

// Rate approval
router.post('/rates/:rateId/approve', adminDashboardController.approveRateUpdate);

module.exports = router;























