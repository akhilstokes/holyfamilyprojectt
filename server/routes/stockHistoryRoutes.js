const express = require('express');
const router = express.Router();
const stockHistoryController = require('../controllers/stockHistoryController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// Create stock transaction (all authenticated users)
router.post('/create', protect, stockHistoryController.createStockTransaction);

// Get stock history for a specific product
router.get('/product/:productName', protect, stockHistoryController.getStockHistory);

// Get stock transaction by ID
router.get('/transaction/:id', protect, stockHistoryController.getStockTransaction);

// Manager/Admin routes
router.get('/all', protect, adminOrManager, stockHistoryController.getAllStockTransactions);
router.get('/analytics', protect, adminOrManager, stockHistoryController.getStockAnalytics);
router.post('/transaction/:id/approve', protect, adminOrManager, stockHistoryController.approveStockTransaction);
router.post('/transaction/:id/reverse', protect, adminOrManager, stockHistoryController.reverseStockTransaction);

module.exports = router;





