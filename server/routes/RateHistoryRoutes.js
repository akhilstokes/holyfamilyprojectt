const express = require('express');
const router = express.Router();
const { addRateHistory, getUserRateHistory, getAllRateHistory } = require('../controllers/rateHistoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Add new rate history (Admin action)
router.post('/', protect, admin, addRateHistory);

// ✅ Get all rate history (Admin view for frontend table)
router.get('/history/all', protect, admin, getAllRateHistory);

// Get history for specific user (Admin)
router.get('/:userId', protect, admin, getUserRateHistory);

module.exports = router;
