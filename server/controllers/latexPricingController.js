const LatexIntake = require('../models/latexIntakeModel');
const Rate = require('../models/rateModel');

// Helper to get latest company rate per kg DRC for product latex60
async function getLatestRatePerKgDRC(product = 'latex60') {
  const latest = await Rate.findOne({ product }).sort({ effectiveDate: -1, createdAt: -1 });
  if (!latest) return null;
  // If "unit" is "per 100 Kg", convert to per Kg
  // companyRate is assumed per Kg if unit says so; otherwise fallback to companyRate/100
  const unit = (latest.unit || '').toLowerCase();
  const perKg = unit.includes('100') ? Number(latest.companyRate) / 100 : Number(latest.companyRate);
  return { perKg, rateDoc: latest };
}

// POST /api/latex-pricing/price-batch { date: 'YYYY-MM-DD', specialRatePerKgDRC?: number }
// Applies pricing to all intakes on the given date and returns a summary. Does not mutate intake docs yet.
exports.priceBatch = async (req, res) => {
  try {
    const { date, specialRatePerKgDRC } = req.body || {};
    if (!date) {
      return res.status(400).json({ message: 'Field "date" (YYYY-MM-DD) is required' });
    }

    const start = new Date(date);
    const end = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);

    // Load intakes for the day
    const intakes = await LatexIntake.find({ batchDate: { $gte: start, $lt: end } });

    if (!intakes.length) {
      return res.json({ message: 'No intakes for the selected date', count: 0, totalDryKg: 0, totalAmount: 0, ratePerKgDRC: specialRatePerKgDRC || null });
    }

    // Resolve rate per kg DRC
    let ratePerKgDRC = null;
    if (specialRatePerKgDRC != null && !Number.isNaN(Number(specialRatePerKgDRC))) {
      ratePerKgDRC = Number(specialRatePerKgDRC);
    } else {
      const latest = await getLatestRatePerKgDRC('latex60');
      if (!latest) {
        return res.status(400).json({ message: 'No company rate found. Please add a rate first.' });
      }
      ratePerKgDRC = latest.perKg;
    }

    // Compute totals
    let totalDryKg = 0;
    let totalAmount = 0;
    const items = intakes.map((it) => {
      const dryKg = Number(it.netLatexKg || 0) * (Number(it.computedDRC || 0) / 100);
      const amount = dryKg * ratePerKgDRC;
      totalDryKg += dryKg;
      totalAmount += amount;
      return {
        intakeId: it._id,
        barrelId: it.barrel?.toString?.() || null,
        netLatexKg: it.netLatexKg,
        computedDRC: it.computedDRC,
        dryKg: Number(dryKg.toFixed(2)),
        amount: Number(amount.toFixed(2)),
      };
    });

    return res.json({
      message: 'Pricing simulated successfully',
      count: intakes.length,
      ratePerKgDRC,
      totalDryKg: Number(totalDryKg.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      items,
    });
  } catch (err) {
    console.error('Error pricing latex batch:', err);
    return res.status(500).json({ message: 'Pricing failed' });
  }
};