const Capacity = require('../models/capacityModel');

// @desc Get current capacity usage
// @route GET /api/capacity
exports.getCapacity = async (req, res) => {
  try {
    let cap = await Capacity.findOne({});
    if (!cap) {
      cap = await Capacity.create({
        dryer: { usedKg: 0, totalKg: 0 },
        godown: { usedPallets: 0, totalPallets: 0 },
      });
    }
    return res.json(cap);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc Update capacity usage/limits (partial updates allowed)
// @route PUT /api/capacity
exports.updateCapacity = async (req, res) => {
  try {
    let cap = await Capacity.findOne({});
    if (!cap) {
      cap = new Capacity({});
    }

    const { dryer, godown } = req.body;
    if (dryer) {
      if (typeof dryer.usedKg === 'number') cap.dryer.usedKg = Math.max(0, dryer.usedKg);
      if (typeof dryer.totalKg === 'number') cap.dryer.totalKg = Math.max(0, dryer.totalKg);
    }
    if (godown) {
      if (typeof godown.usedPallets === 'number') cap.godown.usedPallets = Math.max(0, godown.usedPallets);
      if (typeof godown.totalPallets === 'number') cap.godown.totalPallets = Math.max(0, godown.totalPallets);
    }

    const saved = await cap.save();
    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
















































