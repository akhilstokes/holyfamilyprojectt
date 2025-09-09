const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// This single line imports all necessary functions from the controller at once
const { 
    submitBillRequest, 
    getUserProfile, 
    updateUserProfile,
    getMySubmissions 
} = require('../controllers/userController');

// Define the routes for the user
router.post('/submit-bill', protect, submitBillRequest);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/my-submissions', protect, getMySubmissions);

module.exports = router;