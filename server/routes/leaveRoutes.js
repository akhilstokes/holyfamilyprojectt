const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const { validateLeaveApply } = require('../middleware/validationMiddleware');

// STAFF ROUTES (protected)
router.post('/apply', protect, validateLeaveApply, leaveController.applyLeave);
router.get('/my-leaves', protect, leaveController.viewMyLeaves);
router.delete('/cancel/:leaveId', protect, leaveController.cancelLeave);

// ADMIN ROUTES (admin only)
router.get('/all', protect, admin, leaveController.getAllLeaves);
router.put('/:id/status', protect, admin, leaveController.updateLeaveStatus);
router.get('/stats', protect, admin, leaveController.getLeaveStats);

// MANAGER ROUTES (admin or manager)
router.get('/pending', protect, adminOrManager, leaveController.getPendingLeaves);
router.get('/staff/:id/history', protect, adminOrManager, leaveController.getStaffHistory);
router.post('/approve/:id', protect, adminOrManager, leaveController.managerApproveLeave);
router.post('/reject/:id', protect, adminOrManager, leaveController.managerRejectLeave);
router.get('/pending-count', protect, adminOrManager, leaveController.getPendingLeavesCount);

module.exports = router;
