const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  customer: { type: String, required: true }, // could be customerId later
  address: { type: String },
  type: { type: String, enum: ['pickup', 'drop'], required: true },
  barrels: { type: Number, default: 0 },
  windowFrom: { type: String }, // HH:mm
  windowTo: { type: String },   // HH:mm
  eta: { type: String },
  inventoryFileName: { type: String },
  status: { type: String, enum: ['pending', 'on_the_way', 'picked', 'dropped', 'skipped', 'failed'], default: 'pending' },
  notes: { type: String },
  proofUrl: { type: String },
}, { _id: true, timestamps: true });

const StaffTripSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleId: { type: String },
  stops: [StopSchema],
  status: { type: String, enum: ['planned', 'in_progress', 'done'], default: 'planned' },
}, { timestamps: true });

module.exports = mongoose.model('StaffTrip', StaffTripSchema);
