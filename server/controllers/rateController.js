const Rate = require("../models/rateModel");

// Add or update today's rate
exports.updateRate = async (req, res) => {
  try {
    const { marketRate, companyRate, source } = req.body;

    if (marketRate == null || companyRate == null) {
      return res.status(400).json({ message: "Both marketRate and companyRate are required" });
    }

    // Always store latest as a new entry
    const rate = new Rate({ marketRate, companyRate, source });
    await rate.save();

    return res.status(201).json({ message: "Rate updated successfully", rate });
  } catch (error) {
    return res.status(500).json({ message: "Error updating rate", error: error.message });
  }
};

// Get the latest rate
exports.getLatestRate = async (req, res) => {
  try {
    const rate = await Rate.findOne().sort({ createdAt: -1 });
    if (!rate) {
      return res.status(404).json({ message: "No rates found" });
    }
    return res.json(rate);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching latest rate", error: error.message });
  }
};

// Get all rates (history) - Admin
exports.getAllRates = async (req, res) => {
  try {
    const rates = await Rate.find().sort({ createdAt: -1 });
    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching rates", error: error.message });
  }
};

// Public: Get recent rate history (no auth)
exports.getPublicRates = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 30; // default 30 most recent
    const rates = await Rate.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching public rates", error: error.message });
  }
};

// User/Admin: Get rate history by date range (inclusive)
// @route GET /api/rates/history-range?from=2024-01-01&to=2024-01-31
exports.getRatesByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'from and to query params are required (YYYY-MM-DD)' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Include the entire 'to' day by setting to 23:59:59.999
    toDate.setHours(23, 59, 59, 999);

    const rates = await Rate.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).sort({ createdAt: -1 });

    return res.json(rates);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching rate history', error: error.message });
  }
};
