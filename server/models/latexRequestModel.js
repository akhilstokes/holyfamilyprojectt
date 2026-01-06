const mongoose = require('mongoose');

const latexRequestSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Request details
  externalSampleId: { type: String, default: '' },
  quantity: { 
    type: Number, 
    required: true,
    min: 0.1
  },
  quality: { 
    type: String, 
    required: true,
    enum: ['premium', 'standard', 'average']
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  contactNumber: { 
    type: String, 
    required: true,
    trim: true
  },
  notes: { 
    type: String, 
    default: '',
    trim: true
  },
  
  // Rate and payment information
  currentRate: { 
    type: Number, 
    required: true 
  },
  estimatedPayment: { 
    type: Number, 
    required: true 
  },
  finalPayment: { 
    type: Number,
    default: null
  },
  
  // Status tracking (expanded workflow)
  status: { 
    type: String, 
    enum: ['pending', 'COLLECTED', 'TEST_COMPLETED', 'ACCOUNT_CALCULATED', 'VERIFIED', 'approved', 'rejected', 'paid', 'cancelled'],
    default: 'pending'
  },
  
  // Approval information
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String,
    default: ''
  },
  
  // Payment information
  paidAt: { 
    type: Date 
  },
  paymentMethod: { 
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'upi'],
    default: undefined // Use undefined instead of null for optional fields
  },
  paymentReference: { 
    type: String,
    default: ''
  },
  
  // Collection information
  collectionDate: { 
    type: Date 
  },
  collectionLocation: { 
    type: String,
    default: ''
  },
  collectedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  collectionNotes: { 
    type: String,
    default: ''
  },

  // Testing (DRC) information
  drcPercentage: { type: Number, default: 0 },
  // Optional override of buyer display name for this request
  overrideBuyerName: { type: String, default: '' },
  // Optional overall barrel count captured by lab
  barrelCount: { type: Number, default: 0, min: 0 },
  // Optional: per-barrel breakdown entered by lab
  barrels: [{
    drc: { type: Number, required: true },
    liters: { type: Number, default: null }
  }],
  testCompletedAt: { type: Date },
  testedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Accountant calculation
  marketRate: { type: Number, default: 0 }, // ₹ per kg
  calculatedAmount: { type: Number, default: 0 }, // quantity(L) * (drc/100) * marketRate
  accountCalculatedAt: { type: Date },
  accountCalculatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Manager verification + invoice
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invoiceNumber: { type: String, default: '' },
  invoicePdfUrl: { type: String, default: '' }
}
, { 
  timestamps: true 
});

// Indexes for efficient querying
latexRequestSchema.index({ user: 1, createdAt: -1 });
latexRequestSchema.index({ status: 1, createdAt: -1 });
latexRequestSchema.index({ approvedBy: 1 });
latexRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LatexRequest', latexRequestSchema);