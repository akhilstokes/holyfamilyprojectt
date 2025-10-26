const express = require('express');
const router = express.Router();
const { protect, labOrAdminMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/labSampleController');

// Lab dashboard summary
router.get('/summary', protect, labOrAdminMiddleware, ctrl.getSummary);

// Accept lab samples into the lab inventory
router.post('/samples/checkin', protect, ctrl.sampleCheckIn);

module.exports = router;
