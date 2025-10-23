const BillRequest = require('../models/billRequestModel');
const User = require('../models/userModel');

// Get pending bill requests for manager review
const getPendingBillRequests = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

        const query = { status: 'pending' };

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const bills = await BillRequest.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('staff', 'name email phone staffId')
            .populate('approvedBy', 'name');

        const total = await BillRequest.countDocuments(query);

        // Calculate statistics for pending bills
        const stats = await BillRequest.aggregate([
            { $match: { status: 'pending' } },
            {
                $group: {
                    _id: '$category',
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
        console.error('Error fetching pending bill requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending bill requests'
        });
    }
};

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
            .populate('approvedBy', 'name')
            .populate('managerApprovedBy', 'name')
            .populate('adminApprovedBy', 'name');

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
            .populate('approvedBy', 'name')
            .populate('managerApprovedBy', 'name')
            .populate('adminApprovedBy', 'name');

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

// Manager approval of bill request
const managerApproveBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedAmount, managerNotes } = req.body;

        const bill = await BillRequest.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        if (bill.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bills can be approved by manager'
            });
        }

        // Update fields
        bill.status = 'manager_approved';
        if (approvedAmount) bill.approvedAmount = parseFloat(approvedAmount);
        if (managerNotes) bill.managerNotes = managerNotes;
        bill.managerApprovedBy = req.user._id;
        bill.managerApprovedAt = new Date();

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill request approved by manager',
            bill
        });

    } catch (error) {
        console.error('Error approving bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving bill request'
        });
    }
};

// Manager rejection of bill request
const managerRejectBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerNotes } = req.body;

        const bill = await BillRequest.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        if (bill.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bills can be rejected by manager'
            });
        }

        // Update fields
        bill.status = 'manager_rejected';
        if (managerNotes) bill.managerNotes = managerNotes;
        bill.managerApprovedBy = req.user._id;
        bill.managerApprovedAt = new Date();

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill request rejected by manager',
            bill
        });

    } catch (error) {
        console.error('Error rejecting bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting bill request'
        });
    }
};

// Admin final approval of bill request
const adminApproveBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedAmount, adminNotes } = req.body;

        const bill = await BillRequest.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        if (bill.status !== 'manager_approved') {
            return res.status(400).json({
                success: false,
                message: 'Only manager-approved bills can be approved by admin'
            });
        }

        // Update fields
        bill.status = 'admin_approved';
        if (approvedAmount) bill.approvedAmount = parseFloat(approvedAmount);
        if (adminNotes) bill.adminNotes = adminNotes;
        bill.adminApprovedBy = req.user._id;
        bill.adminApprovedAt = new Date();
        bill.processedAt = new Date();

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill request approved by admin',
            bill
        });

    } catch (error) {
        console.error('Error approving bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving bill request'
        });
    }
};

// Admin final rejection of bill request
const adminRejectBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const bill = await BillRequest.findById(id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill request not found'
            });
        }

        if (bill.status !== 'manager_approved') {
            return res.status(400).json({
                success: false,
                message: 'Only manager-approved bills can be rejected by admin'
            });
        }

        // Update fields
        bill.status = 'admin_rejected';
        if (adminNotes) bill.adminNotes = adminNotes;
        bill.adminApprovedBy = req.user._id;
        bill.adminApprovedAt = new Date();
        bill.processedAt = new Date();

        await bill.save();

        res.status(200).json({
            success: true,
            message: 'Bill request rejected by admin',
            bill
        });

    } catch (error) {
        console.error('Error rejecting bill request:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting bill request'
        });
    }
};

// Update bill request (for admin) - legacy function
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
        
        if (status === 'admin_approved' || status === 'admin_rejected') {
            bill.processedAt = new Date();
            bill.adminApprovedBy = req.user._id;
            bill.adminApprovedAt = new Date();
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
        const { amount, category, description, receipts, expenseDate } = req.body;
        const staffId = req.user._id;

        // Validate required fields
        if (!amount || !category || !description) {
            return res.status(400).json({
                success: false,
                message: 'Amount, category, and description are required'
            });
        }

        // Enhanced validation
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be a positive number'
            });
        }

        if (parseFloat(amount) > 100000) {
            return res.status(400).json({
                success: false,
                message: 'Amount seems too high. Please verify the amount.'
            });
        }

        if (description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 10 characters long'
            });
        }

        if (description.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Description is too long (maximum 500 characters)'
            });
        }

        // Date validation
        let expenseDateObj = null;
        if (expenseDate) {
            expenseDateObj = new Date(expenseDate);
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            if (expenseDateObj > today) {
                return res.status(400).json({
                    success: false,
                    message: 'Expense date cannot be in the future'
                });
            }

            if (expenseDateObj < thirtyDaysAgo) {
                return res.status(400).json({
                    success: false,
                    message: 'Expense date cannot be more than 30 days ago'
                });
            }
        }

        // Create new bill request
        const billRequest = new BillRequest({
            staff: staffId,
            requestedAmount: parseFloat(amount),
            category,
            description: description.trim(),
            receipts: receipts || [],
            expenseDate: expenseDateObj || new Date(),
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
        const staffId = req.user._id;
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
    getPendingBillRequests,
    getAllBillRequests,
    getBillRequest,
    updateBillRequest,
    submitBillRequest,
    getStaffBillRequests,
    getAllStaff,
    generateBillReport,
    managerApproveBill,
    managerRejectBill,
    adminApproveBill,
    adminRejectBill
};

















































