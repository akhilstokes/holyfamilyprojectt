// server/routes/dailyRateRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/dailyRateController');

// Admin
router.post('/', protect, admin, ctrl.addOrUpdate);
router.put('/:id', protect, admin, ctrl.updateById);
router.get('/history', protect, admin, ctrl.getHistory);
router.get('/export/csv', protect, admin, ctrl.exportCsv);
router.get('/export/pdf', protect, admin, ctrl.exportPdf);

// Public/User
router.get('/latest', ctrl.getLatest);
// Optional: allow non-admin history view for users
router.get('/public-history', ctrl.getHistory);

module.exports = router;