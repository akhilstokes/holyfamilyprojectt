const express = require('express');
const router = express.Router();
const { protect, adminManagerAccountant } = require('../middleware/authMiddleware');
const accountantPaymentController = require('../controllers/accountantPaymentController');

// Record payment for an invoice
router.post('/invoices/:invoiceId/payments', protect, adminManagerAccountant, accountantPaymentController.recordPayment);

// Get all payments
router.get('/payments', protect, adminManagerAccountant, accountantPaymentController.getPayments);

// Get specific payment
router.get('/payments/:paymentId', protect, adminManagerAccountant, accountantPaymentController.getPayment);

// Reconcile payment
router.put('/payments/:paymentId/reconcile', protect, adminManagerAccountant, accountantPaymentController.reconcilePayment);

module.exports = router;