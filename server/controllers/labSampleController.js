const LabSample = require('../models/labSampleModel');
const SellRequest = require('../models/sellRequestModel');

// Lab dashboard summary KPIs
exports.getSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const pendingCount = await SellRequest.countDocuments({ status: 'DELIVERED_TO_LAB' });
    const testedToday = await SellRequest.find({ status: 'TESTED', testedAt: { $gte: startOfDay, $lte: endOfDay } })
      .select('drcPct')
      .lean();
    const doneToday = testedToday.length;
    const avgDrcToday = doneToday > 0
      ? Math.round((testedToday.reduce((sum, d) => sum + (Number(d.drcPct) || 0), 0) / doneToday) * 100) / 100
      : 0;

    return res.json({ pendingCount, doneToday, avgDrcToday });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load summary' });
  }
};

// Accept lab samples into the lab inventory
exports.sampleCheckIn = async (req, res) => {
  try {
    const { sampleId, customerName, supplier, batch, quantityLiters, receivedAt, notes, barrelCount, barrels } = req.body || {};
    if (!sampleId || quantityLiters == null) {
      return res.status(400).json({ message: 'sampleId and quantityLiters are required' });
    }
    const doc = await LabSample.create({
      sampleId: String(sampleId).trim(),
      customerName: customerName ? String(customerName) : '',
      supplier: supplier ? String(supplier) : '',
      batch: batch ? String(batch) : '',
      quantityLiters: Number(quantityLiters),
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      notes: notes ? String(notes) : '',
      barrelCount: barrelCount != null ? Number(barrelCount) : 0,
      barrels: Array.isArray(barrels) ? barrels.map(b => ({ barrelId: String(b.barrelId || ''), liters: b.liters != null ? Number(b.liters) : null })) : [],
      receivedBy: req.user && req.user._id ? req.user._id : null,
    });
    return res.status(201).json({ success: true, sample: doc });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to check in sample', error: e.message });
  }
};

// Get pending samples for lab processing
exports.getPendingSamples = async (req, res) => {
  try {
    const pendingSamples = await SellRequest.find({ status: 'DELIVERED_TO_LAB' })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    return res.json(pendingSamples);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load pending samples', error: e.message });
  }
};

// Get samples processed today
exports.getTodaySamples = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySamples = await SellRequest.find({ 
      status: 'TESTED', 
      testedAt: { $gte: startOfDay, $lte: endOfDay } 
    })
      .populate('user', 'name email phone')
      .sort({ testedAt: -1 })
      .lean();
    
    return res.json(todaySamples);
  } catch (e) {
    return res.status(500).json({ message: 'Failed to load today samples', error: e.message });
  }
};