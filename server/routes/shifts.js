const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');
const User = require('../models/userModel');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all shifts
router.get('/', protect, async (req, res) => {
  try {
    const {
      category,
      type,
      dayOfWeek,
      isActive = true,
      isTemplate,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (dayOfWeek) query.daysOfWeek = dayOfWeek;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';

    const shifts = await Shift.find(query)
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email')
      .sort({ category: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shift.countDocuments(query);

    res.json({
      shifts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Error fetching shifts', error: error.message });
  }
});

// Get shift by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('supervisor', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ message: 'Error fetching shift', error: error.message });
  }
});

// Create new shift
router.post('/', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const shiftData = {
      ...req.body,
      createdBy: req.user.id
    };

    const shift = new Shift(shiftData);
    await shift.save();

    const populatedShift = await Shift.findById(shift._id)
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedShift);
  } catch (error) {
    console.error('Error creating shift:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Error creating shift', error: error.message });
  }
});

// Update shift
router.put('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('supervisor', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shift);
  } catch (error) {
    console.error('Error updating shift:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Error updating shift', error: error.message });
  }
});

// Delete shift
router.delete('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    // Check if shift has any assignments
    const assignmentCount = await ShiftAssignment.countDocuments({ shift: req.params.id });
    
    if (assignmentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete shift with existing assignments',
        assignmentCount 
      });
    }

    const shift = await Shift.findByIdAndDelete(req.params.id);
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: 'Error deleting shift', error: error.message });
  }
});

// Simple stats endpoint for dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const totalShifts = await Shift.countDocuments({ isActive: true });
    const activeShifts = await Shift.countDocuments({ isActive: true });
    
    // Get staff assigned count from assignments
    const staffAssigned = await ShiftAssignment.distinct('staff').then(staff => staff.length);
    
    // Get upcoming shifts (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingShifts = await ShiftAssignment.countDocuments({
      date: { $gte: today.toISOString().split('T')[0], $lte: nextWeek.toISOString().split('T')[0] },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    res.json({
      totalShifts,
      activeShifts,
      staffAssigned,
      upcomingShifts
    });
  } catch (error) {
    console.error('Error fetching shift statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;