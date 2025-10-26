const express = require('express');
const router = express.Router();
const { getCapacity, updateCapacity } = require('../controllers/capacityController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getCapacity);
router.put('/', protect, admin, updateCapacity);

module.exports = router;





















































