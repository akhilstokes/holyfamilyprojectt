const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// Manager/Admin routes
router.post('/', protect, adminOrManager, shiftController.createShift);
router.get('/', protect, adminOrManager, shiftController.getAllShifts);
router.get('/staff', protect, adminOrManager, shiftController.getStaffForAssignment);
router.get('/stats', protect, adminOrManager, shiftController.getShiftStatistics);
router.get('/:id', protect, adminOrManager, shiftController.getShift);
router.put('/:id', protect, adminOrManager, shiftController.updateShift);
router.delete('/:id', protect, admin, shiftController.deleteShift);
router.post('/assign', protect, adminOrManager, shiftController.assignStaffToShift);
router.post('/remove-staff', protect, adminOrManager, shiftController.removeStaffFromShift);

module.exports = router;






