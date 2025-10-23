const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/repairController');

// Open repair/lumb removal job (Lab)
router.post('/open', protect, ctrl.open);
// Append work log (Lab)
router.post('/:id/log', protect, ctrl.logProgress);
// Mark complete and set awaiting approval (Lab)
router.post('/:id/complete', protect, ctrl.complete);
// Approvals (Manager/Admin)
router.post('/:id/approve', protect, adminOrManager, ctrl.approve);
router.post('/:id/reject', protect, adminOrManager, ctrl.reject);
// List jobs
router.get('/', protect, ctrl.list);

module.exports = router;
