const express = require("express");
const router = express.Router();
const rateController = require("../controllers/rateController");
const { protect, admin, adminOrManager } = require("../middleware/authMiddleware");

// Manager/Admin can propose (back-compat path retained)
router.post("/update", protect, adminOrManager, rateController.updateRate);
router.post("/propose", protect, adminOrManager, rateController.proposeRate);

// Combined (Admin latest + Rubber Board live)
router.get("/latex/today", rateController.getLatexToday);

// Anyone can view latest rate (by product)
router.get("/latest", rateController.getLatestRate);

// Latest published rate (visible to end users/staff)
router.get("/published/latest", rateController.getPublishedLatest);

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

// Admin/Manager: list pending, edit; Admin: verify
router.get("/pending", protect, adminOrManager, rateController.getPendingRates);
router.put("/:id", protect, adminOrManager, rateController.editRate);
router.post("/:id/verify", protect, admin, rateController.verifyRate);

module.exports = router;
