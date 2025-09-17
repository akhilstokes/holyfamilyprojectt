const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { priceBatch } = require('../controllers/latexPricingController');

// Admin: apply pricing calculation for a day (simulation)
router.post('/price-batch', protect, admin, priceBatch);

module.exports = router;