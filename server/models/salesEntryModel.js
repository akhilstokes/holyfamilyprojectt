const mongoose = require('mongoose');

// Customer sales entries
const salesEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

salesEntrySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SalesEntry', salesEntrySchema);


