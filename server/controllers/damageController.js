const Barrel = require('../models/barrelModel');
const BarrelDamage = require('../models/barrelDamageModel');

exports.reportDamage = async (req, res) => {
  try {
    const { barrelId, damageType, lumbPercent, remarks, source } = req.body;
    const barrel = await Barrel.findOne({ _id: barrelId }).lean();
    if (!barrel) return res.status(404).json({ message: 'Barrel not found' });

    const doc = await BarrelDamage.create({
      barrelId,
      reportedBy: req.user._id,
      source: source || 'lab',
      damageType,
      lumbPercent,
      remarks,
      status: 'open',
    });

    // Update barrel quick fields
    const upd = await Barrel.findById(barrelId);
    if (upd) {
      upd.condition = 'damaged';
      upd.damageType = damageType || 'other';
      if (damageType === 'lumbed') upd.currentLocation = 'lumb-bay';
      await upd.save();
    }

    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.listDamages = async (req, res) => {
  try {
    const { status, barrelId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (barrelId) q.barrelId = barrelId;
    const list = await BarrelDamage.find(q).sort({ createdAt: -1 }).populate('reportedBy', 'name').lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.assignNextStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; // 'lumb-removal' | 'repair' | 'scrap' | 'inspection'
    const dmg = await BarrelDamage.findById(id);
    if (!dmg) return res.status(404).json({ message: 'Damage not found' });
    dmg.assignedTo = assignedTo || null;
    dmg.status = 'assigned';
    await dmg.save();

    // update barrel location/condition hints
    const barrel = await Barrel.findById(dmg.barrelId);
    if (barrel) {
      if (assignedTo === 'lumb-removal') {
        barrel.currentLocation = 'lumb-bay';
        barrel.condition = 'lumb-removal';
      } else if (assignedTo === 'repair') {
        barrel.currentLocation = 'repair-bay';
        barrel.condition = 'repair';
      } else if (assignedTo === 'scrap') {
        barrel.currentLocation = 'scrap-yard';
        barrel.condition = 'scrap';
      }
      await barrel.save();
    }

    res.json(dmg);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
