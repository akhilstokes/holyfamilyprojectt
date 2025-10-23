const ActivityLog = require('../models/activityLogModel');
const mongoose = require('mongoose');

class ActivityLogger {
  static async logActivity({
    user,
    action,
    description,
    entityType = null,
    entityId = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    location = null,
    approvedBy = null,
    approvedAt = null,
    status = 'completed'
  }) {
    try {
      // Skip logging if user is not a valid ObjectId (e.g., 'builtin-admin')
      if (user && !mongoose.isValidObjectId(user)) {
        console.warn(`Skipping activity log for non-ObjectId user: ${user} - Action: ${action}`);
        return null;
      }

      // Skip logging if approvedBy is not a valid ObjectId
      if (approvedBy && !mongoose.isValidObjectId(approvedBy)) {
        console.warn(`Invalid approvedBy ObjectId: ${approvedBy}, setting to null`);
        approvedBy = null;
      }

      const log = new ActivityLog({
        user,
        action,
        description,
        entityType,
        entityId,
        metadata,
        ipAddress,
        userAgent,
        location,
        approvedBy,
        approvedAt,
        status
      });

      await log.save();
      return log;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking main functionality
      return null;
    }
  }

  // Helper methods for common activities
  static async logStaffInvitation(invitedBy, staffEmail, staffName, staffId) {
    return this.logActivity({
      user: invitedBy,
      action: 'staff_invited',
      description: `Invited ${staffName} (${staffEmail}) with Staff ID: ${staffId}`,
      entityType: 'user',
      metadata: { staffEmail, staffName, staffId }
    });
  }

  static async logStaffRegistration(staffId, email, name) {
    return this.logActivity({
      user: staffId,
      action: 'staff_registered',
      description: `Staff ${name} (${email}) completed registration`,
      entityType: 'user',
      metadata: { email, name }
    });
  }

  static async logStaffApproval(approvedBy, staffId, staffName) {
    return this.logActivity({
      user: approvedBy,
      action: 'staff_approved',
      description: `Approved staff ${staffName} (${staffId})`,
      entityType: 'user',
      approvedBy,
      approvedAt: new Date(),
      metadata: { staffId, staffName }
    });
  }

  static async logAttendanceMarking(staffId, date, location = null) {
    return this.logActivity({
      user: staffId,
      action: 'attendance_marked',
      description: `Marked attendance for ${date}`,
      entityType: 'attendance',
      location,
      metadata: { date }
    });
  }

  static async logAttendanceVerification(verifiedBy, staffId, staffName, date) {
    return this.logActivity({
      user: verifiedBy,
      action: 'attendance_verified',
      description: `Verified attendance for ${staffName} on ${date}`,
      entityType: 'attendance',
      approvedBy: verifiedBy,
      approvedAt: new Date(),
      metadata: { staffId, staffName, date }
    });
  }

  static async logLeaveApplication(staffId, leaveType, startDate, endDate) {
    return this.logActivity({
      user: staffId,
      action: 'leave_applied',
      description: `Applied for ${leaveType} leave from ${startDate} to ${endDate}`,
      entityType: 'leave',
      metadata: { leaveType, startDate, endDate }
    });
  }

  static async logLeaveApproval(approvedBy, staffId, staffName, leaveType) {
    return this.logActivity({
      user: approvedBy,
      action: 'leave_approved',
      description: `Approved ${leaveType} leave for ${staffName}`,
      entityType: 'leave',
      approvedBy,
      approvedAt: new Date(),
      metadata: { staffId, staffName, leaveType }
    });
  }

  static async logLeaveRejection(rejectedBy, staffId, staffName, leaveType, reason) {
    return this.logActivity({
      user: rejectedBy,
      action: 'leave_rejected',
      description: `Rejected ${leaveType} leave for ${staffName}. Reason: ${reason}`,
      entityType: 'leave',
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      metadata: { staffId, staffName, leaveType, reason }
    });
  }

  static async logRateUpdate(updatedBy, oldRate, newRate, product) {
    return this.logActivity({
      user: updatedBy,
      action: 'rate_updated',
      description: `Updated ${product} rate from ₹${oldRate} to ₹${newRate}`,
      entityType: 'rate',
      metadata: { oldRate, newRate, product }
    });
  }

  static async logRateApproval(approvedBy, rate, product) {
    return this.logActivity({
      user: approvedBy,
      action: 'rate_approved',
      description: `Approved ${product} rate: ₹${rate}`,
      entityType: 'rate',
      approvedBy,
      approvedAt: new Date(),
      metadata: { rate, product }
    });
  }

  static async logSalaryProcessing(processedBy, staffId, staffName, amount, month, year) {
    return this.logActivity({
      user: processedBy,
      action: 'salary_processed',
      description: `Processed salary of ₹${amount} for ${staffName} (${month}/${year})`,
      entityType: 'salary',
      metadata: { staffId, staffName, amount, month, year }
    });
  }

  static async logDocumentUpload(staffId, documentType, filename) {
    return this.logActivity({
      user: staffId,
      action: 'document_uploaded',
      description: `Uploaded ${documentType}: ${filename}`,
      entityType: 'document',
      metadata: { documentType, filename }
    });
  }

  static async logShiftAssignment(assignedBy, staffId, staffName, shiftType, date) {
    return this.logActivity({
      user: assignedBy,
      action: 'shift_assigned',
      description: `Assigned ${shiftType} shift to ${staffName} for ${date}`,
      entityType: 'shift',
      metadata: { staffId, staffName, shiftType, date }
    });
  }

  static async logUserLogin(userId, ipAddress, userAgent) {
    return this.logActivity({
      user: userId,
      action: 'user_login',
      description: 'User logged in',
      ipAddress,
      userAgent
    });
  }

  static async logUserLogout(userId) {
    return this.logActivity({
      user: userId,
      action: 'user_logout',
      description: 'User logged out'
    });
  }

  // Get activity logs with filtering
  static async getActivityLogs({
    userId = null,
    action = null,
    entityType = null,
    startDate = null,
    endDate = null,
    page = 1,
    limit = 50
  } = {}) {
    const query = {};
    
    if (userId) query.user = userId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email staffId role')
      .populate('approvedBy', 'name email staffId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    return {
      logs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  }
}

module.exports = ActivityLogger;






