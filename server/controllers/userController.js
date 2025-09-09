const BillRequest = require('../models/billRequestModel');
const User = require('../models/userModel');

/**
 * @desc    Submit a latex sell request
 * @route   POST /api/users/submit-bill
 */
exports.submitBillRequest = async (req, res) => {
    const { latexVolume, drcPercentage, companyRate } = req.body;

    // --- Backend Validation Block ---
    if (latexVolume == null || drcPercentage == null || companyRate == null) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (typeof latexVolume !== 'number' || typeof drcPercentage !== 'number' || typeof companyRate !== 'number') {
        return res.status(400).json({ message: 'All inputs must be numbers.' });
    }
    if (latexVolume <= 0 || drcPercentage <= 0) {
        return res.status(400).json({ message: 'Volume and DRC must be greater than zero.' });
    }
    // --- End Validation Block ---

    try {
        // Correct calculation for percentage
        const calculatedAmount = latexVolume * (drcPercentage / 100) * companyRate;
        
        const newBillRequest = new BillRequest({
            supplier: req.user._id, // Get user ID from protect middleware
            latexVolume,
            drcPercentage,
            companyRate,
            calculatedAmount
        });

        const savedBill = await newBillRequest.save();
        res.status(201).json(savedBill);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/profile
 */
exports.getUserProfile = (req, res) => {
    // req.user is populated by the protect middleware
    res.status(200).json(req.user);
};

/**
 * @desc    Update current user's profile (phoneNumber, location, name)
 * @route   PUT /api/users/profile
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const updates = {};
        const allowed = ['name', 'phoneNumber', 'location'];
        for (const key of allowed) {
            if (typeof req.body[key] === 'string') {
                updates[key] = req.body[key];
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        Object.assign(user, updates);

        // Re-validate phone number using the same schema validation
        user.markModified('phoneNumber');
        user.markModified('location');

        await user.save();

        const safe = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            location: user.location,
            role: user.role,
            isPhoneVerified: user.isPhoneVerified,
        };

        return res.json({ message: 'Profile updated', user: safe });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all bill submissions for the logged-in user
 * @route   GET /api/users/my-submissions
 */
exports.getMySubmissions = async (req, res) => {
    try {
        // Find all bills where the supplier matches the logged-in user's ID
        const submissions = await BillRequest.find({ supplier: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};