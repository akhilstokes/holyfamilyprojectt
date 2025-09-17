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
  morningStart: { type: String, required: true }, // "HH:mm"
  morningEnd: { type: String, required: true },   // "HH:mm"
  eveningStart: { type: String, required: true }, // "HH:mm"
  eveningEnd: { type: String, required: true },   // "HH:mm"
  assignments: { type: [assignmentSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

weeklyShiftScheduleSchema.index({ weekStart: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyShiftSchedule', weeklyShiftScheduleSchema);