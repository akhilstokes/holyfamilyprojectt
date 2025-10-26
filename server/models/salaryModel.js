const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    staff: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    year: { 
      type: Number, 
      required: true 
    },
    month: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 12 
    },
    
    // Basic Salary Components
    basicSalary: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    
    // Allowances
    houseRentAllowance: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    medicalAllowance: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    transportAllowance: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    specialAllowance: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    
    // Deductions
    providentFund: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    professionalTax: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    incomeTax: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    otherDeductions: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    
    // Computed Fields
    grossSalary: { 
      type: Number, 
      default: 0 
    },
    totalDeductions: { 
      type: Number, 
      default: 0 
    },
    netSalary: { 
      type: Number, 
      default: 0 
    },
    
    // Additional Payments
    bonus: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    overtime: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    
    // Status
    status: { 
      type: String, 
      enum: ['draft', 'approved', 'paid'], 
      default: 'draft' 
    },
    
    // Payment Details
    paymentDate: { 
      type: Date, 
      default: null 
    },
    paymentMethod: { 
      type: String, 
      enum: ['bank_transfer', 'cash', 'cheque'], 
      default: null 
    },
    paymentReference: { 
      type: String, 
      default: '' 
    },
    
    // Audit
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    approvedAt: { 
      type: Date, 
      default: null 
    },
    
    // Notes
    notes: { 
      type: String, 
      default: '' 
    }
  },
  { timestamps: true }
);

// Index for efficient queries
salarySchema.index({ staff: 1, year: 1, month: 1 }, { unique: true });
salarySchema.index({ status: 1, year: 1, month: 1 });

// Pre-save middleware to calculate computed fields
salarySchema.pre('save', function(next) {
  // Calculate gross salary
  this.grossSalary = this.basicSalary + 
                    this.houseRentAllowance + 
                    this.medicalAllowance + 
                    this.transportAllowance + 
                    this.specialAllowance + 
                    this.bonus + 
                    this.overtime;
  
  // Calculate total deductions
  this.totalDeductions = this.providentFund + 
                        this.professionalTax + 
                        this.incomeTax + 
                        this.otherDeductions;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;
  
  next();
});

module.exports = mongoose.model('Salary', salarySchema);




































