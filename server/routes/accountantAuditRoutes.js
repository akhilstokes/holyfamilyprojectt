const express = require('express');
const router = express.Router();
const { protect, adminManagerAccountant } = require('../middleware/authMiddleware');
const accountantAuditController = require('../controllers/accountantAuditController');

// Get all audit logs
router.get('/audit-logs', protect, adminManagerAccountant, accountantAuditController.getAuditLogs);

// Get specific audit log
router.get('/audit-logs/:auditId', protect, adminManagerAccountant, accountantAuditController.getAuditLog);

// Get audit summary
router.get('/audit-logs/summary', protect, adminManagerAccountant, accountantAuditController.getAuditSummary);

module.exports = router;