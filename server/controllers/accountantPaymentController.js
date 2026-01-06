const AccountantPayment = require('../models/accountantPaymentModel');
const Invoice = require('../models/invoiceModel');
const { logAudit } = require('../services/auditService');

// Record Payment for an Invoice
exports.recordPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { amount, paymentMethod, paymentReference, paymentDate } = req.body;
    
    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Create payment record
    const payment = await AccountantPayment.create({
      invoiceId: invoice._id,
      amount,
      paymentMethod,
      paymentReference,
      paymentDate: paymentDate || new Date(),
      status: 'completed',
      createdBy: req.user._id
    });
    
    // Update invoice payment tracking
    const before = invoice.toObject();
    
    invoice.paymentHistory.push({
      date: paymentDate || new Date(),
      amount,
      method: paymentMethod,
      reference: paymentReference,
      recordedBy: req.user._id
    });
    
    invoice.amountPaid += amount;
    
    // Update status
    if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'partially_paid';
    }
    
    invoice.updatedBy = req.user._id;
    await invoice.save();
    
    // Log audit
    await logAudit({
      action: 'payment_recorded',
      actor: req.user._id,
      actorRole: req.user.role,
      target: invoice._id,
      targetType: 'invoice',
      changes: { before, after: invoice.toObject() },
      description: `Payment of ₹${amount} recorded for invoice ${invoice.invoiceNumber}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      message: 'Payment recorded successfully',
      data: {
        payment,
        invoiceStatus: invoice.status,
        amountPaid: invoice.amountPaid,
        remainingAmount: invoice.totalAmount - invoice.amountPaid
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Payment Details
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await AccountantPayment.findById(paymentId)
      .populate('invoiceId', 'invoiceNumber vendor totalAmount')
      .populate('createdBy', 'name email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({ data: payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get All Payments with Filters
exports.getPayments = async (req, res) => {
  try {
    const { startDate, endDate, status, invoiceId, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    if (invoiceId) filter.invoiceId = invoiceId;
    
    const skip = (page - 1) * limit;
    
    const payments = await AccountantPayment.find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('invoiceId', 'invoiceNumber vendor totalAmount')
      .populate('createdBy', 'name email');
    
    const total = await AccountantPayment.countDocuments(filter);
    
    res.json({
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Reconcile Payment
exports.reconcilePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await AccountantPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.reconciled) {
      return res.status(400).json({ message: 'Payment already reconciled' });
    }
    
    payment.reconciled = true;
    payment.reconciledDate = new Date();
    payment.reconciledBy = req.user._id;
    
    await payment.save();
    
    // Log audit
    await logAudit({
      action: 'payment_reconciled',
      actor: req.user._id,
      actorRole: req.user.role,
      target: payment._id,
      targetType: 'payment',
      description: `Payment reconciled - Amount: ₹${payment.amount}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      message: 'Payment reconciled successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error reconciling payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};