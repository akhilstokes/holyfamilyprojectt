const mongoose = require('mongoose');

const accountantAuditLogSchema = new mongoose.Schema(
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

accountantAuditLogSchema.index({ actor: 1, timestamp: -1 });
accountantAuditLogSchema.index({ targetType: 1, target: 1 });

module.exports = mongoose.model('AccountantAuditLog', accountantAuditLogSchema);
