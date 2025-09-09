// In adminRoutes.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import all necessary controller functions
const {
    getAllBills,
    updateBillStatus,
    getStaffList,
    getAllShifts,
    assignShift,
    getStockTransactions,
    addStockTransaction,
    getBarrels,
    addBarrel,
    updateBarrelStatus
} = require('../controllers/adminController');

// This line applies security to all subsequent routes in this file
router.use(protect, admin);

// --- Bill Management Routes ---
router.get('/bills', getAllBills);
router.put('/bills/:id', updateBillStatus);

// --- Staff and Shift Management Routes ---
router.get('/staff', getStaffList);
router.get('/shifts', getAllShifts);
router.post('/shifts', assignShift);

// --- Stock Routes ---
router.get('/stock', getStockTransactions);
router.post('/stock', addStockTransaction);

// --- Barrel Routes ---
router.get('/barrels', getBarrels);
router.post('/barrels', addBarrel);
router.put('/barrels/:id', updateBarrelStatus);

module.exports = router;
