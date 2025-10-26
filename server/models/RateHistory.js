const mongoose = require('mongoose');

// Tracks admin-updated rate values for a specific user
const rateHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow null for system-generated rates
    },
    rateType: {
      type: String,
      required: true, // e.g., 'latex60', 'rubber_sheet', 'wage', 'commission', etc.
      trim: true,
    },
    rateValue: {
      type: Number,
      required: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Source of the rate: 'manual', 'rubber_board', 'system', etc.
    source: {
      type: String,
      default: 'manual',
      enum: ['manual', 'rubber_board', 'system', 'api', 'cache_last_known']
    },
    // URL from which the rate was fetched (for external sources)
    fetchedFrom: {
      type: String,
      default: null
    },
    // Additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('RateHistory', rateHistorySchema);
