const Barrel = require('../models/barrelModel');
const BarrelScrape = require('../models/barrelScrapeModel');

// Create a scraping entry for a barrel by serial barrelId
exports.createScrape = async (req, res) => {
  try {
    const { barrelId, totalWeightKg, lumpRubberKg, moisturePercent = null, notes = '' } = req.body;

    if (!barrelId || totalWeightKg === undefined || lumpRubberKg === undefined) {
      return res.status(400).json({ message: 'barrelId, totalWeightKg and lumpRubberKg are required' });
    }

    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) {
      return res.status(404).json({ message: 'Barrel not found' });
    }

    const total = Number(totalWeightKg);
    const lump = Number(lumpRubberKg);
    if (Number.isNaN(total) || Number.isNaN(lump) || total < 0 || lump < 0) {
      return res.status(400).json({ message: 'Invalid weights provided' });
    }

    const yieldPercent = total > 0 ? Math.max(0, Math.min(100, (lump / total) * 100)) : null;

    const entry = await BarrelScrape.create({
      barrel: barrel._id,
      barrelId: barrel.barrelId,
      totalWeightKg: total,
      lumpRubberKg: lump,
      moisturePercent: moisturePercent === null ? null : Number(moisturePercent),
      yieldPercent,
      notes,
      createdBy: req.user._id,
    });

    return res.status(201).json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// List scraping entries
exports.listScrapes = async (req, res) => {
  try {
    const { barrelId, userId, limit = 50 } = req.query;
    const query = {};
    if (barrelId) query.barrelId = barrelId;
    if (userId) query.createdBy = userId;

    const list = await BarrelScrape.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 50, 200))
      .populate('barrel', 'barrelId capacity currentVolume status')
      .populate('createdBy', 'name email');

    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};


