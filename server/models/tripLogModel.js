const mongoose = require('mongoose');

const tripLogSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now },
    vehicleId: { type: String, default: '' },
    odometerStart: { type: Number, required: true, min: 0 },
    odometerEnd: { type: Number, required: true, min: 0 },
    km: { type: Number, required: true, min: 0 },
    routeTaskId: { type: String, default: '' },
  },
  { timestamps: true }
);

tripLogSchema.index({ staff: 1, date: -1 });

module.exports = mongoose.model('TripLog', tripLogSchema);


