const express = require('express');
const router = express.Router();
const { protect, adminOrManager } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/requestController');

// Barrel requests
router.post('/barrels', protect, ctrl.createBarrelRequest);
router.get('/barrels/my', protect, ctrl.listMyBarrelRequests);

// Manager: Barrel requests management
router.get('/barrels/manager/all', protect, adminOrManager, ctrl.listAllBarrelRequests);
router.put('/barrels/:id/approve', protect, adminOrManager, ctrl.approveBarrelRequest);
router.put('/barrels/:id/reject', protect, adminOrManager, ctrl.rejectBarrelRequest);

// Issue reports
router.post('/issues', protect, ctrl.createIssueReport);
router.get('/issues/my', protect, ctrl.listMyIssues);

module.exports = router;


