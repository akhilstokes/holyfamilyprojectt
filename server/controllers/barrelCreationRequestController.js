const BarrelCreationRequest = require('../models/barrelCreationRequestModel');
const BarrelRequest = require('../models/barrelRequestModel');

// Manager: Create request to admin for barrel creation
exports.createBarrelCreationRequest = async (req, res) => {
  try {
    const { userBarrelRequestId, quantity, notes } = req.body;

    // Validate
    if (!quantity || quantity < 1 || quantity > 50) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 50' });
    }

    // Get user barrel request details if provided
    let userName, userEmail;
    if (userBarrelRequestId) {
      const userRequest = await BarrelRequest.findById(userBarrelRequestId).populate('user', 'name email');
      if (userRequest) {
        userName = userRequest.user?.name;
        userEmail = userRequest.user?.email;
      }
    }

    const newRequest = await BarrelCreationRequest.create({
      requestedBy: req.user._id,
      userBarrelRequest: userBarrelRequestId || null,
      userName,
      userEmail,
      quantity,
      notes: notes || `Request to create ${quantity} barrel(s)`,
      status: 'pending'
    });

    const populated = await BarrelCreationRequest.findById(newRequest._id)
      .populate('requestedBy', 'name email')
      .populate('userBarrelRequest');

    return res.status(201).json(populated);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Admin: List all barrel creation requests
exports.listBarrelCreationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await BarrelCreationRequest.find(filter)
      .populate('requestedBy', 'name email')
      .populate('userBarrelRequest')
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Admin: Update status of barrel creation request
exports.updateBarrelCreationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, createdBarrels } = req.body;

    const updated = await BarrelCreationRequest.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(adminNotes && { adminNotes }),
        ...(createdBarrels && { createdBarrels })
      },
      { new: true }
    ).populate('requestedBy', 'name email');

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Admin: Mark request as completed
exports.completeBarrelCreationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { barrelIds } = req.body;

    const updated = await BarrelCreationRequest.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        createdBarrels: barrelIds || [],
        adminNotes: `Created ${barrelIds?.length || 0} barrel(s)`
      },
      { new: true }
    ).populate('requestedBy', 'name email');

    if (!updated) {
      return res.status(404).json({ message: 'Request not found' });
    }

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

