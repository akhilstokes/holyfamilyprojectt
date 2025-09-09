const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/barrelMovementController');

// Movements
router.post('/movement', protect, ctrl.createMovement);
router.get('/movement/:barrelId', protect, ctrl.getMovements);

// Approvals (admin)
router.post('/approve/purchase', protect, admin, ctrl.approvePurchase);
router.post('/approve/disposal', protect, admin, ctrl.approveDisposal);
router.post('/request/disposal', protect, ctrl.requestDisposal);

module.exports = router;