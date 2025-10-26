const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const wagesController = require('../controllers/wagesController');

// All routes require authentication
router.use(protect);

// GET /api/wages/staff - Get staff by role
router.get('/staff', wagesController.getStaffByRole);

// GET /api/wages/payslips - Get payslips
router.get('/payslips', wagesController.getPayslips);

// POST /api/wages/payslips - Create payslip
router.post('/payslips', adminOrManager, wagesController.createPayslip);

// PUT /api/wages/payslips/:id - Update payslip
router.put('/payslips/:id', adminOrManager, wagesController.updatePayslip);

// DELETE /api/wages/payslips/:id - Delete payslip
router.delete('/payslips/:id', admin, wagesController.deletePayslip);

module.exports = router;
