const mongoose = require('mongoose');

const salaryTemplateSchema = new mongoose.Schema(
  {
    staff: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true,
      index: true 
    },
    
    // Basic Salary Components
    basicSalary: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    
    // Allowances (monthly)
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
    
    // Deduction Rates (percentages)
    providentFundRate: { 
      type: Number, 
      default: 12, 
      min: 0, 
      max: 100 
    },
    professionalTaxRate: { 
      type: Number, 
      default: 2.5, 
      min: 0, 
      max: 100 
    },
    incomeTaxRate: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    
    // Fixed Deductions
    fixedDeductions: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    
    // Status
    isActive: { 
      type: Boolean, 
      default: true 
    },
    
    // Effective dates
    effectiveFrom: { 
      type: Date, 
      default: Date.now 
    },
    effectiveTo: { 
      type: Date, 
      default: null 
    },
    
    // Audit
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    updatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
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
salaryTemplateSchema.index({ staff: 1, isActive: 1 });
salaryTemplateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

module.exports = mongoose.model('SalaryTemplate', salaryTemplateSchema);







































