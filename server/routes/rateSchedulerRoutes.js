const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
  triggerRateFetch,
  getLatestRates,
  getRateHistory,
  getRateStatistics
} = require('../controllers/rateSchedulerController');

// Get scheduler status (admin only)
router.get('/status', protect, admin, getSchedulerStatus);

// Start scheduler (admin only)
router.post('/start', protect, admin, startScheduler);

// Stop scheduler (admin only)
router.post('/stop', protect, admin, stopScheduler);

// Trigger manual rate fetch (admin only)
router.post('/fetch', protect, admin, triggerRateFetch);

// Get latest rates from all sources
router.get('/latest', getLatestRates);

// Get rate history with filters
router.get('/history', getRateHistory);

// Get rate statistics
router.get('/statistics', getRateStatistics);

module.exports = router;






