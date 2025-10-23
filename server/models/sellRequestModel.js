const mongoose = require('mongoose');

const SellRequestSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: [
      'REQUESTED','FIELD_ASSIGNED','COLLECTED','DELIVER_ASSIGNED','DELIVERED_TO_LAB','TESTED','ACCOUNT_CALCULATED','VERIFIED','INVOICED','RETURNED_TO_ACCOUNTANT','REJECTED_BY_MANAGER'
    ],
    default: 'REQUESTED'
  },
  assignedFieldStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedDeliveryStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  barrelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Barrel' }],
  drcTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'DrcTest' },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },

  totalVolumeKg: { type: Number, default: 0 },
  drcPct: { type: Number, min: 0, max: 100 },
  marketRate: { type: Number, min: 0 },
  amount: { type: Number, min: 0 },
  collectionNotes: { type: String, default: '' },
  collectionDamageReported: { type: Boolean, default: false },
  invoiceNumber: { type: String },
  invoicePdfUrl: { type: String },

  // Optional overrides supplied by lab before sending to accounts
  overrideFarmerName: { type: String },
  barrelCount: { type: Number, min: 0 },

  // Geolocation of farmer at request time (optional)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined }, // [lng, lat]
  },
  locationAccuracy: { type: Number }, // meters
  capturedAddress: { type: String },

  requestedAt: { type: Date, default: Date.now },
  collectedAt: { type: Date },
  deliveredAt: { type: Date },
  testedAt: { type: Date },
  calculatedAt: { type: Date },
  verifiedAt: { type: Date },
  invoicedAt: { type: Date }
}, { timestamps: true });

// 2dsphere index for geo queries
SellRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SellRequest', SellRequestSchema);
