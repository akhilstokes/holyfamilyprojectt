const LatexIntake = require('../models/latexIntakeModel');
const Barrel = require('../models/barrelModel');

// GET /api/latex-intake?date=YYYY-MM-DD
// Admin-only: return all latex intakes for the given calendar date
exports.getIntakesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Query parameter "date" (YYYY-MM-DD) is required' });
    }

    // Build start/end of the provided day in server timezone
    const start = new Date(date);
    const end = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);

    const intakes = await LatexIntake.find({
      batchDate: { $gte: start, $lt: end },
    })
      .populate('barrel', 'barrelId')
      .sort({ createdAt: -1 });

    return res.json(intakes || []);
  } catch (err) {
    console.error('Error loading latex intakes by date:', err);
    return res.status(500).json({ message: 'Failed to load intakes' });
  }
};

// POST /api/latex-intake
// Staff: create a new latex intake record
exports.createIntake = async (req, res) => {
  try {
    const { barrelId, batchDate, grossKg, tareKg, ammoniumKg, otherChemicalsKg, measuredDRC } = req.body;
    
    if (!barrelId || !batchDate || grossKg === undefined || tareKg === undefined) {
      return res.status(400).json({ message: 'barrelId, batchDate, grossKg, and tareKg are required' });
    }

    // Find the barrel
    const barrel = await Barrel.findOne({ barrelId });
    if (!barrel) {
      return res.status(404).json({ message: 'Barrel not found' });
    }

    const netKg = Math.max(0, Number(grossKg) - Number(tareKg));
    const dryEst = Math.max(0, netKg - (Number(ammoniumKg) || 0) - (Number(otherChemicalsKg) || 0));
    const drc = measuredDRC ? Number(measuredDRC) : (netKg > 0 ? (dryEst / netKg * 100) : 0);

    const intake = await LatexIntake.create({
      barrel: barrel._id,
      barrelId,
      batchDate: new Date(batchDate),
      grossKg: Number(grossKg),
      tareKg: Number(tareKg),
      netKg,
      ammoniumKg: Number(ammoniumKg) || 0,
      otherChemicalsKg: Number(otherChemicalsKg) || 0,
      measuredDRC: measuredDRC ? Number(measuredDRC) : undefined,
      calculatedDRC: drc,
      dryKg: netKg * (drc / 100),
      recordedBy: req.user._id
    });

    return res.status(201).json(intake);
  } catch (err) {
    console.error('Error creating latex intake:', err);
    return res.status(500).json({ message: 'Failed to create intake' });
  }
};