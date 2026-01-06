const express = require('express');
const router = express.Router();
const { protect, adminManagerAccountant } = require('../middleware/authMiddleware');
const financialReportController = require('../controllers/financialReportController');

// Get monthly financial report
router.get('/reports/financial/monthly', protect, adminManagerAccountant, financialReportController.getMonthlyFinancialReport);

// Get yearly financial report
router.get('/reports/financial/yearly', protect, adminManagerAccountant, financialReportController.getYearlyFinancialReport);

// Get cash flow report
router.get('/reports/financial/cash-flow', protect, adminManagerAccountant, financialReportController.getCashFlowReport);

module.exports = router;