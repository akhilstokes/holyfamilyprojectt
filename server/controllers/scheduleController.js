const WeeklyShiftSchedule = require('../models/weeklyShiftScheduleModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Normalize a date string to local 00:00 of that day
function normalizeWeekStart(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// GET /api/schedules?from=YYYY-MM-DD&to=YYYY-MM-DD&group=field|lab
exports.list = async (req, res) => {
  try {
    const { from, to, group = 'field' } = req.query;
    const q = { group };
    if (from || to) {
      q.weekStart = {};
      if (from) q.weekStart.$gte = normalizeWeekStart(from);
      if (to) q.weekStart.$lte = normalizeWeekStart(to);
    }
    const items = await WeeklyShiftSchedule.find(q).sort({ weekStart: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// POST /api/schedules/overrides  { weekStart, group, date, staff, shiftType }
exports.addOverride = async (req, res) => {
  try {
    const { weekStart, group = 'field', date, staff, shiftType } = req.body;
    if (!weekStart || !date || !staff || !shiftType) {
      return res.status(400).json({ message: 'weekStart, date, staff, shiftType required' });
    }
    const normalized = normalizeWeekStart(weekStart);
    const d = new Date(date); d.setHours(0,0,0,0);
    if (!mongoose.Types.ObjectId.isValid(String(staff))) return res.status(400).json({ message: 'Invalid staff id' });

    const doc = await WeeklyShiftSchedule.findOne({ weekStart: normalized, group });
    if (!doc) return res.status(404).json({ message: 'Schedule not found' });

    // Remove any existing override for same {date,staff}
    doc.overrides = (doc.overrides || []).filter(o => !(o.staff?.toString() === String(staff) && new Date(o.date).setHours(0,0,0,0) === d.getTime()));
    // Add new override
    doc.overrides.push({ date: d, staff, shiftType });
    const saved = await doc.save();
    res.status(201).json({ overrides: saved.overrides });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// DELETE /api/schedules/overrides  { weekStart, group, date, staff }
exports.removeOverride = async (req, res) => {
  try {
    const { weekStart, group = 'field', date, staff } = req.body;
    if (!weekStart || !date || !staff) {
      return res.status(400).json({ message: 'weekStart, date, staff required' });
    }
    const normalized = normalizeWeekStart(weekStart);
    const d = new Date(date); d.setHours(0,0,0,0);

    const doc = await WeeklyShiftSchedule.findOne({ weekStart: normalized, group });
    if (!doc) return res.status(404).json({ message: 'Schedule not found' });

    const before = (doc.overrides || []).length;
    doc.overrides = (doc.overrides || []).filter(o => !(o.staff?.toString() === String(staff) && new Date(o.date).setHours(0,0,0,0) === d.getTime()));
    const saved = await doc.save();
    const removed = before - saved.overrides.length;
    res.json({ removed, overrides: saved.overrides });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// GET /api/schedules/by-week?weekStart=YYYY-MM-DD&group=field|lab
exports.getByWeek = async (req, res) => {
  try {
    const { weekStart, group = 'field' } = req.query;
    if (!weekStart) return res.status(400).json({ message: 'weekStart required' });
    const doc = await WeeklyShiftSchedule.findOne({ weekStart: normalizeWeekStart(weekStart), group });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Manager: Submit shift schedule for admin approval
exports.managerSubmitSchedule = async (req, res) => {
  try {
    const { weekStart, morningStart, morningEnd, eveningStart, eveningEnd, assignments = [], managerNotes } = req.body;
    if (!weekStart || !morningStart || !morningEnd || !eveningStart || !eveningEnd) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalized = normalizeWeekStart(weekStart);
    
    // Prevent back-dating: Only allow scheduling for current week or future weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start of current week (Sunday)
    const currentWeekStart = new Date(today);
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    if (normalized < currentWeekStart) {
      return res.status(400).json({ 
        message: 'Cannot schedule shifts for past weeks. Only current week and future weeks are allowed.' 
      });
    }

    const payload = {
      weekStart: normalized,
      morningStart,
      morningEnd,
      eveningStart,
      eveningEnd,
      assignments: Array.isArray(assignments) ? assignments.filter(a => a && a.staff && a.shiftType) : [],
      createdBy: req.user?._id,
      status: 'pending_approval',
      managerNotes: managerNotes || '',
      submittedAt: new Date()
    };

    const saved = await WeeklyShiftSchedule.findOneAndUpdate(
      { weekStart: normalized },
      { $set: payload },
      { new: true, upsert: true }
    );
    
    res.status(201).json({
      message: 'Shift schedule submitted for admin approval',
      schedule: saved
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
};

// Admin: Get pending shift schedules for approval
exports.getPendingSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const schedules = await WeeklyShiftSchedule.find({ status: 'pending_approval' })
      .populate('createdBy', 'name email')
      .populate('assignments.staff', 'name email staffId')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WeeklyShiftSchedule.countDocuments({ status: 'pending_approval' });

    res.status(200).json({
      success: true,
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Admin: Approve shift schedule
exports.approveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const schedule = await WeeklyShiftSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Only pending schedules can be approved' });
    }

    schedule.status = 'approved';
    schedule.adminNotes = adminNotes || '';
    schedule.approvedBy = req.user._id;
    schedule.approvedAt = new Date();
    await schedule.save();

    res.status(200).json({
      message: 'Shift schedule approved successfully',
      schedule
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Admin: Reject shift schedule
exports.rejectSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const schedule = await WeeklyShiftSchedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    if (schedule.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Only pending schedules can be rejected' });
    }

    schedule.status = 'rejected';
    schedule.adminNotes = adminNotes || '';
    schedule.rejectedBy = req.user._id;
    schedule.rejectedAt = new Date();
    await schedule.save();

    res.status(200).json({
      message: 'Shift schedule rejected',
      schedule
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/schedules  { weekStart, morningStart, morningEnd, eveningStart, eveningEnd, assignments, group }
exports.upsert = async (req, res) => {
  try {
    const { weekStart, morningStart, morningEnd, eveningStart, eveningEnd, assignments = [], group = 'field' } = req.body;
    if (!weekStart || !morningStart || !morningEnd || !eveningStart || !eveningEnd) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalized = normalizeWeekStart(weekStart);
    
    // Prevent back-dating: Only allow scheduling for current week or future weeks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start of current week (Sunday)
    const currentWeekStart = new Date(today);
    const dayOfWeek = currentWeekStart.getDay();
    currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    if (normalized < currentWeekStart) {
      return res.status(400).json({ 
        message: 'Cannot schedule shifts for past weeks. Only current week and future weeks are allowed.' 
      });
    }

    // Resolve assignment.staff to ObjectId (accept ObjectId, staffId, or email)
    const resolved = [];
    const unresolved = [];
    for (const a of (Array.isArray(assignments) ? assignments : [])) {
      if (!a || !a.staff || !a.shiftType) continue;
      let staffId = null;
      if (mongoose.Types.ObjectId.isValid(String(a.staff))) {
        staffId = String(a.staff);
      } else {
        const key = String(a.staff).trim();
        let user = await User.findOne({ $or: [ { staffId: key }, { email: key } ] }).select('_id staffId email').lean();
        if (!user) {
          const alnum = key.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          user = await User.findOne({ staffId: alnum }).select('_id staffId').lean();
        }
        if (user) staffId = String(user._id);
      }
      if (!staffId) {
        unresolved.push(String(a.staff));
      } else {
        resolved.push({ staff: staffId, shiftType: a.shiftType });
      }
    }
    if (unresolved.length) {
      return res.status(400).json({ message: `Unrecognized staff identifiers: ${unresolved.join(', ')}` });
    }

    const payload = {
      weekStart: normalized,
      group,
      morningStart,
      morningEnd,
      eveningStart,
      eveningEnd,
      assignments: resolved,
      createdBy: req.user?._id,
      status: 'active' // Admin can directly activate
    };

    const saved = await WeeklyShiftSchedule.findOneAndUpdate(
      { weekStart: normalized, group },
      { $set: payload },
      { new: true, upsert: true }
    );
    res.status(201).json(saved);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// PUT /api/schedules/:id/assignments  { assignments: [{ staff, shiftType }] }
exports.updateAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { assignments = [] } = req.body;
    const doc = await WeeklyShiftSchedule.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.assignments = Array.isArray(assignments) ? assignments.filter(a => a && a.staff && a.shiftType) : [];
    const saved = await doc.save();
    res.json(saved);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
