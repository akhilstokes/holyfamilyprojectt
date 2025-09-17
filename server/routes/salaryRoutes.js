const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const salaryController = require('../controllers/salaryController');

// Salary Template Routes
router.post('/template/:staffId', protect, admin, salaryController.createSalaryTemplate);
router.get('/template/:staffId', protect, salaryController.getSalaryTemplate);
router.put('/template/:staffId', protect, admin, salaryController.updateSalaryTemplate);

// Monthly Salary Routes
router.post('/generate/:staffId', protect, admin, salaryController.generateMonthlySalary);
router.get('/monthly/:staffId', protect, salaryController.getMonthlySalary);
router.put('/monthly/:salaryId', protect, admin, salaryController.updateMonthlySalary);
router.put('/approve/:salaryId', protect, admin, salaryController.approveSalary);
router.put('/pay/:salaryId', protect, admin, salaryController.paySalary);

// Salary History and Reports
router.get('/history/:staffId', protect, salaryController.getSalaryHistory);
router.get('/all', protect, admin, salaryController.getAllSalaries);
router.get('/summary', protect, admin, salaryController.getSalarySummary);

module.exports = router;






