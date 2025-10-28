const mongoose = require('mongoose');

const barrelCreationRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userBarrelRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarrelRequest'
  },
  userName: String, // User who originally requested
  userEmail: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  adminNotes: String,
  createdBarrels: [{
    type: String // Barrel IDs created for this request
  }]
}, { timestamps: true });

module.exports = mongoose.model('BarrelCreationRequest', barrelCreationRequestSchema);

