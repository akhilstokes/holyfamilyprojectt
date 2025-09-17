const mongoose = require('mongoose');

const barrelRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'fulfilled'], default: 'pending', index: true },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BarrelRequest', barrelRequestSchema);


