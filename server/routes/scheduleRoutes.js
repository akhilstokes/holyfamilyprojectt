const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/scheduleController');
const scheduleChangeCtrl = require('../controllers/scheduleChangeRequestController');

// Manager routes
router.post('/manager/submit', protect, adminOrManager, ctrl.managerSubmitSchedule);

// Day overrides
router.get('/overrides', protect, adminOrManager, ctrl.getOverrides);
router.post('/overrides', protect, adminOrManager, ctrl.addOverride);
router.delete('/overrides', protect, adminOrManager, ctrl.removeOverride);

// Schedule change request management (Manager/Admin)
router.get('/change-requests', protect, adminOrManager, scheduleChangeCtrl.getAllScheduleChangeRequests);
router.get('/change-requests/pending', protect, adminOrManager, scheduleChangeCtrl.getPendingScheduleChangeRequests);
router.post('/change-requests/:id/approve', protect, adminOrManager, scheduleChangeCtrl.approveScheduleChangeRequest);
router.post('/change-requests/:id/reject', protect, adminOrManager, scheduleChangeCtrl.rejectScheduleChangeRequest);

// Admin routes
router.get('/admin/pending', protect, admin, ctrl.getPendingSchedules);
router.post('/admin/:id/approve', protect, admin, ctrl.approveSchedule);
router.post('/admin/:id/reject', protect, admin, ctrl.rejectSchedule);

// Admin/Manager schedule management
router.use(protect, adminOrManager);

router.get('/', ctrl.list);
router.get('/by-week', ctrl.getByWeek);
router.post('/', ctrl.upsert);
router.put('/:id/assignments', ctrl.updateAssignments);

module.exports = router;