const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const {
  sendSalaryNotification,
  sendBulkSalaryNotifications,
  getSalaryNotifications,
  markSalaryNotificationRead
} = require('../controllers/salaryNotificationController');

// All routes require authentication
router.use(protect);
// Note: Rate limiting temporarily disabled to prevent 429 errors during development
// router.use(notificationRateLimiter);

// POST /api/salary-notifications/send - Send salary notification to single staff
router.post('/send', adminOrManager, sendSalaryNotification);

// POST /api/salary-notifications/send-bulk - Send salary notifications to multiple staff
router.post('/send-bulk', adminOrManager, sendBulkSalaryNotifications);

// GET /api/salary-notifications - Get salary notifications for current user
router.get('/', getSalaryNotifications);

// PUT /api/salary-notifications/:id/read - Mark notification as read
router.put('/:id/read', markSalaryNotificationRead);

module.exports = router;
