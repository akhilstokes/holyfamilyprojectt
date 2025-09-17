const mongoose = require('mongoose');

const wageHistorySchema = new mongoose.Schema(
  {
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true, index: true },
    
    // Change details
    changeType: { 
      type: String, 
      enum: ['wage_type_change', 'salary_adjustment', 'promotion', 'demotion', 'bonus', 'deduction', 'benefit_change'], 
      required: true 
    },
    
    // Previous values
    previousValues: {
      wageType: String,
      dailyWage: Number,
      monthlySalary: Number,
      hourlyRate: Number,
      wageCategory: String,
      benefits: mongoose.Schema.Types.Mixed
    },
    
    // New values
    newValues: {
      wageType: String,
      dailyWage: Number,
      monthlySalary: Number,
      hourlyRate: Number,
      wageCategory: String,
      benefits: mongoose.Schema.Types.Mixed
    },
    
    // Change details
    effectiveDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true },
    amount: { type: Number, default: 0 }, // for salary adjustments
    percentage: { type: Number, default: 0 }, // for percentage-based changes
    
    // Approval workflow
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    
    // Metadata
    notes: { type: String, default: '' },
    attachments: [{ 
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Indexes
wageHistorySchema.index({ worker: 1, effectiveDate: -1 });
wageHistorySchema.index({ changeType: 1, status: 1 });
wageHistorySchema.index({ effectiveDate: 1, status: 1 });

module.exports = mongoose.model('WageHistory', wageHistorySchema);




