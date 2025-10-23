const HangerSpace = require('../models/hangerSpaceModel');
const mongoose = require('mongoose');

// Normalize inputs
const toKey = ({ block, row, col }) => `${block}-${row}-${col}`;

exports.list = async (req, res) => {
  try {
    const spaces = await HangerSpace.find().sort({ block: 1, row: 1, col: 1 });
    res.json(spaces);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.vacant = async (req, res) => {
  try {
    const spaces = await HangerSpace.find({ status: 'vacant' }).sort({ block: 1, row: 1, col: 1 });
    res.json(spaces);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.seedGrid = async (req, res) => {
  // Create all slots for A/B blocks, rows D-L, cols 1..10 if missing
  const VALID_ROWS = ['D','E','F','G','H','I','J','K','L'];
  const blocks = ['A', 'B'];
  try {
    let created = 0;
    for (const block of blocks) {
      for (const row of VALID_ROWS) {
        for (let col = 1; col <= 10; col++) {
          const exists = await HangerSpace.findOne({ block, row, col });
          if (!exists) {
            await HangerSpace.create({ block, row, col, status: 'vacant', updatedBy: req.user?._id || 'system' });
            created++;
          }
        }
      }
    }
    res.json({ message: 'Grid seeded', created });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { block, row, col, status, product } = req.body;
    if (!block || !row || !col) return res.status(400).json({ message: 'block, row, col required' });
    const allowed = ['vacant','occupied','empty_barrel','complete_bill'];
    const update = { block, row, col, status: allowed.includes(status) ? status : 'vacant', product: product || '', updatedBy: req.user?._id || 'system', updatedAt: new Date() };
    const doc = await HangerSpace.findOneAndUpdate({ block, row, col }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(doc);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Duplicate slot' });
    res.status(500).json({ message: e.message });
  }
};

exports.markStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { status, product } = req.body;
    if (!['vacant','occupied','empty_barrel','complete_bill'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const doc = await HangerSpace.findByIdAndUpdate(id, { status, product: product || '', updatedBy: req.user?._id || 'system', updatedAt: new Date() }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Slot not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await HangerSpace.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Staff can claim a vacant slot or free their assigned slot
exports.staffAssign = async (req, res) => {
  try {
    const { id } = req.params; // slot id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const { action, product } = req.body; // action: 'claim' or 'free'
    const slot = await HangerSpace.findById(id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (action === 'claim') {
      if (slot.status !== 'vacant') return res.status(400).json({ message: 'Slot is not vacant' });
      slot.status = 'occupied';
      slot.product = product || '';
      slot.updatedBy = req.user?._id || 'system';
      slot.updatedAt = new Date();
      await slot.save();
      return res.json(slot);
    }

    if (action === 'free') {
      if (!['occupied','empty_barrel','complete_bill'].includes(slot.status)) return res.status(400).json({ message: 'Slot already vacant' });
      slot.status = 'vacant';
      slot.product = '';
      slot.updatedBy = req.user?._id || 'system';
      slot.updatedAt = new Date();
      await slot.save();
      return res.json(slot);
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};