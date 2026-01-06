const Expense = require('../models/expenseModel');
const mongoose = require('mongoose');

// Create a new expense
const createExpense = async (req, res) => {
    try {
        const {
            partyName,
            category,
            date,
            description,
            items,
            gstEnabled
        } = req.body;

        // Validate required fields
        if (!partyName || !category || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Party name, category, and at least one item are required'
            });
        }

        // Validate items
        for (const item of items) {
            if (!item.description || !item.quantity || !item.amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have description, quantity, and amount'
                });
            }
        }

        // Generate unique expense number
        let expenseNumber;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
            expenseNumber = Expense.generateExpenseNumber();
            const existingExpense = await Expense.findOne({ expenseNumber });
            if (!existingExpense) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate unique expense number'
            });
        }

        // Create expense
        const expense = new Expense({
            expenseNumber,
            partyName,
            category,
            date: date || new Date(),
            description,
            items,
            gstEnabled: gstEnabled || false,
            createdBy: req.user.id
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });

    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all expenses with filtering and pagination
const getExpenses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            status,
            dateFrom,
            dateTo,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Role-based filtering
        if (req.user.role === 'accountant') {
            // Accountants can see all expenses
        } else if (req.user.role === 'manager') {
            // Managers can see all expenses
        } else {
            // Other users can only see their own expenses
            filter.createdBy = req.user.id;
        }

        // Apply additional filters
        if (search) {
            filter.$or = [
                { expenseNumber: { $regex: search, $options: 'i' } },
                { partyName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (status) {
            filter.status = status;
        }

        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) {
                filter.date.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                filter.date.$lte = new Date(dateTo);
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const expenses = await Expense.find(filter)
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Expense.countDocuments(filter);

        res.json({
            success: true,
            data: {
                expenses,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(id)
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'accountant' && req.user.role !== 'manager' && 
            expense.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: expense
        });

    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'accountant' && req.user.role !== 'manager' && 
            expense.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Don't allow updates to approved expenses unless user is manager/accountant
        if (expense.status === 'approved' && req.user.role !== 'accountant' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Cannot update approved expense'
            });
        }

        // Update expense
        Object.assign(expense, updates);
        await expense.save();

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });

    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'accountant' && req.user.role !== 'manager' && 
            expense.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Don't allow deletion of approved expenses
        if (expense.status === 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete approved expense'
            });
        }

        await Expense.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Approve expense (Manager/Accountant only)
const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        // Check permissions
        if (req.user.role !== 'accountant' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Only managers and accountants can approve expenses'
            });
        }

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Expense is already approved'
            });
        }

        await expense.approve(req.user.id);

        res.json({
            success: true,
            message: 'Expense approved successfully',
            data: expense
        });

    } catch (error) {
        console.error('Error approving expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Reject expense (Manager/Accountant only)
const rejectExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid expense ID'
            });
        }

        // Check permissions
        if (req.user.role !== 'accountant' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Only managers and accountants can reject expenses'
            });
        }

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: 'Expense is already rejected'
            });
        }

        await expense.reject(rejectionReason);

        res.json({
            success: true,
            message: 'Expense rejected successfully',
            data: expense
        });

    } catch (error) {
        console.error('Error rejecting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get expense statistics
const getExpenseStats = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        // Build filter for date range
        const dateFilter = {};
        if (dateFrom || dateTo) {
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);
        }

        const matchStage = {};
        if (Object.keys(dateFilter).length > 0) {
            matchStage.date = dateFilter;
        }

        // Role-based filtering
        if (req.user.role !== 'accountant' && req.user.role !== 'manager') {
            matchStage.createdBy = new mongoose.Types.ObjectId(req.user.id);
        }

        const stats = await Expense.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    pendingExpenses: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approvedExpenses: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejectedExpenses: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    totalGST: { $sum: '$gstAmount' }
                }
            }
        ]);

        // Get category-wise breakdown
        const categoryStats = await Expense.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalExpenses: 0,
                    totalAmount: 0,
                    pendingExpenses: 0,
                    approvedExpenses: 0,
                    rejectedExpenses: 0,
                    totalGST: 0
                },
                categoryBreakdown: categoryStats
            }
        });

    } catch (error) {
        console.error('Error fetching expense stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    getExpenseStats
};