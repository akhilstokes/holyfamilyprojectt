 
const express = require('express');
const router = express.Router();
const { getStockLevel, updateStockLevel, getStockSummary, getItem, updateItem, listItems, createItem, updateItemById, deleteItemById } = require('../controllers/stockController');
const { protect, admin, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');

// Anyone logged in can see the stock level
router.get('/', protect, getStockLevel);
// Only admin can update the stock level
router.put('/', protect, admin, updateStockLevel);

// Summary for dashboard (manager/accountant access allowed)
router.get('/summary', protect, adminManagerAccountant, getStockSummary);

// Generic item routes (admin)
router.get('/item/:name', protect, admin, getItem);
router.put('/item/:name', protect, admin, updateItem);

// Manager/Accountant can list items; admin/manager/accountant can update quantity; create/delete remain admin/manager
router.get('/items', protect, adminManagerAccountant, listItems);
router.post('/items', protect, adminOrManager, createItem);
router.put('/items/:id', protect, adminManagerAccountant, updateItemById);
router.delete('/items/:id', protect, adminOrManager, deleteItemById);

module.exports = router;