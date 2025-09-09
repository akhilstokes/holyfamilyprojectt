const express = require('express');
const router = express.Router();
const {
    getAllBillRequests,
    getBillRequest,
    updateBillRequest,
    submitBillRequest,
    getStaffBillRequests,
    getAllStaff,
    generateBillReport
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// Staff routes
router.post('/submit', protect, submitBillRequest);
router.get('/staff', protect, getStaffBillRequests);
router.get('/staff/:id', protect, getBillRequest);

// Admin routes
router.get('/admin', protect, admin, getAllBillRequests);
router.get('/admin/staff', protect, admin, getAllStaff);
router.get('/admin/:id', protect, admin, getBillRequest);
router.put('/admin/:id', protect, admin, updateBillRequest);
router.get('/admin/reports/generate', protect, admin, generateBillReport);

module.exports = router;














