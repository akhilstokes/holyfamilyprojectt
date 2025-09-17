const mongoose = require('mongoose');

const capacitySchema = new mongoose.Schema(
  {
    dryer: {
      usedKg: { type: Number, default: 0, min: 0 },
      totalKg: { type: Number, default: 0, min: 0 },
    },
    godown: {
      usedPallets: { type: Number, default: 0, min: 0 },
      totalPallets: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Capacity', capacitySchema);


















