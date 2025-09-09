const BillRequest = require('../models/billRequestModel');
const User = require('../models/userModel');

// Get all bill requests (for admin)
const getAllBillRequests = async (req, res) => {
    try {
        const { status, dateFrom, dateTo, staff, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }
        if (staff) {
            query.staff = staff;
        }
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                query.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
            }
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const bills = await BillRequest.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('staff', 'name email phone')
            .populate('approvedBy', 'name');

        const total = await BillRequest.countDocuments(query);

        // Calculate statistics
        const stats = await BillRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$requestedAmount' },
                    avgAmount: { $avg: '$requestedAmount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            bills,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats
        });

    } catch (error) {
        console.error('Error fetching bill requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bill requests'
        });
    }
};

// Get single bill request
const getBillRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const bill = await BillRequest.findById(id)
            .populate('staff', 'name email phone')
            .populate('approvedBy', 'name');

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        res.status(200).json({
            success: true,
            bill
        });

    } catch (error) {
        console.error('Error fetching bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bill request'
        });
    }
};

// Update bill request (for admin)
const updateBillRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedAmount, adminNotes } = req.body;

        const bill = await BillRequest.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        // Update fields
        if (status) bill.status = status;
        if (approvedAmount) bill.approvedAmount = parseFloat(approvedAmount);
        if (adminNotes) bill.adminNotes = adminNotes;
        
        if (status === 'approved' || status === 'rejected') {
            bill.processedAt = new Date();
            bill.approvedBy = req.user.id;
        }

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill request updated successfully',
            bill
        });

    } catch (error) {
        console.error('Error updating bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating bill request'
        });
    }
};

// Submit bill request (for staff)
const submitBillRequest = async (req, res) => {
    try {
        const { amount, category, description, receipts } = req.body;
        const staffId = req.user.id;

        // Validate required fields
        if (!amount || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Amount, category, and description are required'
            });
        }

        // Create new bill request
        const billRequest = new BillRequest({
            staff: staffId,
            requestedAmount: parseFloat(amount),
            category,
            description,
            receipts: receipts || [],
            status: 'pending',
            submittedAt: new Date()
        });

        await billRequest.save();

        res.status(201).json({
            success: true,
            message: 'Bill request submitted successfully',
            bill: billRequest
        });

    } catch (error) {
        console.error('Error submitting bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Get staff's bill requests
const getStaffBillRequests = async (req, res) => {
    try {
        const staffId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        let query = { staff: staffId };
        if (status) {
            query.status = status;
        }

        const bills = await BillRequest.find(query)
            .sort({ submittedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('staff', 'name email')
            .populate('approvedBy', 'name');

        const total = await BillRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            bills,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Error fetching staff bill requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bill requests'
        });
    }
};

// Get all staff members (for admin)
const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' })
            .select('name email phone')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            staff
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching staff members'
        });
    }
};

// Generate bill report
const generateBillReport = async (req, res) => {
    try {
        const { dateFrom, dateTo, status, format = 'excel' } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                query.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
            }
        }

        const bills = await BillRequest.find(query)
            .populate('staff', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        const reportData = {
            summary: {
                totalBills: bills.length,
                totalAmount: bills.reduce((sum, bill) => sum + bill.requestedAmount, 0),
                approvedAmount: bills.reduce((sum, bill) => sum + (bill.approvedAmount || 0), 0),
                pendingBills: bills.filter(bill => bill.status === 'pending').length,
                approvedBills: bills.filter(bill => bill.status === 'approved').length,
                rejectedBills: bills.filter(bill => bill.status === 'rejected').length
            },
            bills: bills.map(bill => ({
                id: bill._id,
                staffName: bill.staff.name,
                staffEmail: bill.staff.email,
                requestedAmount: bill.requestedAmount,
                approvedAmount: bill.approvedAmount,
                category: bill.category,
                status: bill.status,
                description: bill.description,
                submittedAt: bill.submittedAt,
                processedAt: bill.processedAt,
                approvedBy: bill.approvedBy?.name || 'N/A',
                adminNotes: bill.adminNotes
            }))
        };

        res.status(200).json({
            success: true,
            report: reportData
        });

    } catch (error) {
        console.error('Error generating bill report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating bill report'
        });
    }
};

module.exports = {
    getAllBillRequests,
    getBillRequest,
    updateBillRequest,
    submitBillRequest,
    getStaffBillRequests,
    getAllStaff,
    generateBillReport
};














