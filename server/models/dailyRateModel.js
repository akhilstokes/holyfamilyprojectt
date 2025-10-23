// server/models/dailyRateModel.js
const mongoose = require('mongoose');

const categories = ['RSS4', 'RSS5', 'ISNR20', 'LATEX60']; // fixed set

const dailyRateSchema = new mongoose.Schema(
  {
    effectiveDate: { type: Date, required: true }, // calendar date (00:00 time)
    category: { type: String, enum: categories, required: true },
    inr: { type: Number, required: true }, // per 100 Kg
    usd: { type: Number, required: true }, // per 100 Kg
    source: { type: String, enum: ['admin', 'manager'], default: 'admin' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['active', 'pending_approval', 'approved', 'rejected'], 
      default: 'active' 
    },
    managerNotes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    submittedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

// Ensure one record per Category per Date
dailyRateSchema.index({ category: 1, effectiveDate: 1 }, { unique: true });

module.exports = mongoose.model('DailyRate', dailyRateSchema);
module.exports.categories = categories;