const express = require('express');
const router = express.Router();
const {
    submitLatexRequest,
    getUserLatexRequests,
    getLatexRequest,
    updateLatexRequest,
    getAllLatexRequests,
    generateReceipt
} = require('../controllers/latexController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// Customer routes
router.post('/submit-request', protect, submitLatexRequest);
router.get('/requests', protect, getUserLatexRequests);
router.get('/requests/:id', protect, getLatexRequest);
router.get('/receipt/:id', protect, generateReceipt);

// Admin routes
router.get('/admin/requests', protect, admin, getAllLatexRequests);
router.put('/admin/requests/:id', protect, admin, updateLatexRequest);

module.exports = router;






































