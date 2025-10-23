const Attendance = require('../models/attendanceModel');
const Shift = require('../models/shiftModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Helper function to resolve staff ObjectId
async function resolveStaffObjectId(authUser) {
  try {
    if (authUser?._id && mongoose.isValidObjectId(authUser._id)) {
      return new mongoose.Types.ObjectId(authUser._id);
    }
    if (authUser?.id && mongoose.isValidObjectId(authUser.id)) {
      return new mongoose.Types.ObjectId(authUser.id);
    }
    if (authUser?.userId && mongoose.isValidObjectId(authUser.userId)) {
      return new mongoose.Types.ObjectId(authUser.userId);
    }
    if (authUser?.staffId) {
      const userDoc = await User.findOne({ staffId: authUser.staffId }).select('_id');
      if (userDoc?._id) return userDoc._id;
    }
    return null;
  } catch (_) { 
    return null; 
  }
}

// Get user's shift information
exports.getUserShift = async (req, res) => {
  try {
    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    // Find user's assigned shift
    const user = await User.findById(staffId).populate('assignedShift');
    if (!user || !user.assignedShift) {
      return res.status(404).json({ message: 'No shift assigned to this user.' });
    }

    res.status(200).json(user.assignedShift);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin/Manager/Accountant: mark attendance for a specific staff member
exports.adminMarkAttendance = async (req, res) => {
  try {
    const { staffId: rawStaffId, type, location, notes, timestamp } = req.body || {};
    if (!rawStaffId) return res.status(400).json({ message: 'staffId is required' });
    if (!type || !['check_in', 'check_out'].includes(type)) {
      return res.status(400).json({ message: 'Invalid attendance type.' });
    }
    const staffId = new mongoose.Types.ObjectId(rawStaffId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Find or create today's attendance record for the target staff
    let attendance = await Attendance.findOne({
      staff: staffId,
      date: { $gte: today, $lte: endOfDay }
    });

    if (!attendance) {
      const user = await User.findById(staffId).populate('assignedShift');
      if (!user || !user.assignedShift) {
        return res.status(400).json({ message: 'No shift assigned to this user.' });
      }
      attendance = new Attendance({
        staff: staffId,
        date: today,
        shift: user.assignedShift._id,
        status: 'absent'
      });
    }

    const now = new Date(timestamp || new Date());

    if (type === 'check_in') {
      if (attendance.checkIn) return res.status(400).json({ message: 'Already checked in today.' });
      attendance.checkIn = now;
      attendance.location = location;
      attendance.notes = notes ? (attendance.notes ? `${attendance.notes}\n${notes}` : notes) : attendance.notes;
      if (attendance.shift) {
        const shift = await Shift.findById(attendance.shift);
        if (shift) {
          const shiftStart = new Date(now);
          shiftStart.setHours(parseInt(shift.startTime.split(':')[0]));
          shiftStart.setMinutes(parseInt(shift.startTime.split(':')[1]));
          shiftStart.setSeconds(0);
          if (now <= shiftStart) {
            attendance.status = 'present';
            attendance.isLate = false;
            attendance.lateMinutes = 0;
          } else {
            attendance.status = 'late';
            attendance.isLate = true;
            attendance.lateMinutes = Math.max(0, Math.floor((now - shiftStart) / (1000 * 60)));
          }
        }
      }
    } else {
      if (!attendance.checkIn) return res.status(400).json({ message: 'Must check in before checking out.' });
      if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out today.' });
      attendance.checkOut = now;
      attendance.notes = notes ? (attendance.notes ? `${attendance.notes}\n${notes}` : notes) : attendance.notes;
    }

    await attendance.save();
    return res.json({ success: true, attendance });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get today's attendance for user
exports.getTodayAttendance = async (req, res) => {
  try {
    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      staff: staffId,
      date: {
        $gte: today,
        $lte: endOfDay
      }
    }).populate('shift', 'name startTime endTime gracePeriod');

    res.status(200).json(attendance || { status: 'not_marked' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Mark attendance (check in/out)
exports.markAttendance = async (req, res) => {
  try {
    const { type, location, notes, timestamp } = req.body;
    const staffId = await resolveStaffObjectId(req.user);
    
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    if (!type || !['check_in', 'check_out'].includes(type)) {
      return res.status(400).json({ message: 'Invalid attendance type.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Find or create today's attendance record
    let attendance = await Attendance.findOne({
      staff: staffId,
      date: {
        $gte: today,
        $lte: endOfDay
      }
    });

    if (!attendance) {
      // Get user's shift
      const user = await User.findById(staffId).populate('assignedShift');
      if (!user || !user.assignedShift) {
        return res.status(400).json({ message: 'No shift assigned to this user.' });
      }

      attendance = new Attendance({
        staff: staffId,
        date: today,
        shift: user.assignedShift._id,
        status: 'absent'
      });
    }

    const now = new Date(timestamp || new Date());

    if (type === 'check_in') {
      if (attendance.checkIn) {
        return res.status(400).json({ message: 'Already checked in today.' });
      }

      attendance.checkIn = now;
      attendance.location = location;
      attendance.notes = notes;

      // Late rule: any check-in after shift start is late (no grace window)
      if (attendance.shift) {
        const shift = await Shift.findById(attendance.shift);
        if (shift) {
          const shiftStart = new Date(now);
          shiftStart.setHours(parseInt(shift.startTime.split(':')[0]));
          shiftStart.setMinutes(parseInt(shift.startTime.split(':')[1]));
          shiftStart.setSeconds(0);

          if (now <= shiftStart) {
            attendance.status = 'present';
            attendance.isLate = false;
            attendance.lateMinutes = 0;
          } else {
            attendance.status = 'late';
            attendance.isLate = true;
            attendance.lateMinutes = Math.max(0, Math.floor((now - shiftStart) / (1000 * 60)));
          }
        }
      }
    } else if (type === 'check_out') {
      if (!attendance.checkIn) {
        return res.status(400).json({ message: 'Must check in before checking out.' });
      }
      if (attendance.checkOut) {
        return res.status(400).json({ message: 'Already checked out today.' });
      }

      attendance.checkOut = now;
      if (notes) {
        attendance.notes = attendance.notes ? `${attendance.notes}\n${notes}` : notes;
      }
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Attendance ${type} marked successfully`,
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get attendance history for user
exports.getAttendanceHistory = async (req, res) => {
  try {
    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    const { fromDate, toDate, status, page = 1, limit = 20 } = req.query;
    
    const query = { staff: staffId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(query)
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      attendance,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all attendance (for managers)
exports.getAllAttendance = async (req, res) => {
  try {
    const { 
      fromDate, 
      toDate, 
      status, 
      staff, 
      shift,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    if (staff) {
      query.staff = staff;
    }
    if (shift) {
      query.shift = shift;
    }
    
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(query)
      .populate('staff', 'name email role')
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    // Get statistics
    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      attendance,
      stats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get today's attendance for all staff (for managers)
exports.getTodayAttendanceAll = async (req, res) => {
  try {
    const attendance = await Attendance.getTodayAttendance();
    
    // Get statistics
    const stats = {
      totalStaff: await User.countDocuments({ role: { $in: ['staff', 'lab_staff', 'delivery_staff', 'accountant'] } }),
      presentToday: attendance.filter(a => a.status === 'present').length,
      absentToday: attendance.filter(a => a.status === 'absent').length,
      lateToday: attendance.filter(a => a.status === 'late').length
    };

    res.status(200).json({
      success: true,
      attendance,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Approve attendance (for managers)
exports.approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;

    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    attendance.approvedBy = staffId;
    attendance.approvedAt = new Date();
    attendance.approvalNotes = approvalNotes;
    attendance.isApproved = true;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Attendance approved successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get attendance analytics
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { fromDate, toDate, staffId } = req.query;

    const startDate = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = toDate ? new Date(toDate) : new Date();

    const matchQuery = {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (staffId) {
      matchQuery.staff = staffId;
    }

    const analytics = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            status: '$status',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          count: { $sum: 1 },
          totalWorkingHours: { $sum: '$workingHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' }
        }
      },
      { $sort: { '_id.date': -1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

