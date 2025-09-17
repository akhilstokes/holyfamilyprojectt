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
    updateBarrelStatus,
    listBarrelRequests,
    updateBarrelRequestStatus,
    listIssueReports,
    updateIssueStatus,
    dispatchBarrels,
    returnBarrels,
    upsertWeeklySchedule,
    assignWeeklyShift,
    getWeeklySchedule
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
// Weekly schedules
router.post('/weekly-schedule', upsertWeeklySchedule);
router.post('/weekly-schedule/assign', assignWeeklyShift);
router.get('/weekly-schedule', getWeeklySchedule);

// --- Stock Routes ---
router.get('/stock', getStockTransactions);
router.post('/stock', addStockTransaction);

// --- Barrel Routes ---
router.get('/barrels', getBarrels);
router.post('/barrels', addBarrel);
router.put('/barrels/:id', updateBarrelStatus);

// --- Barrel Dispatch/Return (moved to staff access) ---
router.post('/barrels/dispatch', dispatchBarrels);
router.post('/barrels/return', returnBarrels);

// --- Requests & Issues ---
router.get('/requests/barrels', listBarrelRequests);
router.put('/requests/barrels/:id', updateBarrelRequestStatus);
router.get('/issues', listIssueReports);
router.put('/issues/:id', updateIssueStatus);

module.exports = router;
