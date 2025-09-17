const Stock = require('../models/stockModel');
// Optional: rubber band stock could be tracked as a separate Stock doc

// @desc    Get current stock levels
// @route   GET /api/stock
exports.getStockLevel = async (req, res) => {
  try {
    let stock = await Stock.findOne({ productName: 'Raw Latex' });
    if (!stock) {
      stock = await Stock.create({ productName: 'Raw Latex', quantityInLiters: 0 });
    }
    // Always return exact decimals (no rounding) as requested
    return res.status(200).json(stock);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update stock levels (clamp to zero to avoid negative)
// @route   PUT /api/stock
exports.updateStockLevel = async (req, res) => {
  try {
    const { quantityChange } = req.body; // positive or negative
    if (typeof quantityChange !== 'number' || Number.isNaN(quantityChange)) {
      return res.status(400).json({ message: 'quantityChange must be a number' });
    }

    const stock = await Stock.findOne({ productName: 'Raw Latex' });
    if (!stock) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    const nextQuantity = stock.quantityInLiters + quantityChange;
    stock.quantityInLiters = Math.max(0, nextQuantity); // clamp to zero
    stock.lastUpdated = Date.now();

    const updatedStock = await stock.save();
    return res.status(200).json(updatedStock);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get summary for key stocks (latex liters and rubber band units)
// @route   GET /api/stock/summary
exports.getStockSummary = async (req, res) => {
  try {
    // Latex as liters
    let latex = await Stock.findOne({ productName: 'Raw Latex' });
    if (!latex) latex = await Stock.create({ productName: 'Raw Latex', quantityInLiters: 0 });

    // Rubber Band as units - reuse model with a different name, store units in quantityInLiters field name for simplicity
    let rubber = await Stock.findOne({ productName: 'Rubber Bands' });
    if (!rubber) rubber = await Stock.create({ productName: 'Rubber Bands', quantityInLiters: 0 });

    return res.json({
      latexLiters: latex.quantityInLiters,
      rubberBandUnits: rubber.quantityInLiters,
      updatedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- Generic stock items by name (admin) ---
exports.getItem = async (req, res) => {
  try {
    const { name } = req.params;
    let doc = await Stock.findOne({ productName: name });
    if (!doc) doc = await Stock.create({ productName: name, quantityInLiters: 0 });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name } = req.params;
    const { quantityChange } = req.body;
    if (typeof quantityChange !== 'number' || Number.isNaN(quantityChange)) {
      return res.status(400).json({ message: 'quantityChange must be a number' });
    }
    let doc = await Stock.findOne({ productName: name });
    if (!doc) doc = await Stock.create({ productName: name, quantityInLiters: 0 });
    const next = doc.quantityInLiters + quantityChange;
    doc.quantityInLiters = Math.max(0, next);
    doc.lastUpdated = Date.now();
    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};