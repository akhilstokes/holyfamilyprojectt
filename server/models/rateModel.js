const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    // Market (e.g., Rubber Board) rate for reference
    marketRate: { type: Number, required: false },

    // Admin/company buying rate for users
    companyRate: { type: Number, required: false },

    // Single rate value (for backward compatibility and new structure)
    rate: { type: Number, required: false },

    // Source of rate: 'manual', 'rubber_board', 'system', etc.
    source: { type: String, default: 'manual' },

    // Product identifier (e.g., 'latex60', 'rubber_sheet') for filtering
    product: { type: String, default: 'latex60' },

    // Unit of measure
    unit: { type: String, default: 'per 100 Kg' },

    // Effective date chosen by admin (calendar). Defaults to creation date if not provided
    effectiveDate: { type: Date, default: Date.now },

    // URL from which the rate was fetched (for rubber board rates)
    fetchedFrom: { type: String, default: null },

    // Additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

// Index to speed up date range queries by product and effectiveDate
rateSchema.index({ product: 1, effectiveDate: -1 });

module.exports = mongoose.model('Rate', rateSchema);
