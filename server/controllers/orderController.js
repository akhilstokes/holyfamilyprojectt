const Order = require('../models/orderModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Init Razorpay instance if keys present
const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
const razorpayInstance = hasRazorpayKeys
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

exports.createOrder = async (req, res) => {
  try {
    const { items, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    const totalAmount = items.reduce((sum, it) => sum + (it.subtotal || 0), 0);

    const order = await Order.create({
      buyer: req.user._id,
      items,
      totalAmount,
      notes: notes || '',
      paymentStatus: 'not_initiated',
      paymentProvider: 'none'
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create Razorpay order for an existing order (amount in paise)
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({ success: false, message: 'Razorpay not configured' });
    }
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const rpOrder = await razorpayInstance.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: `order_${order._id}`,
      notes: { orderId: String(order._id) }
    });

    order.paymentProvider = 'razorpay';
    order.paymentStatus = 'created';
    order.razorpayOrderId = rpOrder.id;
    await order.save();

    res.json({ success: true, key: process.env.RAZORPAY_KEY_ID, rpOrderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, buyer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');

    if (expected !== razorpay_signature) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Signature mismatch' });
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminListOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};