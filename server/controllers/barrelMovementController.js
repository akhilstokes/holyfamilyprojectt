const Barrel = require('../models/barrelModel');
const BarrelMovement = require('../models/barrelMovementModel');

// Create a movement log and update barrel accordingly
exports.createMovement = async (req, res) => {
  try {
    const { barrelId, type, volumeDelta = 0, fromLocation = '', toLocation = '', notes = '' } = req.body;
    if (!barrelId || !type) {
      return res.status(400).json({ message: 'barrelId and type are required' });
    }

    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    // Update location if move
    if (type === 'move') {
      barrel.lastKnownLocation = toLocation || barrel.lastKnownLocation;
    }

    // Adjust volume and status if in/out
    if (type === 'in' || type === 'out') {
      const delta = Number(volumeDelta) || 0;
      const signed = type === 'out' ? -Math.abs(delta) : Math.abs(delta);
      const next = (barrel.currentVolume || 0) + signed;
      // Clamp 0..capacity
      barrel.currentVolume = Math.max(0, Math.min(next, barrel.capacity));
      if (barrel.currentVolume > 0 && barrel.status === 'in-storage') barrel.status = 'in-use';
      if (barrel.currentVolume === 0 && barrel.status === 'in-use') barrel.status = 'in-storage';
    }

    barrel.lastUpdatedBy = req.user?._id;
    await barrel.save();

    const movement = await BarrelMovement.create({
      barrel: barrel._id,
      type,
      volumeDelta,
      fromLocation,
      toLocation,
      notes,
      createdBy: req.user?._id,
    });

    return res.status(201).json({ message: 'Movement logged', barrel, movement });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// List movements for a barrel
exports.getMovements = async (req, res) => {
  try {
    const { barrelId } = req.params;
    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    const logs = await BarrelMovement.find({ barrel: barrel._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Admin approvals for purchase/disposal
exports.requestDisposal = async (req, res) => {
  try {
    const { barrelId } = req.body;
    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    barrel.disposalRequested = true;
    await barrel.save();
    return res.json({ message: 'Disposal requested', barrel });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.approveDisposal = async (req, res) => {
  try {
    const { barrelId } = req.body;
    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    barrel.status = 'disposed';
    barrel.currentVolume = 0;
    barrel.disposalRequested = false;
    await barrel.save();
    return res.json({ message: 'Disposal approved', barrel });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.approvePurchase = async (req, res) => {
  try {
    const { barrelId } = req.body;
    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    barrel.purchaseApproved = true;
    await barrel.save();
    return res.json({ message: 'Purchase approved', barrel });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};