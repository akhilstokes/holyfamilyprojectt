const Worker = require('../models/workerModel');
const User = require('../models/userModel');
const StaffInvite = require('../models/staffInviteModel');
const Attendance = require('../models/attendanceModel');
const mongoose = require('mongoose');

// Get all staff records (including deleted ones for admin view)
exports.getAllStaffRecords = async (req, res) => {
  try {
    const { includeDeleted = false, status = 'active' } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'deleted') {
      query.isDeleted = true;
    }
    
    // Include deleted records if requested
    if (!includeDeleted && status !== 'deleted') {
      query.isDeleted = { $ne: true };
    }
    
    const staffRecords = await Worker.find(query)
      .populate('user', 'name email phoneNumber role status')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: staffRecords,
      count: staffRecords.length
    });
  } catch (error) {
    console.error('Error fetching staff records:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff records',
      error: error.message
    });
  }
};

// Get single staff record
exports.getStaffRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID'
      });
    }
    
    const staffRecord = await Worker.findById(id)
      .populate('user', 'name email phoneNumber role status');
    
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    res.json({
      success: true,
      data: staffRecord
    });
  } catch (error) {
    console.error('Error fetching staff record:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff record',
      error: error.message
    });
  }
};

// Soft delete staff record (preserves login credentials)
exports.deleteStaffRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Staff record deleted by admin' } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID'
      });
    }
    
    const staffRecord = await Worker.findById(id);
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    // Check if already deleted
    if (staffRecord.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Staff record is already deleted'
      });
    }
    
    // Soft delete the staff record
    staffRecord.isDeleted = true;
    staffRecord.deletedAt = new Date();
    staffRecord.deletedBy = req.user._id;
    staffRecord.deletionReason = reason;
    staffRecord.isActive = false; // Also deactivate
    
    await staffRecord.save();
    
    // Log the deletion
    console.log(`Staff record ${staffRecord.staffId} deleted by ${req.user.name} (${req.user.email})`);
    
    res.json({
      success: true,
      message: 'Staff record deleted successfully',
      data: {
        staffId: staffRecord.staffId,
        deletedAt: staffRecord.deletedAt,
        reason: staffRecord.deletionReason
      }
    });
  } catch (error) {
    console.error('Error deleting staff record:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting staff record',
      error: error.message
    });
  }
};

// Restore deleted staff record
exports.restoreStaffRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID'
      });
    }
    
    const staffRecord = await Worker.findById(id);
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    if (!staffRecord.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Staff record is not deleted'
      });
    }
    
    // Restore the staff record
    staffRecord.isDeleted = false;
    staffRecord.restoredAt = new Date();
    staffRecord.restoredBy = req.user._id;
    staffRecord.isActive = true; // Reactivate
    
    await staffRecord.save();
    
    res.json({
      success: true,
      message: 'Staff record restored successfully',
      data: {
        staffId: staffRecord.staffId,
        restoredAt: staffRecord.restoredAt
      }
    });
  } catch (error) {
    console.error('Error restoring staff record:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring staff record',
      error: error.message
    });
  }
};

// Permanently delete staff record (use with caution)
exports.permanentlyDeleteStaffRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm = false } = req.body;
    
    if (!confirm) {
      return res.status(400).json({
        success: false,
        message: 'Permanent deletion requires confirmation'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID'
      });
    }
    
    const staffRecord = await Worker.findById(id);
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can permanently delete staff records'
      });
    }
    
    // Store staff ID for logging
    const staffId = staffRecord.staffId;
    
    // Permanently delete the staff record
    await Worker.findByIdAndDelete(id);
    
    // Also delete related attendance records (optional - you might want to keep these for historical purposes)
    // await Attendance.deleteMany({ staff: staffRecord.user });
    
    console.log(`Staff record ${staffId} permanently deleted by ${req.user.name} (${req.user.email})`);
    
    res.json({
      success: true,
      message: 'Staff record permanently deleted',
      data: {
        deletedStaffId: staffId
      }
    });
  } catch (error) {
    console.error('Error permanently deleting staff record:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting staff record',
      error: error.message
    });
  }
};

// Update staff record status (activate/deactivate)
exports.updateStaffRecordStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff record ID'
      });
    }
    
    const staffRecord = await Worker.findById(id);
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    // Update status
    staffRecord.isActive = isActive;
    staffRecord.statusUpdatedAt = new Date();
    staffRecord.statusUpdatedBy = req.user._id;
    if (reason) {
      staffRecord.statusReason = reason;
    }
    
    await staffRecord.save();
    
    res.json({
      success: true,
      message: `Staff record ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        staffId: staffRecord.staffId,
        isActive: staffRecord.isActive,
        updatedAt: staffRecord.statusUpdatedAt
      }
    });
  } catch (error) {
    console.error('Error updating staff record status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating staff record status',
      error: error.message
    });
  }
};

// Get staff record by staff ID
exports.getStaffRecordByStaffId = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const staffRecord = await Worker.findOne({ staffId })
      .populate('user', 'name email phoneNumber role status');
    
    if (!staffRecord) {
      return res.status(404).json({
        success: false,
        message: 'Staff record not found'
      });
    }
    
    res.json({
      success: true,
      data: staffRecord
    });
  } catch (error) {
    console.error('Error fetching staff record by staff ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff record',
      error: error.message
    });
  }
};

























