const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sellRequestController');
const { protect, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/enhancedAuth');

// Apply generous rate limiting for admin endpoints (300 requests per minute)
const adminRateLimiter = rateLimiter(60 * 1000, 300);

// Farmer
router.post('/', protect, ctrl.createSellRequest);
router.get('/my', protect, ctrl.listMySellRequests);

// Admin/Manager/Accountant - with generous rate limiting
router.get('/admin/all', protect, adminManagerAccountant, adminRateLimiter, ctrl.listAllSellRequests);

// Lab
router.get('/lab/pending', protect, ctrl.listLabPendingSellRequests);
router.put('/:id/submit-for-accounts', protect, ctrl.submitForAccounts);

// Manager
router.put('/:id/assign-field', protect, adminOrManager, ctrl.assignFieldStaff);
router.put('/:id/assign-delivery', protect, adminOrManager, ctrl.assignDeliveryStaff);

// Field staff
router.put('/:id/collect', protect, ctrl.markCollected);

// Delivery staff
router.get('/delivery/my-assigned', protect, ctrl.listAssignedForDelivery);
router.put('/:id/deliver-to-lab', protect, ctrl.markDeliveredToLab);

// Lab
router.put('/:id/drc-test', protect, ctrl.recordDrcTest);

// Accountant
router.put('/:id/calculate', protect, adminManagerAccountant, ctrl.accountantCalculate);

// Manager verify
router.put('/:id/verify', protect, adminOrManager, ctrl.managerVerify);

// Invoice
router.get('/:id/invoice', protect, ctrl.getInvoice);

module.exports = router;
