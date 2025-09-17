const mongoose = require('mongoose');

const payrollEntrySchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    type: { type: String, enum: ['received', 'advance', 'deduction', 'bonus'], required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

payrollEntrySchema.index({ staff: 1, year: 1, month: 1, createdAt: -1 });

module.exports = mongoose.model('PayrollEntry', payrollEntrySchema);