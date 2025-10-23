const mongoose = require('mongoose');

const labSampleSchema = new mongoose.Schema({
  sampleId: { type: String, required: true, index: true },
  customerName: { type: String, default: '' },
  supplier: { type: String, default: '' },
  batch: { type: String, default: '' },
  quantityLiters: { type: Number, required: true },
  receivedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  barrelCount: { type: Number, default: 0 },
  barrels: [{
    barrelId: { type: String, default: '' },
    liters: { type: Number, default: null }
  }],
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

labSampleSchema.index({ sampleId: 1 }, { unique: false });

module.exports = mongoose.model('LabSample', labSampleSchema);
