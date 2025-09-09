const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  adminListOrders,
  adminUpdateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/orderController');

// Buyer routes
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/:id/pay/razorpay', protect, createRazorpayOrder);
router.post('/:id/pay/razorpay/verify', protect, verifyRazorpayPayment);

// Admin routes
router.get('/', protect, admin, adminListOrders);
router.put('/:id/status', protect, admin, adminUpdateOrderStatus);

module.exports = router;