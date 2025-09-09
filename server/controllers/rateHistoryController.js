const RateHistory = require('../models/RateHistory');

// Add new rate history (Admin action)
exports.addRateHistory = async (req, res) => {
  try {
    const { userId, rateType, rateValue, effectiveDate } = req.body;

    // Save new history
    const newRate = new RateHistory({
      userId,
      rateType,
      rateValue,
      effectiveDate: effectiveDate || new Date(),
      updatedBy: req.user ? req.user._id : null // if using auth middleware
    });

    await newRate.save();

    res.status(201).json({ message: "Rate history added", data: newRate });
  } catch (error) {
    console.error("Error adding rate history:", error);
    res.status(500).json({ message: "Error adding rate history", error: error.message });
  }
};

// Get rate history for a specific user
exports.getUserRateHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await RateHistory.find({ userId })
      .populate("updatedBy", "name email")
      .sort({ effectiveDate: -1 });

    res.status(200).json({ message: "User rate history fetched", data: history });
  } catch (error) {
    console.error("Error fetching user rate history:", error);
    res.status(500).json({ message: "Error fetching user rate history", error: error.message });
  }
};

// ✅ Get all rate history (for all users)
exports.getAllRateHistory = async (req, res) => {
  try {
    const history = await RateHistory.find()
      .populate("updatedBy", "name email")
      .sort({ effectiveDate: -1 });

    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching all rate history:", error);
    res.status(500).json({ message: "Error fetching all rate history", error: error.message });
  }
};
