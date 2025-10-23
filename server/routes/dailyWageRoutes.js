const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');
const dailyWageController = require('../controllers/dailyWageController');

// Daily wage management routes
router.post('/wage/:workerId', protect, admin, dailyWageController.setDailyWage);
router.get('/wage/:workerId', protect, dailyWageController.getDailyWage);

// Enhanced daily wage routes
router.get('/workers', protect, dailyWageController.getAllDailyWageWorkers);
router.post('/bulk-update', protect, admin, dailyWageController.bulkUpdateDailyWages);
router.get('/stats', protect, dailyWageController.getDailyWageStats);
router.get('/calculate/:workerId', protect, adminManagerAccountant, dailyWageController.calculateMonthlySalary);
router.get('/calculate-enhanced/:workerId', protect, adminManagerAccountant, dailyWageController.calculateEnhancedSalary);
router.post('/apply-template/:workerId', protect, admin, dailyWageController.applyWageTemplate);
router.get('/history/:workerId', protect, dailyWageController.getWageHistory);
router.get('/payroll-history/:workerId', protect, dailyWageController.getPayrollHistory);
router.get('/summary/:workerId', protect, adminManagerAccountant, dailyWageController.getSalarySummary);
router.post('/payment/:workerId', protect, admin, dailyWageController.recordPayment);

module.exports = router;