const mongoose = require('mongoose');

const accountantPaymentSchema = new mongoose.Schema(
  {
    // Reference
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: false // Optional for backward compatibility
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
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

accountantPaymentSchema.index({ invoiceId: 1, paymentDate: -1 });
accountantPaymentSchema.index({ status: 1, reconciled: 1 });
accountantPaymentSchema.index({ branch: 1, paymentDate: -1 });

module.exports = mongoose.model('AccountantPayment', accountantPaymentSchema);
