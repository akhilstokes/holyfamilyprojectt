 
const express = require('express');
const router = express.Router();
const { getStockLevel, updateStockLevel, getStockSummary, getItem, updateItem } = require('../controllers/stockController');
const { protect, admin } = require('../middleware/authMiddleware');

// Anyone logged in can see the stock level
router.get('/', protect, getStockLevel);
// Only admin can update the stock level
router.put('/', protect, admin, updateStockLevel);

// Summary for dashboard
router.get('/summary', protect, getStockSummary);

// Generic item routes (admin)
router.get('/item/:name', protect, admin, getItem);
router.put('/item/:name', protect, admin, updateItem);

module.exports = router;