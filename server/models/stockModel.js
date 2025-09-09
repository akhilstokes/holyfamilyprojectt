const mongoose = require('mongoose');

// Represents current stock for a product (not individual transactions)
const stockSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      default: 'Raw Latex',
      trim: true,
    },
    quantityInLiters: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // prevent negative values at the DB level
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Stock', stockSchema);