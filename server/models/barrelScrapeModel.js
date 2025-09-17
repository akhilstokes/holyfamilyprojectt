const mongoose = require('mongoose');

// Records scraping done on a specific barrel (by serial barrelId)
const barrelScrapeSchema = new mongoose.Schema(
  {
    barrel: { type: mongoose.Schema.Types.ObjectId, ref: 'Barrel', required: true, index: true },
    barrelId: { type: String, required: true, index: true }, // redundant for quick lookup by serial
    totalWeightKg: { type: Number, required: true, min: 0 },
    lumpRubberKg: { type: Number, required: true, min: 0 },
    moisturePercent: { type: Number, min: 0, max: 100, default: null },
    yieldPercent: { type: Number, min: 0, max: 100, default: null },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

barrelScrapeSchema.index({ barrelId: 1, createdAt: -1 });

module.exports = mongoose.model('BarrelScrape', barrelScrapeSchema);


