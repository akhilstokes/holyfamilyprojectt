const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const Rate = require('../models/rateModel');
const ActivityLogger = require('../services/activityLogger');
const mongoose = require('mongoose');

// Get manager dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get pending leave requests
    const pendingLeaves = await Leave.find({ status: 'pending' })
      .populate('staff', 'name email staffId')
      .sort({ appliedAt: -1 });

    // Get attendance verification requests
    const unverifiedAttendance = await Attendance.find({
      isApproved: false,
      checkIn: { $ne: null }
    })
    .populate('staff', 'name email staffId')
    .sort({ createdAt: -1 });

    // Get staff activity summary
    const staffCount = await User.countDocuments({ 
      role: { $in: ['field_staff', 'staff'] },
      status: 'active'
    });

    const activeStaffToday = await Attendance.distinct('staff', {
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      },
      checkInAt: { $ne: null }
    });

    // Get latest rate information
    const latestRate = await Rate.findOne()
      .sort({ effectiveDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        leaves: {
          pending: pendingLeaves.length,
          requests: pendingLeaves
        },
        attendance: {
          unverified: unverifiedAttendance.length,
          requests: unverifiedAttendance
        },
        staff: {
          total: staffCount,
          activeToday: activeStaffToday.length
        },
        rate: latestRate
      }
    });
  } catch (error) {
    console.error('Error fetching manager dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Verify attendance
exports.verifyAttendance = async (req, res) => {
  try {
    const { attendanceId, verified, notes } = req.body;
    const managerId = req.user._id;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ message: 'Verified status is required' });
    }

    const attendance = await Attendance.findById(attendanceId)
      .populate('staff', 'name email staffId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Map to the actual model fields
    attendance.isApproved = verified;
    attendance.approvedBy = managerId;
    attendance.approvedAt = new Date();
    if (notes) attendance.approvalNotes = notes;

    await attendance.save();

    // Log the verification activity
    await ActivityLogger.logAttendanceVerification(
      managerId,
      attendance.staff._id,
      attendance.staff.name,
      attendance.date.toISOString().split('T')[0]
    );

    // Return with frontend-compatible field names
    const result = attendance.toObject();
    result.verified = result.isApproved;
    result.verifiedBy = result.approvedBy;
    result.verifiedAt = result.approvedAt;

    res.json({
      success: true,
      message: `Attendance ${verified ? 'verified' : 'rejected'} successfully`,
      data: result
    });
  } catch (error) {
    console.error('Error verifying attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying attendance',
      error: error.message
    });
  }
};

// Get all attendance for verification
exports.getAttendanceForVerification = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified = 'false' } = req.query;

    // Map 'verified' query param to 'isApproved' field in the model
    const query = { isApproved: verified === 'true' };
    const skip = (page - 1) * limit;

    const attendance = await Attendance.find(query)
      .populate('staff', 'name email staffId')
      .populate('approvedBy', 'name email staffId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(query);

    // Map isApproved fields to verified fields for frontend compatibility
    const mappedAttendance = attendance.map(record => ({
      ...record.toObject(),
      verified: record.isApproved,
      verifiedBy: record.approvedBy,
      verifiedAt: record.approvedAt
    }));

    res.json({
      success: true,
      data: mappedAttendance,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching attendance for verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
};

// Update daily live rate
exports.updateLiveRate = async (req, res) => {
  try {
    const { companyRate, marketRate, product = 'latex60', effectiveDate } = req.body;
    const managerId = req.user._id;

    if (!companyRate || !marketRate) {
      return res.status(400).json({ message: 'Company rate and market rate are required' });
    }

    // Get previous rate for comparison
    const previousRate = await Rate.findOne({ product })
      .sort({ effectiveDate: -1, createdAt: -1 });

    const newRate = new Rate({
      companyRate: Number(companyRate),
      marketRate: Number(marketRate),
      product,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      source: 'manager_update',
      createdBy: managerId
    });

    await newRate.save();

    // Log the rate update activity
    await ActivityLogger.logRateUpdate(
      managerId,
      previousRate?.companyRate || 0,
      companyRate,
      product
    );

    res.json({
      success: true,
      message: 'Live rate updated successfully',
      data: newRate
    });
  } catch (error) {
    console.error('Error updating live rate:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating live rate',
      error: error.message
    });
  }
};

// Get rate history
exports.getRateHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, product = 'latex60' } = req.query;

    const skip = (page - 1) * limit;

    const rates = await Rate.find({ product })
      .populate('createdBy', 'name email staffId')
      .sort({ effectiveDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rate.countDocuments({ product });

    res.json({
      success: true,
      data: rates,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching rate history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rate history',
      error: error.message
    });
  }
};

// Get staff activity summary
exports.getStaffActivity = async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;

    let query = {};
    if (staffId) query.staff = staffId;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'name email staffId')
      .sort({ date: -1 });

    // Group by staff for summary
    const staffSummary = {};
    attendance.forEach(record => {
      const staffId = record.staff._id.toString();
      if (!staffSummary[staffId]) {
        staffSummary[staffId] = {
          staff: record.staff,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          attendance: []
        };
      }
      
      staffSummary[staffId].totalDays++;
      if (record.checkInAt) {
        staffSummary[staffId].presentDays++;
        if (record.isLate) {
          staffSummary[staffId].lateDays++;
        }
      }
      staffSummary[staffId].attendance.push(record);
    });

    res.json({
      success: true,
      data: Object.values(staffSummary)
    });
  } catch (error) {
    console.error('Error fetching staff activity:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff activity',
      error: error.message
    });
  }
};

// Get all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status = 'active' } = req.query;

    let query = { 
      role: { $in: ['field_staff', 'staff'] }
    };
    
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const staff = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
};

















