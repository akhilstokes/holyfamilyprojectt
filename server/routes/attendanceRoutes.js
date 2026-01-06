const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

router.get('/', protect, adminOrManager, attendanceController.getAttendance);
router.get('/:id', protect, adminOrManager, attendanceController.getAttendanceById);
router.post('/', protect, adminOrManager, attendanceController.createAttendance);
router.put('/:id', protect, adminOrManager, attendanceController.updateAttendance);
router.put('/:id/verify', protect, adminOrManager, attendanceController.verifyAttendance);
router.delete('/:id', protect, admin, attendanceController.deleteAttendance);
router.get('/staff/:staffId', protect, adminOrManager, attendanceController.getStaffAttendance);

module.exports = router;
