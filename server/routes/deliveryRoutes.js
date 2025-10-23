const express = require('express');
const router = express.Router();
const { protect, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/deliveryController');
const historyCtrl = require('../controllers/deliveryHistoryController');
const { rateLimiter } = require('../middleware/enhancedAuth');

// Apply generous rate limiting for admin endpoints (300 requests per minute)
const adminRateLimiter = rateLimiter(60 * 1000, 300);

// Create task (admin or manager)
router.post('/', protect, adminOrManager, ctrl.createTask);
// List all tasks (admin/manager)
router.get('/', protect, adminOrManager, ctrl.listAllTasks);

// Live location endpoints
router.post('/location', protect, ctrl.updateMyLocation); // delivery staff updates own location
router.get('/locations', protect, adminOrManager, ctrl.listStaffLocations); // managers/admins list staff locations

// Get single task (admin/manager)
router.get('/:id', protect, adminOrManager, ctrl.getTask);
// Update task fields (admin/manager)
router.put('/:id', protect, adminOrManager, ctrl.updateTask);
// Delete task (admin/manager)
router.delete('/:id', protect, adminOrManager, ctrl.deleteTask);

// List my tasks (delivery staff) or filter by status (admin/manager)
router.get('/my', protect, ctrl.listMyTasks);

// Update status (assigned delivery staff or admin)
router.put('/:id/status', protect, ctrl.updateStatus);

// Task History endpoints (delivery staff)
router.get('/task-history', protect, historyCtrl.getTaskHistory); // Get task history with filter
router.get('/task-history/:taskId', protect, historyCtrl.getTaskHistoryDetail); // Get detailed task history

// Intake endpoints
router.post('/barrels/intake', protect, ctrl.intakeBarrels); // delivery staff
router.get('/barrels/intake', protect, adminManagerAccountant, adminRateLimiter, ctrl.listIntakes); // accountant/manager/admin
router.get('/barrels/intake/my', protect, ctrl.listMyIntakes); // current user
router.put('/barrels/intake/:id/verify', protect, adminOrManager, ctrl.verifyIntake); // manager verify
router.put('/barrels/intake/:id/approve', protect, adminManagerAccountant, ctrl.approveIntake);
router.get('/barrels/intake/:id', protect, adminManagerAccountant, ctrl.getIntake);
router.put('/barrels/intake/:id', protect, adminManagerAccountant, ctrl.updateIntake);
router.delete('/barrels/intake/:id', protect, adminManagerAccountant, ctrl.deleteIntake);

// Allowance endpoints
router.get('/barrels/allowance/my', protect, ctrl.getMySellAllowance);
router.put('/barrels/allowance/:userId', protect, adminOrManager, ctrl.setUserSellAllowance);

module.exports = router;
