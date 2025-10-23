const DeliveryTask = require('../models/deliveryTaskModel');
const Notification = require('../models/Notification');
const DeliveryIntake = require('../models/deliveryIntakeModel');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');
const StaffLocation = require('../models/StaffLocation');

// Create a delivery task (admin/manager)
exports.createTask = async (req, res) => {
  try {
    const { title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes } = req.body;
    if (!title || !assignedTo || !pickupAddress || !dropAddress) {
      return res.status(400).json({ message: 'title, assignedTo, pickupAddress and dropAddress are required' });
    }
    const doc = await DeliveryTask.create({ title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes });

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

// Manager verify intake (mark as manager_verified)
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
        meta: { intakeId: doc._id }
      });
    }
    return res.json({ success: true, intake: doc, task });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to verify intake', error: e.message });
  }
};

// Get single intake by id
exports.getIntake = async (req, res) => {
  try {
    const doc = await DeliveryIntake.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    return res.json({ intake: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load intake', error: e.message });
  }
};

// Update intake fields (name, phone, barrelCount, notes, status, companyBarrel) - admin/manager/accountant
exports.updateIntake = async (req, res) => {
  try {
    const updates = (({ name, phone, barrelCount, notes, status, pricePerBarrel, totalAmount, companyBarrel }) => ({ name, phone, barrelCount, notes, status, pricePerBarrel, totalAmount, companyBarrel }))(req.body || {});
    const doc = await DeliveryIntake.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    try {
      if (doc.createdBy && (updates.barrelCount != null || updates.companyBarrel != null)) {
        await Notification.create({
          userId: doc.createdBy,
          role: 'user',
          title: 'Sell request updated',
          message: `Your sell request has been updated${updates.barrelCount != null ? `: barrel count = ${updates.barrelCount}` : ''}${updates.companyBarrel != null ? `, company barrel = ${updates.companyBarrel}` : ''}.`,
          link: '/user/requests',
          meta: { intakeId: doc._id, type: 'SELL_BARRELS' }
        });
      }
    } catch (_) { /* ignore notification errors */ }
    return res.json({ intake: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update intake', error: e.message });
  }
};

// Delete intake
exports.deleteIntake = async (req, res) => {
  try {
    const doc = await DeliveryIntake.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete intake', error: e.message });
  }
};

// Admin/Manager: list all tasks with optional status filter and basic pagination
exports.listAllTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query || {};
    const q = {};
    if (status) q.status = status;
    const skip = (Math.max(Number(page), 1) - 1) * Math.max(Number(limit), 1);
    const [items, total] = await Promise.all([
      DeliveryTask.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      DeliveryTask.countDocuments(q)
    ]);
    return res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Get single task by id
exports.getTask = async (req, res) => {
  try {
    const doc = await DeliveryTask.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Task not found' });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update task fields (admin/manager only)
exports.updateTask = async (req, res) => {
  try {
    const updates = (({ title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes, status }) => ({ title, customerUserId, assignedTo, pickupAddress, dropAddress, scheduledAt, notes, status }))(req.body || {});
    const doc = await DeliveryTask.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Task not found' });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update task', error: e.message });
  }
};

// Delete task (admin/manager only)
exports.deleteTask = async (req, res) => {
  try {
    const doc = await DeliveryTask.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Task not found' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to delete task', error: e.message });
  }
};

// Helper: compute remaining allowance for a user (0 or undefined allowance means unlimited)
async function computeRemainingAllowance(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return { allowance: 0, used: 0, remaining: 0 };
  const allowance = Number(user.sellAllowance || 0);
  if (!Number.isFinite(allowance) || allowance <= 0) {
    // Unlimited when not set or 0
    return { allowance: 0, used: 0, remaining: Infinity };
  }
  const activeStatuses = ['pending', 'manager_verified', 'approved'];
  const used = await DeliveryIntake.aggregate([
    { $match: { createdBy: user._id, status: { $in: activeStatuses } } },
    { $group: { _id: null, total: { $sum: '$barrelCount' } } }
  ]).then(a => (a[0]?.total || 0));
  const remaining = Math.max(allowance - Number(used || 0), 0);
  return { allowance, used, remaining };
}

// Record delivery barrel intake (delivery staff)
exports.intakeBarrels = async (req, res) => {
  try {
    const { name, phone, barrelCount, notes, location, locationAccuracy } = req.body || {};
    if (!name || !phone || barrelCount === undefined) {
      return res.status(400).json({ message: 'name, phone, and barrelCount are required' });
    }
    const count = Number(barrelCount);
    if (!Number.isFinite(count) || count < 1) {
      return res.status(400).json({ message: 'barrelCount must be at least 1' });
    }
    // Enforce user allowance if configured
    const { allowance, remaining } = await computeRemainingAllowance(req.user._id);
    if (Number.isFinite(remaining) && count > remaining) {
      return res.status(400).json({ message: `Requested barrels (${count}) exceed remaining allowance (${remaining})`, code: 'ALLOWANCE_EXCEEDED', allowance, remaining });
    }
    const doc = await DeliveryIntake.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      barrelCount: count,
      notes: notes ? String(notes) : undefined,
      createdBy: req.user._id,
      status: 'pending',
      ...(location && location.type === 'Point' && Array.isArray(location.coordinates) && location.coordinates.length === 2
        ? { location: { type: 'Point', coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])] } }
        : {}),
      ...(locationAccuracy !== undefined ? { locationAccuracy: Number(locationAccuracy) } : {}),
    });
    return res.status(201).json({ success: true, intake: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to record intake', error: e.message });
  }
};

// Get my allowance and remaining
exports.getMySellAllowance = async (req, res) => {
  try {
    const { allowance, used, remaining } = await computeRemainingAllowance(req.user._id);
    return res.json({ success: true, allowance, used, remaining });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load allowance', error: e.message });
  }
};

// Set a user's allowance (admin/manager)
exports.setUserSellAllowance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { allowance } = req.body || {};
    const value = Number(allowance || 0);
    if (!Number.isFinite(value) || value < 0) return res.status(400).json({ message: 'allowance must be >= 0' });
    const user = await User.findByIdAndUpdate(userId, { sellAllowance: value, sellAllowanceUpdatedAt: new Date(), sellAllowanceSetBy: req.user._id }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const metrics = await computeRemainingAllowance(user._id);
    return res.json({ success: true, userId: user._id, ...metrics });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to set allowance', error: e.message });
  }
};

// List intakes (filter by status) for accountant/manager/admin
exports.listIntakes = async (req, res) => {
  try {
    const { status } = req.query || {};
    const q = {};
    if (status) q.status = status;
    const items = await DeliveryIntake.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load intakes', error: e.message });
  }
};

// List my intakes (created by current user)
exports.listMyIntakes = async (req, res) => {
  try {
    const items = await DeliveryIntake.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load my intakes', error: e.message });
  }
};

// Approve intake and set price to compute total amount (accountant/manager/admin)
exports.approveIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerBarrel } = req.body || {};
    const doc = await DeliveryIntake.findById(id);
    if (!doc) return res.status(404).json({ message: 'Intake not found' });
    if (pricePerBarrel === undefined || pricePerBarrel === null) {
      return res.status(400).json({ message: 'pricePerBarrel is required' });
    }
    const rate = Number(pricePerBarrel);
    doc.pricePerBarrel = rate;
    doc.totalAmount = Math.round(Number(doc.barrelCount || 0) * rate);
    doc.status = 'approved';
    doc.approvedAt = new Date();
    doc.approvedBy = req.user._id;
    await doc.save();
    return res.json({ success: true, intake: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to approve intake', error: e.message });
  }
};

// List tasks for current staff (or filter)
exports.listMyTasks = async (req, res) => {
  try {
    const q = {};
    if (req.user.role === 'delivery_staff') {
      q.assignedTo = req.user._id;
    }
    if (req.query.status) q.status = req.query.status;
    const list = await DeliveryTask.find(q).sort({ scheduledAt: 1, createdAt: -1 });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update status (assigned staff or admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meta } = req.body;
    const task = await DeliveryTask.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const canUpdate = req.user.role === 'admin' || String(task.assignedTo) === String(req.user._id);
    if (!canUpdate) return res.status(403).json({ message: 'Not authorized' });

    // Allowed transitions
    const allowed = {
      pickup_scheduled: ['enroute_pickup', 'cancelled'],
      enroute_pickup: ['picked_up', 'cancelled'],
      picked_up: ['enroute_drop', 'cancelled'],
      enroute_drop: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };
    const validStatuses = Object.keys(allowed);
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (status) {
      const current = task.status || 'pickup_scheduled';
      if (current !== status) {
        const nexts = allowed[current] || [];
        if (!nexts.includes(status)) {
          return res.status(400).json({ message: `Illegal transition from ${current} to ${status}` });
        }
      }
      // Stamp timeline
      const now = new Date();
      if (status === 'enroute_pickup') task.meta.set('pickupStartedAt', now);
      if (status === 'picked_up') task.meta.set('pickedUpAt', now);
      if (status === 'enroute_drop') task.meta.set('dropStartedAt', now);
      if (status === 'delivered') task.meta.set('deliveredAt', now);
      if (status === 'cancelled') {
        task.meta.set('cancelledAt', now);
        if (meta?.reason) task.meta.set('cancelReason', String(meta.reason));
      }
      task.status = status;
    }

    if (meta && typeof meta === 'object') {
      Object.entries(meta).forEach(([k, v]) => task.meta.set(k, v));
    }
    await task.save();

    // Notifications on key transitions
    if (task.customerUserId) {
      if (status === 'enroute_pickup') {
        await Notification.create({ userId: task.customerUserId, role: 'user', title: 'Pickup Enroute', message: 'Our staff is on the way for pickup', link: '/user/notifications', meta: { taskId: task._id } });
      }
      if (status === 'picked_up') {
        await Notification.create({ userId: task.customerUserId, role: 'user', title: 'Pickup Completed', message: 'Your barrels have been picked up', link: '/user/notifications', meta: { taskId: task._id } });
        // Try to email the user as well
        try {
          const user = await User.findById(task.customerUserId).lean();
          const emailTo = meta?.notifyEmail || user?.email;
          if (emailTo) {
            await sendEmail({
              email: emailTo,
              subject: 'HFP: Barrels Picked Up',
              message: `Hello, your delivery task "${task.title}" has been picked up. Task ID: ${task._id}`,
            });
          }
        } catch (_) { /* ignore email errors */ }
      }
      if (status === 'delivered') {
        await Notification.create({ userId: task.customerUserId, role: 'user', title: 'Delivery Completed', message: 'Delivery has been completed', link: '/user/notifications', meta: { taskId: task._id } });
      }
    }

    return res.json(task);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// --- Live location: delivery staff updates their current location ---
exports.updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, meta } = req.body || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: 'latitude and longitude (numbers) are required' });
    }
    const payload = {
      user: req.user._id,
      role: req.user.role,
      coords: { lat: latitude, lng: longitude, accuracy: accuracy != null ? Number(accuracy) : undefined },
      meta: meta && typeof meta === 'object' ? meta : {},
      updatedAt: new Date(),
    };
    const doc = await StaffLocation.findOneAndUpdate(
      { user: req.user._id },
      { $set: payload },
      { upsert: true, new: true }
    );
    return res.json({ success: true, location: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to update location', error: e.message });
  }
};

// --- Manager/Admin: list recent staff locations (optionally filter by role) ---
exports.listStaffLocations = async (req, res) => {
  try {
    const { role } = req.query || {};
    const q = {};
    if (role) q.role = role;
    const items = await StaffLocation.find(q).populate('user', 'name email role').sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, items });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load staff locations', error: e.message });
  }
};
