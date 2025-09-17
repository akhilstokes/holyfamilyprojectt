 
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes for logged-in users
exports.protect = async (req, res, next) => {
    let token;
    
    // Check if authorization header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Check if token exists and is not empty
            if (!token || token.trim() === '') {
                return res.status(401).json({ message: 'Not authorized, no token provided' });
            }
            
            // Basic token format validation (JWT should have 3 parts separated by dots)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Malformed JWT token - incorrect number of parts:', tokenParts.length);
                return res.status(401).json({ message: 'Invalid token format' });
            }
            
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user exists
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            
            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            console.error('Token received:', token ? `${token.substring(0, 20)}...` : 'null');
            
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token format' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            } else {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Protect routes for admin users only
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};