const mongoose = require('mongoose');

const barrelEntrySchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    routeTaskId: { type: String, default: '' },
    dateTime: { type: Date, default: Date.now },
    barrelId: { type: String, default: '' },
    weightKg: { type: Number, required: true, min: 0 },
    ratePerKg: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    moisturePct: { type: Number, default: 0 },
    gps: {
      lat: { type: Number },
      lng: { type: Number },
    },
    photoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

barrelEntrySchema.index({ staff: 1, dateTime: -1 });

module.exports = mongoose.model('BarrelEntry', barrelEntrySchema);


