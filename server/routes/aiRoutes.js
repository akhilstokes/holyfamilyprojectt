const express = require('express');
const router = express.Router();
const { resolveDoubt, getChatHistory, calculateRubber } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// AI doubt resolver endpoint
router.post('/doubt-resolver', protect, resolveDoubt);

// Get chat history endpoint (optional)
router.get('/chat-history', protect, getChatHistory);

// Rubber calculator endpoint
router.post('/calculator', protect, calculateRubber);

module.exports = router;
