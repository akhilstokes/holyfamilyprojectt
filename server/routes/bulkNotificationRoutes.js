const express = require('express');
const router = express.Router();
const { protect, adminManagerAccountant } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/bulkNotificationController');

// All routes require authentication and manager/admin role
router.use(protect);
router.use(adminManagerAccountant);

// POST /api/bulk-notifications/all - Send to all staff
router.post('/all', ctrl.sendToAllStaff);

// POST /api/bulk-notifications/role - Send to specific role
router.post('/role', ctrl.sendToRole);

// POST /api/bulk-notifications/users - Send to specific users
router.post('/users', ctrl.sendToUsers);

// POST /api/bulk-notifications/attendance-reminder - Send attendance reminder
router.post('/attendance-reminder', ctrl.sendAttendanceReminder);

// GET /api/bulk-notifications/stats - Get notification statistics
router.get('/stats', ctrl.getNotificationStats);

module.exports = router;

