const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  lotNo: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitCost: { type: Number, default: 0 },
  receivedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
}, { _id: false });

const chemicalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  unit: { type: String, enum: ['L', 'kg'], default: 'L' },
  minThreshold: { type: Number, default: 0 },
  reorderPoint: { type: Number, default: 0 },
  safetyStock: { type: Number, default: 0 },
  lots: { type: [lotSchema], default: [] },
}, { timestamps: true });

chemicalSchema.methods.onHand = function() {
  return this.lots.reduce((sum, l) => sum + (l.quantity || 0), 0);
};

module.exports = mongoose.model('Chemical', chemicalSchema);


