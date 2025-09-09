const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

// STAFF ROUTES (protected)
router.post('/apply', protect, leaveController.applyLeave);
router.get('/my-leaves', protect, leaveController.viewMyLeaves);
router.delete('/cancel/:leaveId', protect, leaveController.cancelLeave);

// ADMIN ROUTES (admin only)
router.get('/all', protect, admin, leaveController.getAllLeaves);
router.put('/:id/status', protect, admin, leaveController.updateLeaveStatus);
router.get('/stats', protect, admin, leaveController.getLeaveStats);

module.exports = router;
