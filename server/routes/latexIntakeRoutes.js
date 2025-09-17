const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getIntakesByDate, createIntake } = require('../controllers/latexIntakeController');

// Staff: create latex intake
router.post('/', protect, createIntake);

// Admin: list intakes for a particular date
router.get('/', protect, admin, getIntakesByDate);

module.exports = router;