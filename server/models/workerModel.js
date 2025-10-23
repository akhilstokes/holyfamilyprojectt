

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    url: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const healthSchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, default: '' },
    medicalCertificateUrl: { type: String, default: '' },
    lastCheckupDate: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const workerSchema = new mongoose.Schema(
  {
    // Core identity
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // link to login account
    staffId: { type: String, unique: true, index: true }, // Auto-generated staff ID

    // Contact and personal details
    dateOfBirth: { type: Date, default: null },
    contactNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContactName: { type: String, default: '' },
    emergencyContactNumber: { type: String, default: '' },

    // IDs & docs
    aadhaarNumber: { type: String, default: '', index: true },
    photoUrl: { type: String, default: '' },
    documents: { type: [documentSchema], default: [] },

    // Health
    health: { type: healthSchema, default: {} },

    // Origin & status
    origin: { type: String, enum: ['kerala', 'other'], default: 'kerala', index: true },
    isActive: { type: Boolean, default: true },

    // Payroll - Enhanced wage system
    wageType: { 
      type: String, 
      enum: ['daily', 'monthly', 'contract', 'piece_rate'], 
      default: 'daily',
      index: true 
    },
    dailyWage: { type: Number, default: 0, min: 0 },
    monthlySalary: { type: Number, default: 0, min: 0 },
    hourlyRate: { type: Number, default: 0, min: 0 },
    overtimeRate: { type: Number, default: 0, min: 0 }, // multiplier for overtime (e.g., 1.5)
    pieceRate: { type: Number, default: 0, min: 0 }, // per unit rate for piece work
    
    // Wage categories and benefits
    wageCategory: { 
      type: String, 
      enum: ['unskilled', 'semi_skilled', 'skilled', 'supervisor', 'manager'], 
      default: 'unskilled',
      index: true 
    },
    benefits: {
      providentFund: { type: Boolean, default: false },
      healthInsurance: { type: Boolean, default: false },
      transportAllowance: { type: Number, default: 0 },
      foodAllowance: { type: Number, default: 0 },
      housingAllowance: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 }
    },
    
    // Performance and incentives
    performanceBonus: { type: Number, default: 0 },
    attendanceBonus: { type: Number, default: 0 },
    productivityBonus: { type: Number, default: 0 },
    
    // Contract details
    contractStartDate: { type: Date, default: null },
    contractEndDate: { type: Date, default: null },
    probationPeriod: { type: Number, default: 0 }, // in days

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Soft deletion fields
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletionReason: { type: String, default: '' },
    
    // Status management
    statusUpdatedAt: { type: Date, default: null },
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusReason: { type: String, default: '' },
    
    // Restoration fields
    restoredAt: { type: Date, default: null },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

workerSchema.index({ name: 1 });

// Pre-save middleware to generate staff ID
workerSchema.pre('save', async function(next) {
  if (!this.staffId) {
    // Generate staff ID in format: STF + 6-digit number
    let staffId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
      staffId = `STF${randomNum}`;
      
      // Check if this staff ID already exists
      const existingWorker = await this.constructor.findOne({ staffId });
      if (!existingWorker) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (isUnique) {
      this.staffId = staffId;
    } else {
      // Fallback to timestamp-based ID if random generation fails
      this.staffId = `STF${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Worker', workerSchema);


