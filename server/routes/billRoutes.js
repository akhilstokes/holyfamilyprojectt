const express = require('express');
const router = express.Router();
const {
    getPendingBillRequests,
    getAllBillRequests,
    getBillRequest,
    updateBillRequest,
    submitBillRequest,
    getStaffBillRequests,
    getAllStaff,
    generateBillReport,
    managerApproveBill,
    managerRejectBill,
    adminApproveBill,
    adminRejectBill
} = require('../controllers/billController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// Staff routes
router.post('/submit', protect, submitBillRequest);
router.get('/staff', protect, getStaffBillRequests);
router.get('/staff/:id', protect, getBillRequest);

// Manager routes
router.get('/manager/pending', protect, adminOrManager, getPendingBillRequests);
router.post('/manager/:id/approve', protect, adminOrManager, managerApproveBill);
router.post('/manager/:id/reject', protect, adminOrManager, managerRejectBill);

// Admin routes
router.get('/admin', protect, admin, getAllBillRequests);
router.get('/admin/staff', protect, admin, getAllStaff);
router.get('/admin/:id', protect, admin, getBillRequest);
router.put('/admin/:id', protect, admin, updateBillRequest);
router.post('/admin/:id/approve', protect, admin, adminApproveBill);
router.post('/admin/:id/reject', protect, admin, adminRejectBill);
router.get('/admin/reports/generate', protect, admin, generateBillReport);

module.exports = router;

















































