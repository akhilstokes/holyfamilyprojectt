const mongoose = require('mongoose');

const salarySummarySchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', index: true }, // link to worker record
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },

    // Wage type and structure
    wageType: { type: String, enum: ['daily', 'monthly', 'contract', 'piece_rate'], default: 'daily' },
    wageCategory: { type: String, enum: ['unskilled', 'semi_skilled', 'skilled', 'supervisor', 'manager'] },

    // Working time tracking
    workingDays: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    pieceWorkUnits: { type: Number, default: 0 }, // for piece rate workers

    // Base wage rates
    dailyWage: { type: Number, default: 0 },
    monthlySalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    pieceRate: { type: Number, default: 0 },

    // Calculated amounts
    baseSalary: { type: Number, default: 0 }, // base calculation before adjustments
    overtimePay: { type: Number, default: 0 },
    pieceWorkPay: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },

    // Benefits and allowances
    benefits: {
      providentFund: { type: Number, default: 0 },
      healthInsurance: { type: Number, default: 0 },
      transportAllowance: { type: Number, default: 0 },
      foodAllowance: { type: Number, default: 0 },
      housingAllowance: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 }
    },
    totalBenefits: { type: Number, default: 0 },

    // Performance incentives
    attendanceBonus: { type: Number, default: 0 },
    productivityBonus: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    totalBonuses: { type: Number, default: 0 },

    // Deductions
    deductionAmount: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    providentFundDeduction: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },

    // Final calculations
    netSalary: { type: Number, default: 0 },
    
    // Payments
    receivedAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },

    // Status and processing
    status: { 
      type: String, 
      enum: ['draft', 'calculated', 'approved', 'paid', 'cancelled'], 
      default: 'draft' 
    },
    calculatedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    
    // Notes and remarks
    notes: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

salarySummarySchema.index({ staff: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('SalarySummary', salarySummarySchema);