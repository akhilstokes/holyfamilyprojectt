const mongoose = require('mongoose');

// Attendance for a staff user per day
const attendanceSchema = new mongoose.Schema(
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true }, // normalized to start-of-day
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
    isLate: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
    notes: { type: String, default: '' },
    // Location validation for check-in/out
    checkInLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
      accuracy: { type: Number, required: false },
      address: { type: String, default: '' }
    },
    checkOutLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
      accuracy: { type: Number, required: false },
      address: { type: String, default: '' }
    },
    // Photo validation for check-in/out
    checkInPhoto: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      uploadedAt: { type: Date, default: null }
    },
    checkOutPhoto: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
      uploadedAt: { type: Date, default: null }
    },
    // Validation flags
    locationVerified: { type: Boolean, default: false },
    photoVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

attendanceSchema.index({ staff: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);