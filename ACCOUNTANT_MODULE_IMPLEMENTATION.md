# 🛠️ Accountant Module – Implementation Guide

## Quick Start

This guide provides step-by-step implementation instructions for the Accountant Module with code examples.

---

## 1. Database Models Setup

### Invoice Model
**File:** `server/models/invoiceModel.js`

```javascript
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    // Basic Information
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    vendor: {
      type: String,
      required: true
    },
    invoiceDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    
    // Line Items
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      amount: Number,
      taxRate: Number,
      taxAmount: Number
    }],
    
    // Totals
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'partially_paid', 'paid'],
      default: 'pending'
    },
    
    // Payment Tracking
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentHistory: [{
      date: Date,
      amount: Number,
      method: String,
      reference: String,
      recordedBy: mongoose.Schema.Types.ObjectId
    }],
    
    // Approval
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedDate: Date,
    
    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for efficient queries
invoiceSchema.index({ vendor: 1, invoiceDate: -1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
```

### Payment Model
**File:** `server/models/paymentModel.js`

```javascript
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // Reference
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true
    },
    salaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salary'
    },
    
    // Payment Details
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'cash', 'online', 'other'],
      required: true
    },
    paymentReference: String,
    paymentDate: {
      type: Date,
      required: true
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending'
    },
    
    // Reconciliation
    reconciled: {
      type: Boolean,
      default: false
    },
    reconciledDate: Date,
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

paymentSchema.index({ invoiceId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1, reconciled: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
```

### Audit Log Model
**File:** `server/models/auditLogModel.js`

```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'salary_generated',
        'salary_approved',
        'salary_paid',
        'invoice_created',
        'invoice_approved',
        'payment_recorded',
        'payment_reconciled'
      ],
      required: true
    },
    
    // Actor Information
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorRole: String,
    
    // Target Information
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    targetType: {
      type: String,
      enum: ['salary', 'invoice', 'payment'],
      required: true
    },
    
    // Changes
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    
    // Context
    description: String,
    ipAddress: String,
    userAgent: String,
    
    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
);

auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, target: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

## 2. Controllers Implementation

### Invoice Controller
**File:** `server/controllers/invoiceController.js`

```javascript
const Invoice = require('../models/invoiceModel');
const AuditLog = require('../models/auditLogModel');
const { logAudit } = require('../services/auditService');

// Create Invoice
exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, vendor, invoiceDate, dueDate, items, subtotal, taxAmount, totalAmount } = req.body;
    
    // Validate required fields
    if (!invoiceNumber || !vendor || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check for duplicate invoice number
    const existing = await Invoice.findOne({ invoiceNumber });
    if (existing) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    
    const invoice = await Invoice.create({
      invoiceNumber,
      vendor,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      taxAmount,
      totalAmount,
      createdBy: req.user._id
    });
    
    // Log audit
    await logAudit({
      action: 'invoice_created',
      actor: req.user._id,
      actorRole: req.user.role,
      target: invoice._id,
      targetType: 'invoice',
      description: `Invoice ${invoiceNumber} created for ${vendor}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Approve Invoice
exports.approveInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    if (invoice.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending invoices can be approved' });
    }
    
    const before = invoice.toObject();
    
    invoice.status = 'approved';
    invoice.approvedBy = req.user._id;
    invoice.approvedDate = new Date();
    invoice.updatedBy = req.user._id;
    
    await invoice.save();
    
    // Log audit
    await logAudit({
      action: 'invoice_approved',
      actor: req.user._id,
      actorRole: req.user.role,
      target: invoice._id,
      targetType: 'invoice',
      changes: { before, after: invoice.toObject() },
      description: `Invoice ${invoice.invoiceNumber} approved`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({
      message: 'Invoice approved successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error approving invoice:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Record Payment
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
    
    const before = invoice.toObject();
    
    // Update payment tracking
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
    
    res.json({
      message: 'Payment recorded successfully',
      data: {
        invoiceId: invoice._id,
        amountPaid: invoice.amountPaid,
        remainingAmount: invoice.totalAmount - invoice.amountPaid,
        status: invoice.status
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Invoice Details
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await Invoice.findById(invoiceId)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('paymentHistory.recordedBy', 'name email');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json({ data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get All Invoices with Filters
exports.getInvoices = async (req, res) => {
  try {
    const { status, vendor, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (vendor) filter.vendor = new RegExp(vendor, 'i');
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const invoices = await Invoice.find(filter)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
    
    const total = await Invoice.countDocuments(filter);
    
    res.json({
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
```

---

## 3. Routes Setup

### Invoice Routes
**File:** `server/routes/invoiceRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');
const invoiceController = require('../controllers/invoiceController');

// Create invoice (Accountant can create)
router.post('/', protect, adminManagerAccountant, invoiceController.createInvoice);

// Get all invoices
router.get('/', protect, invoiceController.getInvoices);

// Get specific invoice
router.get('/:invoiceId', protect, invoiceController.getInvoice);

// Approve invoice (Manager/Admin only)
router.put('/:invoiceId/approve', protect, adminOrManager, invoiceController.approveInvoice);

// Record payment
router.post('/:invoiceId/payment', protect, adminManagerAccountant, invoiceController.recordPayment);

module.exports = router;
```

---

## 4. Audit Service

**File:** `server/services/auditService.js`

```javascript
const AuditLog = require('../models/auditLogModel');

exports.logAudit = async (auditData) => {
  try {
    await AuditLog.create({
      action: auditData.action,
      actor: auditData.actor,
      actorRole: auditData.actorRole,
      target: auditData.target,
      targetType: auditData.targetType,
      changes: auditData.changes,
      description: auditData.description,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging audit:', error);
    // Don't throw - audit logging should not break main operation
  }
};

exports.getAuditLogs = async (filter = {}, options = {}) => {
  try {
    const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('actor', 'name email role');
    
    const total = await AuditLog.countDocuments(filter);
    
    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};
```

---

## 5. Salary Enhancement

### Enhanced Salary Controller
**File:** `server/controllers/salaryController.js` (additions)

```javascript
// Enhanced salary generation with audit
exports.generateMonthlySalary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month, overtimeHours = 0 } = req.body;
    
    // Fetch salary template
    const template = await SalaryTemplate.findOne({ staff: staffId });
    if (!template) {
      return res.status(404).json({ message: 'Salary template not found' });
    }
    
    // Calculate salary
    const basicSalary = template.basicSalary;
    const allowances = {
      hra: template.houseRentAllowance || 0,
      medical: template.medicalAllowance || 0,
      transport: template.transportAllowance || 0,
      special: template.specialAllowance || 0
    };
    
    const overtimePay = overtimeHours * (basicSalary / 30 / 8);
    const grossSalary = basicSalary + Object.values(allowances).reduce((a, b) => a + b, 0) + overtimePay;
    
    // Calculate deductions
    const incomeTax = Math.round(grossSalary * 0.10);
    const pf = Math.round(grossSalary * 0.12);
    const esi = Math.round(grossSalary * 0.0475);
    const totalDeductions = incomeTax + pf + esi;
    
    const netSalary = grossSalary - totalDeductions;
    
    // Create salary record
    const salary = await Salary.create({
      staff: staffId,
      year,
      month,
      basicSalary,
      houseRentAllowance: allowances.hra,
      medicalAllowance: allowances.medical,
      transportAllowance: allowances.transport,
      specialAllowance: allowances.special,
      overtimeHours,
      overtimeRate: basicSalary / 30 / 8,
      incomeTax,
      providentFund: pf,
      employeeStateInsurance: esi,
      grossSalary,
      totalDeductions,
      netSalary,
      status: 'pending',
      createdBy: req.user._id
    });
    
    // Log audit
    await logAudit({
      action: 'salary_generated',
      actor: req.user._id,
      actorRole: req.user.role,
      target: salary._id,
      targetType: 'salary',
      description: `Salary generated for staff ${staffId} - ${month}/${year}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json({
      message: 'Salary generated successfully',
      data: salary
    });
  } catch (error) {
    console.error('Error generating salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
```

---

## 6. Testing Examples

### Unit Tests
**File:** `server/__tests__/unit/invoiceController.test.js`

```javascript
const request = require('supertest');
const app = require('../../server');
const Invoice = require('../../models/invoiceModel');
const User = require('../../models/userModel');

describe('Invoice Controller', () => {
  let token;
  let accountantUser;
  
  beforeAll(async () => {
    // Create test user
    accountantUser = await User.create({
      name: 'Test Accountant',
      email: 'accountant@test.com',
      password: 'hashed_password',
      role: 'accountant',
      status: 'active'
    });
    
    token = generateToken(accountantUser._id);
  });
  
  test('Should create invoice', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceNumber: 'INV001',
        vendor: 'Supplier A',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            description: 'Product A',
            quantity: 10,
            unitPrice: 1000,
            amount: 10000,
            taxRate: 18,
            taxAmount: 1800
          }
        ],
        subtotal: 10000,
        taxAmount: 1800,
        totalAmount: 11800
      });
    
    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('pending');
  });
  
  test('Should approve invoice', async () => {
    const invoice = await Invoice.create({
      invoiceNumber: 'INV002',
      vendor: 'Supplier B',
      invoiceDate: new Date(),
      dueDate: new Date(),
      totalAmount: 5000,
      status: 'pending',
      createdBy: accountantUser._id
    });
    
    const response = await request(app)
      .put(`/api/invoices/${invoice._id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({});
    
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('approved');
  });
});
```

---

## 7. Integration with Server

### Add to server.js
```javascript
// Add invoice routes
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Add audit log routes (optional)
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
```

---

## 8. Environment Configuration

### .env additions
```
# Accountant Module
INVOICE_PREFIX=INV
PAYMENT_METHODS=bank_transfer,cheque,cash,online
TAX_RATE_DEFAULT=18
AUDIT_LOG_RETENTION_DAYS=365
```

---

## 9. Deployment Checklist

- [ ] Create all models (Invoice, Payment, AuditLog)
- [ ] Create all controllers
- [ ] Create all routes
- [ ] Create audit service
- [ ] Add middleware permissions
- [ ] Run database migrations
- [ ] Create indexes
- [ ] Test all endpoints
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor logs

---

## 10. Common Issues & Solutions

### Issue: Invoice number duplication
**Solution:** Add unique index on invoiceNumber field
```javascript
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
```

### Issue: Slow payment history queries
**Solution:** Add compound index
```javascript
invoiceSchema.index({ status: 1, amountPaid: 1 });
```

### Issue: Audit logs growing too large
**Solution:** Implement archival strategy
```javascript
// Archive logs older than 1 year
db.auditlogs.deleteMany({ timestamp: { $lt: new Date(Date.now() - 365*24*60*60*1000) } })
```

---

**Last Updated:** December 10, 2024  
**Version:** 1.0  
**Status:** Ready for Implementation
