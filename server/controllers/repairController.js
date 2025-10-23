const Barrel = require('../models/barrelModel');
const BarrelDamage = require('../models/barrelDamageModel');
const BarrelRepair = require('../models/barrelRepairModel');
const { openJob, appendWorkLog, completeJob, approve, reject } = require('../services/repairService');

exports.open = async (req, res) => {
  try {
    const { barrelId, type } = req.body;
    const job = await openJob(barrelId, type, req.user._id);
    res.status(201).json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.logProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, note } = req.body;
    const job = await appendWorkLog(id, step, note, req.user._id);
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await completeJob(id, req.user._id);
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await approve(id, req.user._id);
    // close any open damage for this barrel
    await BarrelDamage.updateMany({ barrelId: job.barrelId, status: { $in: ['open', 'assigned'] } }, { status: 'resolved' });
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await reject(id, req.user._id);
    res.json(job);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { status, type, barrelId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (type) q.type = type;
    if (barrelId) q.barrelId = barrelId;
    const list = await BarrelRepair.find(q).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
