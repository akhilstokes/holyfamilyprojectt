const mongoose = require('mongoose');

// Tracks admin-updated rate values for a specific user
const rateHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rateType: {
      type: String,
      required: true, // e.g., 'wage', 'commission', 'price', etc.
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('RateHistory', rateHistorySchema);
