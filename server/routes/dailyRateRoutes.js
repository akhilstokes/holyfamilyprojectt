// server/routes/dailyRateRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dailyRateController');

// Manager
router.post('/manager/submit', protect, adminOrManager, ctrl.managerSubmitRate);

// Admin
router.post('/', protect, admin, ctrl.addOrUpdate);
router.put('/:id', protect, admin, ctrl.updateById);
router.get('/admin/pending', protect, admin, ctrl.getPendingRateUpdates);
router.post('/admin/:id/approve', protect, admin, ctrl.approveRateUpdate);
router.post('/admin/:id/reject', protect, admin, ctrl.rejectRateUpdate);
router.get('/history', protect, admin, ctrl.getHistory);
router.get('/export/csv', protect, admin, ctrl.exportCsv);
router.get('/export/pdf', protect, admin, ctrl.exportPdf);

// Public/User
router.get('/latest', ctrl.getLatest);
// Optional: allow non-admin history view for users
router.get('/public-history', ctrl.getHistory);

module.exports = router;