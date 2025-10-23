const express = require('express');
const router = express.Router();
const { protect, labOrAdminMiddleware } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/labSampleController');

// Accept lab samples into the lab inventory
router.post('/samples/checkin', protect, ctrl.sampleCheckIn);

module.exports = router;
