const express = require("express");
const router = express.Router();
const rateController = require("../controllers/rateController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin can add/update rate
router.post("/update", protect, admin, rateController.updateRate);

// Anyone can view latest rate
router.get("/latest", rateController.getLatestRate);

// Admin can view full history
router.get("/history", protect, admin, rateController.getAllRates);

// User/Admin: date-range history (auth required for users)
router.get("/history-range", protect, rateController.getRatesByDateRange);

// Public recent history (for dashboards without admin auth)
router.get("/public-history", rateController.getPublicRates);

module.exports = router;
