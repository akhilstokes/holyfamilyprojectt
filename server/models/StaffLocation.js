const mongoose = require('mongoose');

const StaffLocationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'delivery_staff' },
  coords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number },
  },
  meta: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Keep only one most-recent per user: create an index and we will upsert
StaffLocationSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('StaffLocation', StaffLocationSchema);
