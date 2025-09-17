const SalesEntry = require('../models/salesEntryModel');

exports.createEntry = async (req, res) => {
  try {
    const { date, amount, notes = '' } = req.body;
    if (!date || amount === undefined) {
      return res.status(400).json({ message: 'date and amount are required' });
    }
    const entry = await SalesEntry.create({
      user: req.user._id,
      date: new Date(date),
      amount: Number(amount),
      notes,
    });
    return res.status(201).json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listMyEntries = async (req, res) => {
  try {
    const { year } = req.query;
    const query = { user: req.user._id };
    if (year) {
      const y = Number(year);
      const start = new Date(y, 0, 1);
      const end = new Date(y + 1, 0, 1);
      query.date = { $gte: start, $lt: end };
    }
    const list = await SalesEntry.find(query).sort({ date: 1 });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.yearlySummary = async (req, res) => {
  try {
    const y = Number(req.params.year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    const result = await SalesEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { m: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $project: { month: '$_id.m', total: 1, _id: 0 } },
      { $sort: { month: 1 } },
    ]);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Simple prediction: linear fit over monthly totals of current year
exports.predictNextYear = async (req, res) => {
  try {
    const y = Number(req.params.year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    const monthly = await SalesEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      { $group: { _id: { m: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $project: { m: '$_id.m', total: 1, _id: 0 } },
      { $sort: { m: 1 } },
    ]);
    if (monthly.length < 2) return res.json({ predictedNextYearTotal: null, monthlyProjection: [] });

    const points = monthly.map((r) => ({ x: r.m, y: r.total }));
    const n = points.length;
    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXX = points.reduce((a, p) => a + p.x * p.x, 0);
    const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return res.json({ predictedNextYearTotal: null, monthlyProjection: [] });
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    const projection = [];
    let total = 0;
    for (let m = 1; m <= 12; m++) {
      const val = Math.max(0, slope * m + intercept);
      projection.push({ month: m, total: Math.round(val) });
      total += val;
    }
    return res.json({ predictedNextYearTotal: Math.round(total), monthlyProjection: projection });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error', error: e.message });
  }
};


