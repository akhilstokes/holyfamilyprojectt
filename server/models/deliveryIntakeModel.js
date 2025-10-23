const mongoose = require('mongoose');

const deliveryIntakeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  barrelCount: { type: Number, required: true, min: 0 },
  notes: { type: String },
  companyBarrel: { type: String },
  status: { type: String, enum: ['pending', 'manager_verified', 'approved', 'rejected', 'billed'], default: 'pending' },
  pricePerBarrel: { type: Number },
  totalAmount: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  linkedBillId: { type: mongoose.Schema.Types.ObjectId },
  // Optional geolocation for where the request was created
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined }, // [lng, lat]
  },
  locationAccuracy: { type: Number }, // meters
}, { timestamps: true });

module.exports = mongoose.model('DeliveryIntake', deliveryIntakeSchema);
