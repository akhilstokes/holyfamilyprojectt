const mongoose = require('mongoose');

const latexIntakeSchema = new mongoose.Schema(
  {
    barrel: { type: mongoose.Schema.Types.ObjectId, ref: 'Barrel', required: true, index: true },
    batchDate: { type: Date, required: true },
    grossKg: { type: Number, required: true, min: 0 },
    tareKg: { type: Number, required: true, min: 0 },
    netLatexKg: { type: Number, required: true, min: 0 },
    ammoniumKg: { type: Number, default: 0, min: 0 },
    otherChemicalsKg: { type: Number, default: 0, min: 0 },
    measuredDRC: { type: Number, min: 0, max: 100, default: null },
    computedDRC: { type: Number, min: 0, max: 100, default: 0 },
    avgDRCGroupKey: { type: String, default: '' },
    weighedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compute derived fields before validation/save
latexIntakeSchema.pre('validate', function(next) {
  // Ensure net = gross - tare
  const gross = Number(this.grossKg || 0);
  const tare = Number(this.tareKg || 0);
  const net = Math.max(0, gross - tare);
  this.netLatexKg = net;

  // Compute DRC if not provided
  if (this.measuredDRC == null || Number.isNaN(this.measuredDRC)) {
    const ammonium = Number(this.ammoniumKg || 0);
    const other = Number(this.otherChemicalsKg || 0);
    const dryKg = Math.max(0, net - ammonium - other);
    const drc = net > 0 ? (dryKg / net) * 100 : 0;
    this.computedDRC = Math.min(100, Math.max(0, Number(drc.toFixed(2))));
  } else {
    this.computedDRC = Math.min(100, Math.max(0, Number(this.measuredDRC)));
  }
  next();
});

module.exports = mongoose.model('LatexIntake', latexIntakeSchema);


