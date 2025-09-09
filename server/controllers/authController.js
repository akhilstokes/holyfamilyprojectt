const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Initialize the Google Auth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate your app's token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// --- Register a new user ---
exports.register = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Clean phone number before creating user
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
        const finalPhoneNumber = cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 12 
            ? cleanPhoneNumber.substring(2) 
            : cleanPhoneNumber.startsWith('0') 
                ? cleanPhoneNumber.substring(1) 
                : cleanPhoneNumber;

        const user = await User.create({ 
            name, 
            email, 
            phoneNumber: finalPhoneNumber, 
            password 
        });

        if (user) {
            // Send welcome email (non-blocking)
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to Holy Family Polymers!',
                    message: `Hi ${user.name},\n\nThank you for registering with Holy Family Polymers. We are excited to have you with us.\n\nBest regards,\nThe Holy Family Polymers Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333;">Welcome to Holy Family Polymers!</h2>
                            <p>Hi ${user.name},</p>
                            <p>Thank you for registering with Holy Family Polymers. We are excited to have you with us.</p>
                            <p>Your account has been successfully created and you can now log in to access our services.</p>
                            <p>Best regards,<br>The Holy Family Polymers Team</p>
                        </div>
                    `
                });
                console.log('Welcome email sent successfully to:', user.email);
            } catch (emailError) {
                console.error('Welcome email could not be sent:', emailError);
            }

            const token = generateToken(user._id, user.role);
            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }
        
        res.status(500).json({ message: error.message });
    }
};

// --- Register a new buyer ---
exports.registerBuyer = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
        const finalPhoneNumber = cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length === 12 
            ? cleanPhoneNumber.substring(2) 
            : cleanPhoneNumber.startsWith('0') 
                ? cleanPhoneNumber.substring(1) 
                : cleanPhoneNumber;

        const user = await User.create({ 
            name, 
            email, 
            phoneNumber: finalPhoneNumber, 
            password,
            role: 'buyer'
        });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome Buyer - Holy Family Polymers',
                message: `Hi ${user.name}, welcome to the Holy Family Polymers Store.`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Welcome to the Store!</h2>
                        <p>Hi ${user.name}, your buyer account is ready.</p>
                      </div>`
            });
        } catch (e) {
            console.warn('Buyer welcome email failed:', e.message);
        }

        const token = generateToken(user._id, user.role);
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Buyer registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Log in an existing user ---
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id, user.role);
            res.json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Google Sign-In function ---
exports.googleSignIn = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email } = ticket.getPayload();
        let user = await User.findOne({ email });
        if (!user) {
            const password = crypto.randomBytes(16).toString('hex');
            user = new User({ name, email, password, phoneNumber: 'N/A' });
            await user.save({ validateBeforeSave: false });
        }
        const appToken = generateToken(user._id, user.role);
        res.status(200).json({
            token: appToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(400).json({ message: 'Google Sign-In failed. Invalid token.' });
    }
};

// --- Forgot Password function ---
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with that email does not exist.' });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        
        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested a password reset for your Holy Family Polymers account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>This link will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - Holy Family Polymers',
                message: `Reset your password: ${resetUrl}`,
                html: htmlMessage
            });
            console.log('Password reset email sent to:', user.email);
            res.status(200).json({ message: 'Password reset link sent to your email.' });
        } catch (emailError) {
            console.error('Password reset email error:', emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Reset Password function ---
exports.resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    try {
        const user = await User.findOne({
            passwordResetToken: resetPasswordToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        if (!req.body.password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- Validate token ---
exports.validateToken = async (req, res) => {
    try {
        // The token is already validated by the protect middleware
        // We just need to return the user info
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                valid: false, 
                message: 'User not found' 
            });
        }

        res.json({
            valid: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ 
            valid: false, 
            message: 'Invalid token' 
        });
    }
};

// --- Check if user registration is complete ---
exports.checkRegistrationStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Check if all required fields are filled
        // Since user can login, password exists, so we only need to check other fields
        const isComplete = user.name && user.email && user.phoneNumber;
        
        res.json({
            isComplete,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified,
                hasPhone: !!user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Registration status check error:', error);
        res.status(500).json({ 
            message: 'Error checking registration status' 
        });
    }
};
