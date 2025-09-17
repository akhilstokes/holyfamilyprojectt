const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your name."],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long."],
        maxlength: [50, "Name must be less than 50 characters."],
        validate: {
            validator: function(name) {
                // Only letters, spaces, and dots allowed
                return /^[a-zA-Z\s.]+$/.test(name);
            },
            message: "Name must contain only letters, spaces, and dots (no numbers or special characters)."
        }
    },
    email: {
        type: String,
        required: [true, "Please provide an email."],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address."
        ]
    },
    phoneNumber: {
        type: String,
        required: [true, "Please provide a phone number."],
        trim: true,
        validate: {
            validator: function(phone) {
                // Remove all non-digit characters
                const cleanPhone = phone.replace(/\D/g, '');
                
                // Check if it's all zeros
                if (/^0+$/.test(cleanPhone)) {
                    return false;
                }
                
                // Validate different phone number formats
                if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
                    // Indian number with country code: +91 9876543210
                    const numberWithoutCode = cleanPhone.substring(2);
                    return /^[6-9]\d{9}$/.test(numberWithoutCode);
                } else if (cleanPhone.length === 10) {
                    // 10-digit number without country code
                    return /^[6-9]\d{9}$/.test(cleanPhone);
                } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
                    // Number starting with 0
                    const numberWithoutZero = cleanPhone.substring(1);
                    return /^[6-9]\d{9}$/.test(numberWithoutZero);
                }
                
                return false;
            },
            message: "Please provide a valid 10-digit Indian mobile number (can include +91 country code)."
        }
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100,
        default: ''
    },
    password: {
        type: String,
        required: [true, "Please provide a password."],
        minlength: [6, "Password must be at least 6 characters long."],
        validate: {
            validator: function(password) {
                // Allow bypass for staff; staff will use staffId as initial password
                if (this && this.role === 'field_staff') {
                    return true;
                }
                // No spaces allowed
                if (password.includes(' ')) {
                    return false;
                }
                // Must contain at least one uppercase letter
                if (!/(?=.*[A-Z])/.test(password)) {
                    return false;
                }
                // Must contain at least one lowercase letter
                if (!/(?=.*[a-z])/.test(password)) {
                    return false;
                }
                // Must contain at least one number
                if (!/(?=.*\d)/.test(password)) {
                    return false;
                }
                // Must contain at least one special character
                if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
                    return false;
                }
                // Only allow valid characters
                if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(password)) {
                    return false;
                }
                return true;
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces."
        },
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'field_staff', 'buyer'],
        default: 'user'
    },
    staffId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        validate: {
            validator: function(staffId) {
                // If staffId is provided, it should be valid format
                if (!staffId) return true; // Allow empty for non-staff
                return /^[A-Z0-9]{5,12}$/.test(staffId);
            },
            message: "Staff ID must be 5-12 characters long and contain only uppercase letters and numbers."
        }
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'deleted'],
        default: 'active'
    },
    statusReason: { type: String, default: '' },
    statusUpdatedAt: Date,
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roleUpdatedAt: Date,
    roleUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,

}, { timestamps: true });

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// In userModel.js, before module.exports
const crypto = require('crypto');

// Method to generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (e.g., 10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);