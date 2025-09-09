 
const express = require('express');
const router = express.Router();
const { getStockLevel, updateStockLevel } = require('../controllers/stockController');
const { protect, admin } = require('../middleware/authMiddleware');

// Anyone logged in can see the stock level
router.get('/', protect, getStockLevel);
// Only admin can update the stock level
router.put('/', protect, admin, updateStockLevel);

module.exports = router;