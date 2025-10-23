const mongoose = require('mongoose');

// Weekly shift schedule: admin sets Morning/Evening times for a whole week
// and assigns staff to one of the two shifts for that week.
const assignmentSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftType: { type: String, enum: ['Morning', 'Evening'], required: true },
}, { _id: false });

const weeklyShiftScheduleSchema = new mongoose.Schema({
  // Week start normalized to 00:00:00 local time for the week's first day (Sunday-based)
  weekStart: { type: Date, required: true },
  // Target group this schedule applies to
  group: { type: String, enum: ['field', 'lab'], default: 'field', index: true },
  morningStart: { type: String, required: true }, // "HH:mm"
  morningEnd: { type: String, required: true },   // "HH:mm"
  eveningStart: { type: String, required: true }, // "HH:mm"
  eveningEnd: { type: String, required: true },   // "HH:mm"
  assignments: { type: [assignmentSchema], default: [] },
  // Per-day overrides: when a specific date requires a different shift for a staff
  overrides: [{
    date: { type: Date, required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shiftType: { type: String, enum: ['Morning', 'Evening'], required: true }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Manager approval workflow
  status: { 
    type: String, 
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'active'], 
    default: 'draft' 
  },
  managerNotes: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  submittedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date }
}, { timestamps: true });

// Ensure uniqueness per group per week
weeklyShiftScheduleSchema.index({ weekStart: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyShiftSchedule', weeklyShiftScheduleSchema);