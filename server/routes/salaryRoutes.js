const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');
const salaryController = require('../controllers/salaryController');

// Salary Template Routes
router.post('/template/:staffId', protect, admin, salaryController.createSalaryTemplate);
router.get('/template/:staffId', protect, salaryController.getSalaryTemplate);
router.put('/template/:staffId', protect, admin, salaryController.updateSalaryTemplate);

// Monthly Salary Routes
// Allow accountant to generate, manager/admin to approve/pay
router.post('/generate/:staffId', protect, adminManagerAccountant, salaryController.generateMonthlySalary);
router.get('/monthly/:staffId', protect, salaryController.getMonthlySalary);
router.put('/monthly/:salaryId', protect, adminOrManager, salaryController.updateMonthlySalary);
router.put('/approve/:salaryId', protect, adminOrManager, salaryController.approveSalary);
router.put('/pay/:salaryId', protect, adminOrManager, salaryController.paySalary);
// Payslip HTML
router.get('/payslip/:salaryId', protect, salaryController.getPayslip);

// Salary History and Reports
router.get('/history/:staffId', protect, salaryController.getSalaryHistory);
router.get('/all', protect, adminOrManager, salaryController.getAllSalaries);
router.get('/summary', protect, adminOrManager, salaryController.getSalarySummary);

module.exports = router;



































