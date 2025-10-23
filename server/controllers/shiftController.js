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

// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { name, startTime, endTime, gracePeriod, description } = req.body;

    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM format.' });
    }

    // Check if shift name already exists
    const existingShift = await Shift.findOne({ name });
    if (existingShift) {
      return res.status(400).json({ message: 'Shift with this name already exists.' });
    }

    const shift = new Shift({
      name,
      startTime,
      endTime,
      gracePeriod: gracePeriod || 5,
      description,
      createdBy: staffId
    });

    await shift.save();

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      shift
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const { isActive = true } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const shifts = await Shift.find(query)
      .populate('assignedStaff', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      shifts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get single shift
exports.getShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findById(id)
      .populate('assignedStaff', 'name email role')
      .populate('createdBy', 'name email');

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      shift
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, gracePeriod, description, isActive } = req.body;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Validate time format if provided
    if (startTime || endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (startTime && !timeRegex.test(startTime)) {
        return res.status(400).json({ message: 'Invalid start time format. Use HH:MM format.' });
      }
      if (endTime && !timeRegex.test(endTime)) {
        return res.status(400).json({ message: 'Invalid end time format. Use HH:MM format.' });
      }
    }

    // Check if name already exists (if changing name)
    if (name && name !== shift.name) {
      const existingShift = await Shift.findOne({ name });
      if (existingShift) {
        return res.status(400).json({ message: 'Shift with this name already exists.' });
      }
    }

    // Update fields
    if (name) shift.name = name;
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (gracePeriod !== undefined) shift.gracePeriod = gracePeriod;
    if (description !== undefined) shift.description = description;
    if (isActive !== undefined) shift.isActive = isActive;

    await shift.save();

    res.status(200).json({
      success: true,
      message: 'Shift updated successfully',
      shift
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Check if shift has assigned staff
    if (shift.assignedStaff.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete shift with assigned staff. Please reassign staff first.' 
      });
    }

    await Shift.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Assign staff to shift
exports.assignStaffToShift = async (req, res) => {
  try {
    const { shiftId, staffIds } = req.body;

    if (!shiftId || !staffIds || !Array.isArray(staffIds)) {
      return res.status(400).json({ message: 'Shift ID and staff IDs are required.' });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Validate staff IDs
    const validStaff = await User.find({
      _id: { $in: staffIds },
      role: { $in: ['staff', 'lab_staff', 'delivery_staff', 'accountant'] }
    });

    if (validStaff.length !== staffIds.length) {
      return res.status(400).json({ message: 'Some staff members are invalid or not eligible for shifts.' });
    }

    // Remove staff from other shifts first
    await Shift.updateMany(
      { assignedStaff: { $in: staffIds } },
      { $pull: { assignedStaff: { $in: staffIds } } }
    );

    // Assign staff to new shift
    shift.assignedStaff = staffIds;
    await shift.save();

    // Update user records with assigned shift
    await User.updateMany(
      { _id: { $in: staffIds } },
      { assignedShift: shiftId }
    );

    res.status(200).json({
      success: true,
      message: 'Staff assigned to shift successfully',
      shift: await Shift.findById(shiftId).populate('assignedStaff', 'name email role')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Remove staff from shift
exports.removeStaffFromShift = async (req, res) => {
  try {
    const { shiftId, staffId } = req.body;

    if (!shiftId || !staffId) {
      return res.status(400).json({ message: 'Shift ID and staff ID are required.' });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Remove staff from shift
    shift.assignedStaff = shift.assignedStaff.filter(id => id.toString() !== staffId);
    await shift.save();

    // Update user record
    await User.findByIdAndUpdate(staffId, { $unset: { assignedShift: 1 } });

    res.status(200).json({
      success: true,
      message: 'Staff removed from shift successfully',
      shift: await Shift.findById(shiftId).populate('assignedStaff', 'name email role')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get staff members for assignment
exports.getStaffForAssignment = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['staff', 'lab_staff', 'delivery_staff', 'accountant'] },
      status: 'active'
    })
    .select('name email role assignedShift')
    .populate('assignedShift', 'name startTime endTime')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      staff
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get shift statistics
exports.getShiftStatistics = async (req, res) => {
  try {
    const stats = await Shift.aggregate([
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          activeShifts: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalAssignedStaff: { $sum: { $size: '$assignedStaff' } }
        }
      }
    ]);

    const shiftStats = stats[0] || { totalShifts: 0, activeShifts: 0, totalAssignedStaff: 0 };

    res.status(200).json({
      success: true,
      statistics: shiftStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

