const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/staffTripController');

router.use(protect);

router.post('/trips', ctrl.createTrip);
router.get('/trips', ctrl.listTrips);
router.get('/trips/:id', ctrl.getTrip);
router.patch('/trips/:id/stops/:stopId/status', ctrl.updateStopStatus);

module.exports = router;
