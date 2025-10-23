const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/damageController');

// Report damage (Lab or Field)
router.post('/', protect, ctrl.reportDamage);

// List damages
router.get('/', protect, ctrl.listDamages);

// Assign next step (Manager/Admin)
router.post('/:id/assign', protect, adminOrManager, ctrl.assignNextStep);

module.exports = router;
