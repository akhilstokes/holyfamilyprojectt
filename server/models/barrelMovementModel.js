const mongoose = require('mongoose');

const barrelMovementSchema = new mongoose.Schema(
  {
    barrel: { type: mongoose.Schema.Types.ObjectId, ref: 'Barrel', required: true, index: true },
    type: { type: String, enum: ['in', 'out', 'move'], required: true },
    volumeDelta: { type: Number, default: 0 }, // positive for 'in', negative for 'out'
    fromLocation: { type: String, default: '' },
    toLocation: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Logistics semantics for field operations
    movementKind: { type: String, enum: ['dispatch', 'return', null], default: null },
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dispatchDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    isReturnedEmpty: { type: Boolean, default: null },
    dispatchNote: { type: String, default: '' },
    returnNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BarrelMovement', barrelMovementSchema);