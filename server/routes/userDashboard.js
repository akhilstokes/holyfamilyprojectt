const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Dashboard overview
router.get('/overview', userDashboardController.getDashboardOverview);

// Rate information
router.get('/rates/current', userDashboardController.getCurrentRate);
router.get('/rates/history', userDashboardController.getRateHistory);

// Latex requests
router.post('/requests/submit', userDashboardController.submitLatexRequest);
router.get('/requests', userDashboardController.getMyRequests);
router.get('/requests/:requestId', userDashboardController.getRequestDetails);
router.get('/requests/:requestId/receipt', userDashboardController.generateReceipt);

// Payment calculation
router.get('/calculate-payment', userDashboardController.calculatePayment);

module.exports = router;


















