// routes/userRateHistoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  addRateHistory,
  getUserRateHistory,
} = require("../controllers/rateHistoryController");

// Save a new rate entry
router.post("/add", addRateHistory);

// Get history by user
router.get("/:userId", getUserRateHistory);

module.exports = router;
