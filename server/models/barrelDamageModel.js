const mongoose = require('mongoose');

const barrelDamageSchema = new mongoose.Schema({
  barrelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barrel', required: true, index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, enum: ['lab', 'field', 'system'], default: 'lab' },
  damageType: { type: String, enum: ['lumbed', 'physical', 'other'], required: true },
  lumbPercent: { type: Number, min: 0, max: 100 },
  remarks: { type: String },
  status: { type: String, enum: ['open', 'assigned', 'resolved', 'scrapped'], default: 'open', index: true },
  assignedTo: { type: String, enum: ['lumb-removal', 'repair', 'scrap', 'inspection', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model('BarrelDamage', barrelDamageSchema);
