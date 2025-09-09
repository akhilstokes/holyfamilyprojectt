const LatexRequest = require('../models/latexRequestModel');
const User = require('../models/userModel');

// Submit latex sell request
const submitLatexRequest = async (req, res) => {
    try {
        const { quantity, drcPercentage, quality, location, notes, estimatedPayment } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!quantity || !drcPercentage || !location) {
            return res.status(400).json({
                success: false,
                message: 'Quantity, DRC percentage, and location are required'
            });
        }

        // Validate DRC percentage
        if (drcPercentage < 0 || drcPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'DRC percentage must be between 0 and 100'
            });
        }

        // Create new latex request
        const latexRequest = new LatexRequest({
            user: userId,
            quantity: parseFloat(quantity),
            drcPercentage: parseFloat(drcPercentage),
            quality,
            location,
            notes,
            estimatedPayment: parseFloat(estimatedPayment),
            status: 'pending',
            submittedAt: new Date()
        });

        await latexRequest.save();

        res.status(201).json({
            success: true,
            message: 'Latex sell request submitted successfully',
            request: latexRequest
        });

    } catch (error) {
        console.error('Error submitting latex request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Get user's latex requests
const getUserLatexRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = { user: userId };
        if (status) {
            query.status = status;
        }

        const requests = await LatexRequest.find(query)
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email');

        const total = await LatexRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Error fetching latex requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex requests'
        });
    }
};

// Get single latex request
const getLatexRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await LatexRequest.findOne({ _id: id, user: userId })
            .populate('user', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        res.status(200).json({
            success: true,
            request
        });

    } catch (error) {
        console.error('Error fetching latex request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex request'
        });
    }
};

// Update latex request (for admin)
const updateLatexRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, actualPayment, adminNotes } = req.body;

        const request = await LatexRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        // Update fields
        if (status) request.status = status;
        if (actualPayment) request.actualPayment = parseFloat(actualPayment);
        if (adminNotes) request.adminNotes = adminNotes;
        
        if (status === 'approved' || status === 'rejected') {
            request.processedAt = new Date();
            request.processedBy = req.user.id;
        }

        await request.save();

        res.status(200).json({
            success: true,
            message: 'Latex request updated successfully',
            request
        });

    } catch (error) {
        console.error('Error updating latex request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating latex request'
        });
    }
};

// Get all latex requests (for admin)
const getAllLatexRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const requests = await LatexRequest.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('user', 'name email phone')
            .populate('processedBy', 'name');

        const total = await LatexRequest.countDocuments(query);

        // Calculate statistics
        const stats = await LatexRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalPayment: { $sum: '$estimatedPayment' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            requests,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats
        });

    } catch (error) {
        console.error('Error fetching all latex requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching latex requests'
        });
    }
};

// Generate receipt for approved request
const generateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const request = await LatexRequest.findOne({ _id: id, user: userId })
            .populate('user', 'name email phone address');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Latex request not found'
            });
        }

        if (request.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Receipt can only be generated for approved requests'
            });
        }

        // Generate receipt data
        const receiptData = {
            receiptNumber: `LATEX-${request._id.toString().slice(-8).toUpperCase()}`,
            date: request.processedAt || request.submittedAt,
            customer: {
                name: request.user.name,
                email: request.user.email,
                phone: request.user.phone,
                address: request.user.address
            },
            request: {
                quantity: request.quantity,
                drcPercentage: request.drcPercentage,
                quality: request.quality,
                location: request.location,
                estimatedPayment: request.estimatedPayment,
                actualPayment: request.actualPayment || request.estimatedPayment
            },
            company: {
                name: 'Holy Family Polymers',
                address: 'Your Company Address',
                phone: 'Your Company Phone',
                email: 'info@holyfamilypolymers.com'
            }
        };

        res.status(200).json({
            success: true,
            receipt: receiptData
        });

    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating receipt'
        });
    }
};

module.exports = {
    submitLatexRequest,
    getUserLatexRequests,
    getLatexRequest,
    updateLatexRequest,
    getAllLatexRequests,
    generateReceipt
};














