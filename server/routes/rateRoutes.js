const express = require("express");
const router = express.Router();
const rateController = require("../controllers/rateController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin can add/update rate (by product)
router.post("/update", protect, admin, rateController.updateRate);

// Combined (Admin latest + Rubber Board live)
router.get("/latex/today", rateController.getLatexToday);

// Anyone can view latest rate (by product)
router.get("/latest", rateController.getLatestRate);

// Combined (Admin latest + Rubber Board live)
router.get("/latex/today", rateController.getLatexToday);

// Live Latex(60%) rate scraped from Rubber Board (public)
router.get("/live/latex", rateController.fetchLatexRateRubberBoard);

// Admin can view full history
router.get("/history", protect, admin, rateController.getAllRates);

// User/Admin: date-range history (auth required for users)
router.get("/history-range", protect, rateController.getRatesByDateRange);

// Public recent history (for dashboards without admin auth)
router.get("/public-history", rateController.getPublicRates);

module.exports = router;
