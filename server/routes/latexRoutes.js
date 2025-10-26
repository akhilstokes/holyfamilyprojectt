const express = require('express');
const router = express.Router();
const {
    submitLatexRequest,
    getUserLatexRequests,
    getLatexRequest,
    updateLatexRequest,
    getAllLatexRequests,
    generateReceipt,
    createManualTest,
    testEndpoint,
    collectLatex,
    recordTestResult,
    accountantCalculate,
    managerVerify,
    getInvoice,
    listPendingTests,
    getDrcReport,
    listPendingAccounts
} = require('../controllers/latexController');
const { protect, adminOrManager, admin, adminManagerAccountant } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/enhancedAuth');

// Apply generous rate limiting for admin endpoints (300 requests per minute)
const adminRateLimiter = rateLimiter(60 * 1000, 300);

// Customer routes
router.post('/submit-request', protect, submitLatexRequest);
router.get('/requests', protect, getUserLatexRequests);
router.get('/requests/:id', protect, getLatexRequest);
router.get('/receipt/:id', protect, generateReceipt);
// Manual DRC entry by lab
router.post('/manual-test', protect, createManualTest);
// Lab pending tests
router.get('/pending-tests', protect, listPendingTests);
// Reports (samples)
router.get('/reports/drc', protect, getDrcReport);

// Admin/Manager/Accountant routes - with generous rate limiting
router.get('/admin/requests', protect, adminManagerAccountant, adminRateLimiter, getAllLatexRequests);
router.put('/admin/requests/:id', protect, adminManagerAccountant, updateLatexRequest);

// Workflow routes
router.put('/collect/:id', protect, collectLatex); // collection by authorized staff (broad protect for now)
router.put('/test/:id', protect, recordTestResult); // lab/yard staff records DRC
router.put('/admin/calc/:id', protect, adminManagerAccountant, accountantCalculate); // accountant calculates
router.put('/admin/verify/:id', protect, adminOrManager, managerVerify); // manager verifies
router.get('/invoice/:id', protect, getInvoice); // invoice retrieval
// Accountant pending queue for samples
router.get('/admin/pending-accounts', protect, adminManagerAccountant, listPendingAccounts);

// Test route
router.get('/test', testEndpoint);

module.exports = router;














































