const Stock = require('../models/stockModel');

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