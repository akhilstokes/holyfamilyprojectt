const Chemical = require('../models/chemicalModel');

exports.listChemicals = async (req, res) => {
  try {
    const list = await Chemical.find({}).sort({ name: 1 });
    const enriched = list.map(c => ({
      _id: c._id,
      name: c.name,
      unit: c.unit,
      minThreshold: c.minThreshold,
      reorderPoint: c.reorderPoint,
      safetyStock: c.safetyStock,
      onHand: c.onHand(),
      lots: c.lots,
    }));
    res.json(enriched);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addOrUpdateChemical = async (req, res) => {
  try {
    const { name, unit, minThreshold, reorderPoint, safetyStock } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    let chem = await Chemical.findOne({ name });
    if (!chem) chem = new Chemical({ name });
    if (unit) chem.unit = unit;
    if (minThreshold != null) chem.minThreshold = minThreshold;
    if (reorderPoint != null) chem.reorderPoint = reorderPoint;
    if (safetyStock != null) chem.safetyStock = safetyStock;
    await chem.save();
    res.json(chem);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addLot = async (req, res) => {
  try {
    const { name } = req.params;
    const { lotNo, quantity, unitCost, receivedAt, expiresAt } = req.body;
    let chem = await Chemical.findOne({ name });
    if (!chem) chem = new Chemical({ name });
    chem.lots.push({ lotNo, quantity, unitCost, receivedAt, expiresAt });
    await chem.save();
    res.status(201).json(chem);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.issue = async (req, res) => {
  try {
    const { name } = req.params;
    const { quantity } = req.body; // FIFO consume
    let chem = await Chemical.findOne({ name });
    if (!chem) return res.status(404).json({ message: 'Chemical not found' });
    let remain = Number(quantity);
    for (const lot of chem.lots) {
      if (remain <= 0) break;
      const take = Math.min(lot.quantity, remain);
      lot.quantity -= take;
      remain -= take;
    }
    // Remove empty lots
    chem.lots = chem.lots.filter(l => (l.quantity || 0) > 0);
    await chem.save();
    res.json({ name: chem.name, onHand: chem.onHand(), lots: chem.lots });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.alerts = async (req, res) => {
  try {
    const list = await Chemical.find({});
    const today = new Date();
    const soon = new Date(); soon.setDate(soon.getDate() + 14);
    const low = [];
    const expiring = [];
    list.forEach(c => {
      if (c.onHand() <= (c.minThreshold || 0)) low.push({ name: c.name, onHand: c.onHand() });
      c.lots.forEach(l => { if (l.expiresAt && l.expiresAt <= soon && l.quantity > 0) expiring.push({ name: c.name, lotNo: l.lotNo, expiresAt: l.expiresAt }); });
    });
    res.json({ low, expiring });
  } catch (e) { res.status(500).json({ message: e.message }); }
};


