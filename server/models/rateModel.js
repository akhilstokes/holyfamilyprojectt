const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
  {
    marketRate: { type: Number, required: true },   // Daily market rate
    companyRate: { type: Number, required: true },  // Company buying rate
    source: { type: String, default: 'manual' },    // 'manual' or API source
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rate', rateSchema);
