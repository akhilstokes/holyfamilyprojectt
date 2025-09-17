const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { dispatchBarrels, returnBarrels } = require('../controllers/adminController');

// Staff barrel operations (moved from admin)
router.use(protect);
router.post('/dispatch', dispatchBarrels);
router.post('/return', returnBarrels);

module.exports = router;







