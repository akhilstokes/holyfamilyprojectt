const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    index: true
  },
  checkInAt: {
    type: Date,
    default: null
  },
  checkOutAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'leave', 'holiday'],
    default: 'absent'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  approvalNotes: {
    type: String,
    default: null
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

attendanceSchema.index({ staff: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ verified: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
