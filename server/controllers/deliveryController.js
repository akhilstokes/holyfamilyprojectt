const DeliveryTask = require('../models/deliveryTaskModel');
const DeliveryIntake = require('../models/deliveryIntakeModel');
const Notification = require('../models/Notification');
const User = require('../models/userModel');
const StaffLocation = require('../models/StaffLocation');
const Shift = require('../models/shiftModel');

// Create a delivery task (admin/manager)
exports.createTask = async (req, res) => {
  try {
    const { title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes, meta } = req.body;
    if (!title || !assignedTo || !pickupAddress || !dropAddress) {
      return res.status(400).json({ message: 'title, assignedTo, pickupAddress and dropAddress are required' });
    }
    const doc = await DeliveryTask.create({ title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes, meta });

    // Notify customer about schedule
    if (customerUserId) {
      await Notification.create({
        userId: customerUserId,
        role: 'user',
        title: 'Pickup Scheduled',
        message: `Pickup scheduled: ${title}`,
        link: '/user/notifications',
        meta: { taskId: doc._id, scheduledAt }
      });
    }

    return res.status(201).json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// List all tasks (admin/manager)
exports.listAllTasks = async (req, res) => {
  try {
    const { status, assignedTo, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await DeliveryTask.find(query)
      .populate('customerUserId', 'name email phoneNumber')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeliveryTask.countDocuments(query);

    return res.json({ items: tasks, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// List my tasks (delivery staff)
exports.listMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await DeliveryTask.find({ assignedTo: userId })
      .populate('customerUserId', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await DeliveryTask.findById(id)
      .populate('customerUserId', 'name email phoneNumber')
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await DeliveryTask.findByIdAndUpdate(id, req.body, { new: true })
      .populate('customerUserId', 'name email phoneNumber')
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await DeliveryTask.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update task status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meta } = req.body;

    const task = await DeliveryTask.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is assigned to this task or is admin/manager
    if (task.assignedTo.toString() !== req.user._id.toString() && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    if (meta) {
      task.meta = { ...task.meta, ...meta };
    }
    await task.save();

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update my location (delivery staff)
exports.updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    const userId = req.user._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    const location = await StaffLocation.findOneAndUpdate(
      { userId },
      { 
        userId, 
        location: { type: 'Point', coordinates: [longitude, latitude] },
        accuracy,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.json(location);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// List staff locations (admin/manager)
exports.listStaffLocations = async (req, res) => {
  try {
    const locations = await StaffLocation.find()
      .populate('userId', 'name email role')
      .sort({ updatedAt: -1 });

    return res.json(locations);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// List delivered tasks for lab
exports.listDeliveredForLab = async (req, res) => {
  try {
    const tasks = await DeliveryTask.find({ status: 'delivered' })
      .populate('customerUserId', 'name email phoneNumber')
      .populate('assignedTo', 'name email role')
      .sort({ updatedAt: -1 });

    return res.json(tasks);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Barrel intake functions
exports.intakeBarrels = async (req, res) => {
  try {
    const { barrelCount, customerName, customerPhone, notes, barrelIds } = req.body;
    const staffId = req.user._id;

    if (!barrelCount || !customerName) {
      return res.status(400).json({ message: 'barrelCount and customerName are required' });
    }

    const intake = await DeliveryIntake.create({
      createdBy: staffId,
      name: customerName,
      phone: customerPhone,
      barrelCount,
      notes,
      barrelIds,
      status: 'pending'
    });

    return res.status(201).json(intake);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listIntakes = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const intakes = await DeliveryIntake.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeliveryIntake.countDocuments(query);

    return res.json({ items: intakes, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listMyIntakes = async (req, res) => {
  try {
    const staffId = req.user._id;
    const intakes = await DeliveryIntake.find({ createdBy: staffId })
      .sort({ createdAt: -1 });

    return res.json(intakes);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.verifyIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DeliveryIntake.findById(id);
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    doc.status = 'manager_verified';
    doc.verifiedAt = new Date();
    doc.verifiedBy = req.user._id;
    await doc.save();

    // Optionally create a Delivery Task if details are provided
    const { assignedTo, pickupAddress, dropAddress, scheduledAt, notes, title } = req.body || {};
    let task = null;
    if (assignedTo && pickupAddress && dropAddress) {
      task = await DeliveryTask.create({
        title: title || `Barrel Pickup (${doc.barrelCount})`,
        customerUserId: req.user._id, // manager initiator; can be updated to actual customer later if needed
        assignedTo,
        pickupAddress,
        dropAddress,
        scheduledAt,
        notes,
        meta: { intakeId: doc._id, barrelCount: doc.barrelCount }
      });
    }

    return res.json({ intake: doc, task });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.approveIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DeliveryIntake.findById(id);
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    doc.status = 'approved';
    doc.approvedAt = new Date();
    doc.approvedBy = req.user._id;
    await doc.save();

    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.getIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const intake = await DeliveryIntake.findById(id)
      .populate('createdBy', 'name email role')
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!intake) {
      return res.status(404).json({ message: 'Intake not found' });
    }

    return res.json(intake);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.updateIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const intake = await DeliveryIntake.findByIdAndUpdate(id, req.body, { new: true })
      .populate('createdBy', 'name email role');

    if (!intake) {
      return res.status(404).json({ message: 'Intake not found' });
    }

    return res.json(intake);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.deleteIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const intake = await DeliveryIntake.findByIdAndDelete(id);

    if (!intake) {
      return res.status(404).json({ message: 'Intake not found' });
    }

    return res.json({ message: 'Intake deleted successfully' });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Sell allowance functions
exports.getMySellAllowance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('sellAllowance');
    
    return res.json({ 
      sellAllowance: user?.sellAllowance || 0,
      unlimited: !user?.sellAllowance || user.sellAllowance === 0
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.setUserSellAllowance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sellAllowance } = req.body;

    if (sellAllowance < 0) {
      return res.status(400).json({ message: 'Sell allowance cannot be negative' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        sellAllowance,
        sellAllowanceUpdatedAt: new Date(),
        sellAllowanceSetBy: req.user._id
      },
      { new: true }
    ).select('name email sellAllowance sellAllowanceUpdatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Get delivery staff shift schedule
exports.getDeliveryShiftSchedule = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    // Get user with assigned shift
    const user = await User.findById(staffId).populate('assignedShift');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get current week dates
      const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get all active shifts
    const allShifts = await Shift.find({ isActive: true })
      .populate('assignedStaff', 'name email role')
      .sort({ startTime: 1 });

    // Format all shifts for display
    const formattedShifts = allShifts.map(shift => ({
      _id: shift._id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      duration: shift.duration,
      gracePeriod: shift.gracePeriod,
      description: shift.description,
      isActive: shift.isActive,
      assignedStaffCount: shift.assignedStaff.length
    }));

    // Format my assignment
    let myAssignment = null;
    if (user.assignedShift) {
      const shift = user.assignedShift;
      myAssignment = {
        _id: shift._id,
        name: shift.name,
        shiftType: shift.name.includes('Morning') ? 'Morning' : 
                   shift.name.includes('Evening') ? 'Evening' : 
                   shift.name.includes('Night') ? 'Night' : 'Regular',
        startTime: shift.startTime,
        endTime: shift.endTime,
        duration: shift.duration,
        gracePeriod: shift.gracePeriod,
        description: shift.description,
        days: [0, 1, 2, 3, 4, 5, 6] // Assume working all days, can be customized
      };
    }

    const response = {
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString(),
      myAssignment,
      allShifts: formattedShifts
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching delivery shift schedule:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};