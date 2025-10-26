const express = require('express');
const router = express.Router();
const staffDashboardController = require('../controllers/staffDashboardController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Dashboard overview
router.get('/overview', staffDashboardController.getDashboardOverview);

// Attendance management
router.post('/attendance/mark', staffDashboardController.markAttendance);
router.get('/attendance/history', staffDashboardController.getAttendanceHistory);

// Salary information
router.get('/salary/history', staffDashboardController.getSalaryHistory);

// Shift management
router.get('/shifts', staffDashboardController.getAssignedShifts);

// Document management
router.post('/documents/upload', staffDashboardController.uploadDocument);

// Profile management
router.get('/profile', staffDashboardController.getProfile);
router.put('/profile', staffDashboardController.updateProfile);

module.exports = router;




















