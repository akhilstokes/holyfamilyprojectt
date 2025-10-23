const LabSample = require('../models/labSampleModel');

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
