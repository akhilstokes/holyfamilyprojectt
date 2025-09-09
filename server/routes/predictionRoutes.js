const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/predictionController');

router.post('/barrels/:id/readings', protect, ctrl.addReading);
router.get('/barrels/:id/prediction', protect, ctrl.getPrediction);

module.exports = router;