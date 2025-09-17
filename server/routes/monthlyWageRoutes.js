const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const monthlyWageController = require('../controllers/monthlyWageController');

// Monthly wage management routes
router.post('/salary/:workerId', protect, admin, monthlyWageController.setMonthlySalary);
router.get('/salary/:workerId', protect, monthlyWageController.getMonthlySalary);
router.get('/calculate/:workerId', protect, monthlyWageController.calculateMonthlySalary);
router.get('/workers', protect, monthlyWageController.getAllMonthlySalaryWorkers);
router.post('/bulk-update', protect, admin, monthlyWageController.bulkUpdateMonthlySalaries);
router.get('/stats', protect, monthlyWageController.getMonthlySalaryStats);

module.exports = router;




