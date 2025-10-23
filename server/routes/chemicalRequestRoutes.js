const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chemicalRequestController');
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/enhancedAuth');

// Apply generous rate limiting for admin endpoints (300 requests per minute)
const adminRateLimiter = rateLimiter(60 * 1000, 300);

// Lab
router.post('/', protect, ctrl.create);
router.get('/my', protect, ctrl.my);
router.get('/catalog', protect, ctrl.catalog);

// Manager
router.get('/manager/pending', protect, adminOrManager, ctrl.managerPending);
router.put('/:id/verify', protect, adminOrManager, ctrl.verify);
router.put('/:id/reject', protect, adminOrManager, ctrl.reject);
router.put('/:id/purchase', protect, adminOrManager, ctrl.purchase);

// Admin
router.get('/admin/verified', protect, adminOrManager, ctrl.adminVerified);
router.put('/:id/send-for-purchase', protect, adminOrManager, ctrl.sendForPurchase);
router.put('/:id/complete', protect, adminOrManager, ctrl.complete);
router.get('/admin/history', protect, adminOrManager, ctrl.history);

module.exports = router;
