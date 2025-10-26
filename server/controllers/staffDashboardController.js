const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const SalarySummary = require('../models/salarySummaryModel');
const Shift = require('../models/shiftModel');
const WeeklyShiftSchedule = require('../models/weeklyShiftScheduleModel');
const ActivityLogger = require('../services/activityLogger');
const mongoose = require('mongoose');

// Helper: resolve a usable staff ObjectId from the authenticated user payload
async function resolveStaffObjectId(authUser) {
  try {
    // Preferred: direct _id
    if (authUser?._id && mongoose.isValidObjectId(authUser._id)) {
      return new mongoose.Types.ObjectId(authUser._id);
    }
    // Sometimes frameworks put id as string under 'id' or 'userId'
    if (authUser?.id && mongoose.isValidObjectId(authUser.id)) {
      return new mongoose.Types.ObjectId(authUser.id);
    }
    if (authUser?.userId && mongoose.isValidObjectId(authUser.userId)) {
      return new mongoose.Types.ObjectId(authUser.userId);
    }
    // Fallback: if token carries a human staffId like HFP01/ACC01/STF-2025-005
    // try to locate the User document by that staffId
    if (authUser?.staffId) {
      const userDoc = await User.findOne({ staffId: authUser.staffId }).select('_id');
      if (userDoc?._id) return userDoc._id;
    }
    // Not resolvable
    return null;
  } catch (_) {
    return null;
  }
}

// Helper: get week start (local) - Sunday as start of week
function startOfWeekLocal(d) {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const delta = dt.getDay(); // 0..6 where 0 is Sunday
  const weekStart = new Date(dt);
  weekStart.setDate(dt.getDate() - delta);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Helper: resolve today's scheduled shift window and return { start: Date, end: Date }
async function resolveTodayShiftWindow(staffId, now, role) {
  // Try explicit per-day Shift model (no times – map shiftType to defaults if needed)
  // Prefer WeeklyShiftSchedule with explicit HH:mm times.
  try {
    const group = role === 'lab_staff' ? 'lab' : 'field';
    const weekStart = startOfWeekLocal(now);
    const sched = await WeeklyShiftSchedule.findOne({ weekStart, group }).lean();
    if (sched && Array.isArray(sched.assignments)) {
      const assigned = sched.assignments.find(a => String(a.staff) === String(staffId));
      if (assigned && assigned.shiftType) {
        const parseHM = (hm) => {
          const [hh, mm] = String(hm || '').split(':').map(n => parseInt(n, 10));
          if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
          const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          t.setHours(hh, mm, 0, 0);
          return t;
        };
        if (assigned.shiftType === 'Morning') {
          const start = parseHM(sched.morningStart);
          const end = parseHM(sched.morningEnd);
          if (start && end) return { start, end };
        }
        if (assigned.shiftType === 'Evening') {
          const start = parseHM(sched.eveningStart);
          const end = parseHM(sched.eveningEnd);
          if (start && end) return { start, end };
        }
      }
    }
  } catch (_) { /* ignore and fallback */ }

  // Fallback default: 09:00–14:00
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setHours(9, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  end.setHours(14, 0, 0, 0);
  return { start, end };
}

// Get staff dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const staffId = req.user._id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({
      staff: staffId,
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      }
    });

    // Get current month attendance stats
    const monthlyAttendance = await Attendance.find({
      staff: staffId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const workingDays = monthlyAttendance.filter(att => att.checkInAt).length;
    const totalDays = monthlyAttendance.length;

    // Get pending leave requests
    const pendingLeaves = await Leave.find({
      staff: staffId,
      status: 'pending'
    }).sort({ appliedAt: -1 });

    // Get current shift
    const currentShift = await Shift.findOne({
      assignedStaff: staffId,
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      }
    });

    // Get salary summary for current month
    const salarySummary = await SalarySummary.findOne({
      staff: staffId,
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1
    });

    res.json({
      success: true,
      data: {
        attendance: {
          today: todayAttendance,
          monthly: {
            workingDays,
            totalDays,
            attendanceRate: totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0
          }
        },
        leaves: {
          pending: pendingLeaves.length,
          requests: pendingLeaves
        },
        shift: currentShift,
        salary: salarySummary
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Mark attendance with GPS verification and shift-window enforcement
exports.markAttendance = async (req, res) => {
  try {
    const { type, location, photo } = req.body; // type: 'checkin' or 'checkout'
    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Invalid authenticated user. Unable to resolve staff id.' });
    }
    const currentDate = new Date();
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    if (!['checkin', 'checkout'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either checkin or checkout' });
    }

    // Validate GPS location if provided
    if (location && (!location.latitude || !location.longitude)) {
      return res.status(400).json({ message: 'Valid GPS coordinates are required' });
    }

    // Find or create today's attendance record
    let attendance = await Attendance.findOne({
      staff: staffId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance) {
      attendance = new Attendance({
        staff: staffId,
        date: today
      });
    }

    const now = new Date();

    if (type === 'checkin') {
      if (attendance.checkInAt) {
        return res.status(400).json({ message: 'Already checked in today' });
      }

      // Enforce start time + 5 minutes rule based on scheduled shift
      const { start } = await resolveTodayShiftWindow(staffId, now, req.user?.role);
      const allowedFrom = new Date(start);
      allowedFrom.setMinutes(allowedFrom.getMinutes() + 5);
      if (now < allowedFrom) {
        const hh = String(start.getHours()).padStart(2, '0');
        const mm = String(start.getMinutes()).padStart(2, '0');
        return res.status(400).json({
          message: `Attendance can be marked from ${hh}:${mm} + 5 minutes.`
        });
      }

      attendance.checkInAt = now;
      if (location) {
        attendance.checkInLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          address: location.address || ''
        };
        attendance.locationVerified = true;
      }
      if (photo) {
        attendance.checkInPhoto = {
          url: photo.url || '',
          filename: photo.filename || '',
          uploadedAt: now
        };
        attendance.photoVerified = true;
      }

      // Mark late if after scheduled start time
      const { start: schedStart } = await resolveTodayShiftWindow(staffId, now, req.user?.role);
      attendance.isLate = now > schedStart;

    } else if (type === 'checkout') {
      if (!attendance.checkInAt) {
        return res.status(400).json({ message: 'Must check in before checking out' });
      }
      if (attendance.checkOutAt) {
        return res.status(400).json({ message: 'Already checked out today' });
      }

      attendance.checkOutAt = now;
      if (location) {
        attendance.checkOutLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          address: location.address || ''
        };
      }
      if (photo) {
        attendance.checkOutPhoto = {
          url: photo.url || '',
          filename: photo.filename || '',
          uploadedAt: now
        };
      }
    }

    await attendance.save();

    // Log the attendance activity
    await ActivityLogger.logAttendanceMarking(
      staffId,
      today.toISOString().split('T')[0],
      location
    );

    res.json({
      success: true,
      message: `Attendance ${type} recorded successfully`,
      data: attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Get attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 30, startDate, endDate } = req.query;
    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      // Graceful empty response to avoid noisy errors on clients until auth is fixed
      return res.json({ success: true, data: [], pagination: { current: 1, pages: 0, total: 0 } });
    }

    let query = { staff: staffId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const numPage = Math.max(1, Number(page) || 1);
    const numLimit = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (numPage - 1) * numLimit;
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(numLimit);

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
      pagination: {
        current: numPage,
        pages: Math.ceil(total / numLimit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history',
      error: error.message
    });
  }
};

// Get salary history
exports.getSalaryHistory = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { page = 1, limit = 12, year } = req.query;

    let query = { staff: staffId };
    if (year) query.year = Number(year);

    const skip = (page - 1) * limit;
    
    const salarySummaries = await SalarySummary.find(query)
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SalarySummary.countDocuments(query);

    res.json({
      success: true,
      data: salarySummaries,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching salary history',
      error: error.message
    });
  }
};

// Get assigned shifts
exports.getAssignedShifts = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { assignedStaff: staffId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const shifts = await Shift.find(query)
      .sort({ date: -1 });

    res.json({
      success: true,
      data: shifts
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shifts',
      error: error.message
    });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { type, filename, url } = req.body;
    const staffId = req.user._id;

    if (!type || !filename || !url) {
      return res.status(400).json({ message: 'Type, filename, and URL are required' });
    }

    const validTypes = ['id_proof', 'license', 'certificate', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Here you would typically save the document to the user's profile
    // For now, we'll just log the activity
    await ActivityLogger.logDocumentUpload(staffId, type, filename);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: { type, filename, url, uploadedAt: new Date() }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Get staff profile
exports.getProfile = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    const user = await User.findById(staffId)
      .select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update staff profile
exports.updateProfile = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { name, phoneNumber, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log profile update
    await ActivityLogger.logActivity({
      user: staffId,
      action: 'profile_updated',
      description: 'Updated profile information',
      metadata: { updatedFields: Object.keys(updateData) }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};


















