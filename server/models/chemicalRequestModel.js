const mongoose = require('mongoose');

const purchaseInfoSchema = new mongoose.Schema({
  invoiceNo: String,
  supplier: String,
  date: Date,
  quantity: Number
}, { _id: false });

const ChemicalRequestSchema = new mongoose.Schema({
  chemicalName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.001 },
  purpose: { type: String, default: '' },
  priority: { type: String, enum: ['low','normal','high','urgent'], default: 'normal' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: [
    'PENDING',
    'MANAGER_VERIFIED',
    'REJECTED_BY_MANAGER',
    'SENT_FOR_PURCHASE',
    'PURCHASE_IN_PROGRESS',
    'PURCHASED',
    'COMPLETED'
  ], default: 'PENDING' },
  managerNote: { type: String },
  adminNote: { type: String },
  purchaseInfo: purchaseInfoSchema
}, { timestamps: true });

module.exports = mongoose.model('ChemicalRequest', ChemicalRequestSchema);
