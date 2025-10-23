const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// This single line imports all necessary functions from the controller at once
const { 
    listUsers,
    listFarmers,
    submitBillRequest, 
    getUserProfile, 
    updateUserProfile,
    getMySubmissions 
} = require('../controllers/userController');

// Public/protected users listing used by staff dispatch selections
router.get('/', protect, listUsers);
// Farmers list for field collection forms
router.get('/farmers', protect, listFarmers);

// Define the routes for the user
router.post('/submit-bill', protect, submitBillRequest);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/my-submissions', protect, getMySubmissions);

module.exports = router;