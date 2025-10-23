const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const Rate = require('../models/rateModel');
const StaffInvite = require('../models/staffInviteModel');
const ActivityLogger = require('../services/activityLogger');
const mongoose = require('mongoose');

// Get admin dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get system statistics
    const totalUsers = await User.countDocuments({ status: 'active' });
    const totalStaff = await User.countDocuments({ 
      role: { $in: ['field_staff', 'staff'] },
      status: 'active'
    });
    const totalManagers = await User.countDocuments({ 
      role: 'manager',
      status: 'active'
    });

    // Get pending approvals
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const pendingInvites = await StaffInvite.countDocuments({ status: 'verified' });

    // Get attendance statistics for current month
    const monthlyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $ne: ['$checkInAt', null] }, 1, 0] } },
          lateDays: { $sum: { $cond: ['$isLate', 1, 0] } }
        }
      }
    ]);

    // Get recent activity logs
    const recentActivities = await ActivityLogger.getActivityLogs({
      limit: 10
    });

    // Get latest rate
    const latestRate = await Rate.findOne()
      .sort({ effectiveDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalStaff,
          totalManagers,
          pendingLeaves,
          pendingInvites
        },
        attendance: monthlyAttendance[0] || {
          totalRecords: 0,
          presentDays: 0,
          lateDays: 0
        },
        recentActivities: recentActivities.logs,
        latestRate
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Get all staff invitations
exports.getStaffInvitations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const invitations = await StaffInvite.find(query)
      .populate('invitedBy', 'name email staffId')
      .populate('userId', 'name email staffId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await StaffInvite.countDocuments(query);

    res.json({
      success: true,
      data: invitations,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching staff invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff invitations',
      error: error.message
    });
  }
};

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .populate('statusUpdatedBy', 'name email staffId')
      .populate('roleUpdatedBy', 'name email staffId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user._id;

    const validStatuses = ['active', 'pending', 'suspended', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status,
        statusReason: reason || '',
        statusUpdatedAt: new Date(),
        statusUpdatedBy: adminId
      },
      { new: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the status change
    await ActivityLogger.logActivity({
      user: adminId,
      action: 'user_status_updated',
      description: `Updated ${user.name}'s status to ${status}`,
      entityType: 'user',
      entityId: userId,
      metadata: { status, reason, userName: user.name }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user._id;

    const validRoles = ['user', 'admin', 'manager', 'field_staff', 'buyer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        role,
        roleUpdatedAt: new Date(),
        roleUpdatedBy: adminId
      },
      { new: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the role change
    await ActivityLogger.logActivity({
      user: adminId,
      action: 'user_role_updated',
      description: `Updated ${user.name}'s role to ${role}`,
      entityType: 'user',
      entityId: userId,
      metadata: { role, userName: user.name }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// Get attendance reports
exports.getAttendanceReports = async (req, res) => {
  try {
    const { startDate, endDate, staffId, groupBy = 'day' } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (staffId) matchQuery.staff = new mongoose.Types.ObjectId(staffId);

    let groupStage = {};
    if (groupBy === 'day') {
      groupStage = {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        },
        totalRecords: { $sum: 1 },
        presentDays: { $sum: { $cond: [{ $ne: ['$checkInAt', null] }, 1, 0] } },
        lateDays: { $sum: { $cond: ['$isLate', 1, 0] } }
      };
    } else if (groupBy === 'staff') {
      groupStage = {
        _id: '$staff',
        totalRecords: { $sum: 1 },
        presentDays: { $sum: { $cond: [{ $ne: ['$checkInAt', null] }, 1, 0] } },
        lateDays: { $sum: { $cond: ['$isLate', 1, 0] } }
      };
    }

    const reports = await Attendance.aggregate([
      { $match: matchQuery },
      { $group: groupStage },
      { $sort: { _id: -1 } }
    ]);

    // If grouping by staff, populate staff details
    if (groupBy === 'staff') {
      const staffIds = reports.map(r => r._id);
      const staffDetails = await User.find({ _id: { $in: staffIds } })
        .select('name email staffId');

      const staffMap = {};
      staffDetails.forEach(staff => {
        staffMap[staff._id.toString()] = staff;
      });

      reports.forEach(report => {
        report.staff = staffMap[report._id.toString()];
      });
    }

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching attendance reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance reports',
      error: error.message
    });
  }
};

// Get system activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId, startDate, endDate } = req.query;

    const logs = await ActivityLogger.getActivityLogs({
      userId,
      action,
      startDate,
      endDate,
      page: Number(page),
      limit: Number(limit)
    });

    res.json({
      success: true,
      data: logs.logs,
      pagination: logs.pagination
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

// Approve rate updates
exports.approveRateUpdate = async (req, res) => {
  try {
    const { rateId } = req.params;
    const adminId = req.user._id;

    const rate = await Rate.findById(rateId);
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }

    // Mark rate as approved
    rate.approvedBy = adminId;
    rate.approvedAt = new Date();
    await rate.save();

    // Log the approval
    await ActivityLogger.logRateApproval(adminId, rate.companyRate, rate.product);

    res.json({
      success: true,
      message: 'Rate update approved successfully',
      data: rate
    });
  } catch (error) {
    console.error('Error approving rate update:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving rate update',
      error: error.message
    });
  }
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Attendance statistics for current month
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $ne: ['$checkInAt', null] }, 1, 0] } },
          lateDays: { $sum: { $cond: ['$isLate', 1, 0] } }
        }
      }
    ]);

    // Leave statistics
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        attendance: attendanceStats[0] || {
          totalRecords: 0,
          presentDays: 0,
          lateDays: 0
        },
        leaves: leaveStats
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};
