const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const unifiedSalaryController = require('../controllers/unifiedSalaryController');

// Unified salary routes - automatically determines payment type based on role
router.get('/unified', protect, unifiedSalaryController.getUnifiedSalary);
router.get('/unified/history', protect, unifiedSalaryController.getUnifiedSalaryHistory);

module.exports = router;
