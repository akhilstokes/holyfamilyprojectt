const User = require('../models/userModel');
const UserActivity = require('../models/userActivityModel');
const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const BillRequest = require('../models/billRequestModel');
const DailyRate = require('../models/dailyRateModel');
const LatexRequest = require('../models/latexRequestModel');
const Barrel = require('../models/barrelModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Get all users with filtering and pagination
const getAllUsers = async (req, res) => {
    try {
        const { 
            role, 
            status, 
            search, 
            page = 1, 
            
            limit = 20, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        let query = {};
        
        // Filter by role
        if (role) {
            query.role = role;
        }
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('-password')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        // Get user statistics
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } }
                }
            }
        ]);

        // Log admin activity
        await logUserActivity(req.user._id, 'view_dashboard', 'Viewed user management dashboard', req.ip, req.get('User-Agent'));

        res.status(200).json({
            success: true,
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// Get single user details
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format'
            });
        }

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's recent activities
        const activities = await UserActivity.find({ user: id })
            .sort({ timestamp: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            user,
            activities
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
};

// Add new user (admin-created)
const addUser = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine initial status
        const initialStatus = role === 'user' ? 'pending' : 'active';

        // Create new user
        const newUser = new User({
            name,
            email,
            phoneNumber: phoneNumber || '0000000000',
            password: hashedPassword,
            role,
            status: initialStatus
        });

        await newUser.save();

        // Log admin activity
        await logUserActivity(req.user._id, 'add_user', `Added new ${role}: ${name}`, req.ip, req.get('User-Agent'), {
            newUserId: newUser._id,
            newUserEmail: email
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding user'
        });
    }
};

// Update user status (approve/suspend/activate)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldStatus = user.status;
        user.status = status;
        user.statusUpdatedAt = new Date();
        user.statusUpdatedBy = req.user._id;
        
        if (reason) {
            user.statusReason = reason;
        }

        await user.save();

        // Log admin activity
        await logUserActivity(req.user._id, 'change_role', `Changed ${user.name}'s status from ${oldStatus} to ${status}`, req.ip, req.get('User-Agent'), {
            targetUserId: user._id,
            oldStatus,
            newStatus: status,
            reason
        });

        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                status: user.status,
                statusUpdatedAt: user.statusUpdatedAt
            }
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldRole = user.role;
        user.role = role;
        user.roleUpdatedAt = new Date();
        user.roleUpdatedBy = req.user._id;

        await user.save();

        // Log admin activity
        await logUserActivity(req.user._id, 'change_role', `Changed ${user.name}'s role from ${oldRole} to ${role}`, req.ip, req.get('User-Agent'), {
            targetUserId: user._id,
            oldRole,
            newRole: role
        });

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roleUpdatedAt: user.roleUpdatedAt
            }
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};

// Get user activity logs
const getUserActivityLogs = async (req, res) => {
    try {
        const { 
            userId, 
            action, 
            dateFrom, 
            dateTo, 
            page = 1, 
            limit = 50 
        } = req.query;

        let query = {};
        
        if (userId) {
            query.user = userId;
        }
        
        if (action) {
            query.action = action;
        }
        
        if (dateFrom || dateTo) {
            query.timestamp = {};
            if (dateFrom) {
                query.timestamp.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.timestamp.$lte = new Date(dateTo + 'T23:59:59.999Z');
            }
        }

        const activities = await UserActivity.find(query)
            .populate('user', 'name email role')
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await UserActivity.countDocuments(query);

        // Get activity statistics
        const activityStats = await UserActivity.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            activities,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            activityStats
        });

    } catch (error) {
        console.error('Error fetching user activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user activity logs'
        });
    }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // Soft delete by setting status to deleted
        user.status = 'deleted';
        user.deletedAt = new Date();
        user.deletedBy = req.user._id;

        await user.save();

        // Log admin activity
        await logUserActivity(req.user._id, 'suspend_user', `Deleted user: ${user.name}`, req.ip, req.get('User-Agent'), {
            targetUserId: user._id,
            targetUserEmail: user.email
        });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Bulk actions (approve multiple customers, suspend multiple users)
const bulkUserActions = async (req, res) => {
    try {
        const { userIds, action, reason } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs are required'
            });
        }

        const validActions = ['approve', 'suspend', 'activate', 'delete'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action'
            });
        }

        const users = await User.find({ _id: { $in: userIds } });
        
        if (users.length !== userIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some users not found'
            });
        }

        const updateData = {};
        const timestamp = new Date();

        switch (action) {
            case 'approve':
                updateData.status = 'active';
                updateData.statusUpdatedAt = timestamp;
                updateData.statusUpdatedBy = req.user._id;
                break;
            case 'suspend':
                updateData.status = 'suspended';
                updateData.statusUpdatedAt = timestamp;
                updateData.statusUpdatedBy = req.user._id;
                break;
            case 'activate':
                updateData.status = 'active';
                updateData.statusUpdatedAt = timestamp;
                updateData.statusUpdatedBy = req.user._id;
                break;
            case 'delete':
                updateData.status = 'deleted';
                updateData.deletedAt = timestamp;
                updateData.deletedBy = req.user._id;
                break;
        }

        if (reason) {
            updateData.statusReason = reason;
        }

        await User.updateMany(
            { _id: { $in: userIds } },
            updateData
        );

        // Log admin activity
        await logUserActivity(req.user._id, 'change_role', `Bulk ${action} action on ${userIds.length} users`, req.ip, req.get('User-Agent'), {
            action,
            userIds,
            reason
        });

        res.status(200).json({
            success: true,
            message: `Bulk ${action} action completed successfully`,
            affectedUsers: userIds.length
        });

    } catch (error) {
        console.error('Error performing bulk user actions:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk user actions'
        });
    }
};

// Admin dashboard high-level statistics
const getAdminStats = async (req, res) => {
    try {
        // Users by role and status
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const usersByStatus = await User.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Pending approvals / queues
        const [
            pendingBills,
            pendingRates,
            pendingLeaves,
            pendingLatex,
            disposalRequests,
            unverifiedAttendance
        ] = await Promise.all([
            BillRequest.countDocuments({ status: { $in: ['pending', 'manager_approved'] } }),
            DailyRate.countDocuments({ status: 'pending_approval' }),
            Leave.countDocuments({ status: 'pending' }),
            LatexRequest.countDocuments({ status: { $in: ['pending', 'processing'] } }),
            Barrel.countDocuments({ disposalRequested: true }),
            Attendance.countDocuments({ verified: { $ne: true } })
        ]);

        res.status(200).json({
            success: true,
            users: {
                byRole: usersByRole,
                byStatus: usersByStatus
            },
            queues: {
                pendingBills,
                pendingRates,
                pendingLeaves,
                pendingLatex,
                disposalRequests,
                unverifiedAttendance
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin stats' });
    }
};

// Helper function to log user activity
const logUserActivity = async (userId, action, description, ipAddress, userAgent, metadata = {}) => {
    try {
        // Only log activity if userId is provided (skip for system operations)
        if (!userId) {
            return;
        }
        // Skip logging if userId is not a valid ObjectId (e.g., built-in tokens)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return;
        }

        const activity = new UserActivity({
            user: userId,
            action,
            description,
            ipAddress,
            userAgent,
            metadata
        });
        await activity.save();
    } catch (error) {
        console.error('Error logging user activity:', error);
    }
};

// Seed a demo field staff user (for testing leave management etc.)
const seedDemoStaff = async (req, res) => {
    try {
        const email = 'demo.staff@hfp.local';
        let user = await User.findOne({ email });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Demo@1234', salt);
            user = await User.create({
                name: 'Demo Staff',
                email,
                phoneNumber: '9876543210',
                password: hashedPassword,
                role: 'field_staff',
                status: 'active'
            });
        }

        await logUserActivity(req.user._id, 'add_user', 'Seeded demo staff', req.ip, req.get('User-Agent'), { userId: user._id });

        return res.status(200).json({
            success: true,
            message: 'Demo staff ready',
            credentials: { email: user.email, password: 'Demo@1234' },
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
        });
    } catch (error) {
        console.error('Seed demo staff error:', error);
        return res.status(500).json({ success: false, message: 'Failed to seed demo staff' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    addUser,
    updateUserStatus,
    updateUserRole,
    getUserActivityLogs,
    deleteUser,
    bulkUserActions,
    getAdminStats
}; // seedDemoStaff intentionally not exported (demo data creation disabled)



































