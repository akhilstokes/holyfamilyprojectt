const express = require('express');
const router = express.Router();
const { 
    register, 
    registerBuyer,
    login, 
    googleSignIn,
    forgotPassword, 
    resetPassword,
    validateToken,
    checkRegistrationStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// --- Define All Authentication Routes ---

// Registration and Login
router.post('/register', register);
router.post('/register-buyer', registerBuyer);
router.post('/login', login);

// Google Sign-in
router.post('/google-signin', googleSignIn);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Token validation and registration status (protected routes)
router.get('/validate-token', protect, validateToken);
router.get('/registration-status', protect, checkRegistrationStatus);

module.exports = router;