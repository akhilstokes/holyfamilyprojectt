const mongoose = require('mongoose');

const wageTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    
    // Wage type and structure
    wageType: { 
      type: String, 
      enum: ['daily', 'monthly', 'contract', 'piece_rate'], 
      required: true 
    },
    wageCategory: { 
      type: String, 
      enum: ['unskilled', 'semi_skilled', 'skilled', 'supervisor', 'manager'], 
      required: true 
    },
    
    // Base wage amounts
    baseDailyWage: { type: Number, default: 0, min: 0 },
    baseMonthlySalary: { type: Number, default: 0, min: 0 },
    baseHourlyRate: { type: Number, default: 0, min: 0 },
    overtimeMultiplier: { type: Number, default: 1.5, min: 1 },
    pieceRate: { type: Number, default: 0, min: 0 },
    
    // Benefits and allowances
    benefits: {
      providentFund: { type: Boolean, default: false },
      healthInsurance: { type: Boolean, default: false },
      transportAllowance: { type: Number, default: 0 },
      foodAllowance: { type: Number, default: 0 },
      housingAllowance: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 }
    },
    
    // Performance incentives
    attendanceBonus: { type: Number, default: 0 },
    productivityBonus: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    
    // Contract terms
    probationPeriod: { type: Number, default: 0 }, // in days
    noticePeriod: { type: Number, default: 30 }, // in days
    
    // Status and metadata
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false }, // default template for category
    tags: [{ type: String }], // for categorization
    
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes
wageTemplateSchema.index({ wageType: 1, wageCategory: 1 });
wageTemplateSchema.index({ isActive: 1, isDefault: 1 });

// Ensure only one default template per category
wageTemplateSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { 
        wageType: this.wageType, 
        wageCategory: this.wageCategory, 
        _id: { $ne: this._id } 
      },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('WageTemplate', wageTemplateSchema);




