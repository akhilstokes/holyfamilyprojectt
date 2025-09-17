const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/salesController');

router.post('/', protect, ctrl.createEntry);
router.get('/my', protect, ctrl.listMyEntries);
router.get('/summary/:year', protect, ctrl.yearlySummary);
router.get('/predict/:year', protect, ctrl.predictNextYear);

module.exports = router;


