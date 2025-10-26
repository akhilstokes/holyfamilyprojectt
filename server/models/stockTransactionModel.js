const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  // Transaction details
  productName: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['in', 'out', 'adjustment', 'transfer', 'return', 'waste', 'production']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['L', 'kg', 'ml', 'units', 'pieces'],
    default: 'L'
  },
  
  // Before and after quantities
  quantityBefore: {
    type: Number,
    required: true,
    min: 0
  },
  quantityAfter: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Transaction metadata
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  reference: {
    type: String,
    trim: true,
    maxlength: 100
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // User information
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByName: {
    type: String,
    required: true
  },
  performedByRole: {
    type: String,
    required: true
  },
  
  // Approval information (for high-value transactions)
  requiresApproval: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedByName: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    maxlength: 500
  },
  
  // Location and department
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  department: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Cost information (if applicable)
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  supplier: {
    name: String,
    contact: String
  },
  
  // Quality information
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'rejected'],
    default: 'A'
  },
  qualityNotes: {
    type: String,
    maxlength: 500
  },
  
  // Timestamps
  transactionDate: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // System fields
  isReversed: {
    type: Boolean,
    default: false
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reversedAt: {
    type: Date
  },
  reversalReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
stockTransactionSchema.index({ productName: 1, transactionDate: -1 });
stockTransactionSchema.index({ transactionType: 1, transactionDate: -1 });
stockTransactionSchema.index({ performedBy: 1, transactionDate: -1 });
stockTransactionSchema.index({ transactionDate: -1 });
stockTransactionSchema.index({ reference: 1 });
stockTransactionSchema.index({ batchNumber: 1 });

// Virtual for transaction impact
stockTransactionSchema.virtual('quantityImpact').get(function() {
  if (this.transactionType === 'in' || this.transactionType === 'return') {
    return this.quantity;
  } else if (this.transactionType === 'out' || this.transactionType === 'waste') {
    return -this.quantity;
  } else if (this.transactionType === 'adjustment') {
    return this.quantityAfter - this.quantityBefore;
  }
  return 0;
});

// Static method to get stock history for a product
stockTransactionSchema.statics.getProductHistory = async function(productName, fromDate, toDate, limit = 100) {
  const query = { productName };
  
  if (fromDate || toDate) {
    query.transactionDate = {};
    if (fromDate) query.transactionDate.$gte = new Date(fromDate);
    if (toDate) query.transactionDate.$lte = new Date(toDate + 'T23:59:59.999Z');
  }
  
  return await this.find(query)
    .populate('performedBy', 'name email role')
    .populate('approvedBy', 'name email role')
    .sort({ transactionDate: -1 })
    .limit(limit);
};

// Static method to get stock summary
stockTransactionSchema.statics.getStockSummary = async function(productName) {
  const pipeline = [
    { $match: { productName, isReversed: false } },
    {
      $group: {
        _id: '$transactionType',
        totalQuantity: { $sum: '$quantity' },
        transactionCount: { $sum: 1 },
        avgQuantity: { $avg: '$quantity' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get current stock level from transactions
stockTransactionSchema.statics.getCurrentStock = async function(productName) {
  const pipeline = [
    { $match: { productName, isReversed: false } },
    {
      $group: {
        _id: null,
        totalIn: {
          $sum: {
            $cond: [
              { $in: ['$transactionType', ['in', 'return', 'production']] },
              '$quantity',
              0
            ]
          }
        },
        totalOut: {
          $sum: {
            $cond: [
              { $in: ['$transactionType', ['out', 'waste']] },
              '$quantity',
              0
            ]
          }
        },
        adjustments: {
          $sum: {
            $cond: [
              { $eq: ['$transactionType', 'adjustment'] },
              { $subtract: ['$quantityAfter', '$quantityBefore'] },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        currentLevel: { $subtract: [{ $add: ['$totalIn', '$adjustments'] }, '$totalOut'] },
        totalIn: 1,
        totalOut: 1,
        adjustments: 1
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { currentLevel: 0, totalIn: 0, totalOut: 0, adjustments: 0 };
};

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);





