const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/requestController');

// Barrel requests
router.post('/barrels', protect, ctrl.createBarrelRequest);
router.get('/barrels/my', protect, ctrl.listMyBarrelRequests);

// Issue reports
router.post('/issues', protect, ctrl.createIssueReport);
router.get('/issues/my', protect, ctrl.listMyIssues);

module.exports = router;


