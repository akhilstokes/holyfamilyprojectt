const Leave = require('../models/leaveModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// STAFF ROUTES
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, dayType } = req.body;
        const leave = new Leave({
            staff: req.user._id,
            leaveType,
            dayType: dayType === 'half' ? 'half' : 'full',
            startDate,
            endDate,
            reason
        });
        await leave.save();
        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// MANAGER/ADMIN: Get history for a specific staff member
exports.getStaffHistory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid staff id' });
        }
        const staff = new mongoose.Types.ObjectId(id);
        const leaves = await Leave.find({ staff }).sort({ appliedAt: -1 });
        return res.status(200).json({ leaves });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.viewMyLeaves = async (req, res) => {
    try {
        const user = req.user || {};
        const id = user._id || user.id || user.userId;
        if (!id) return res.status(400).json({ message: 'Invalid authenticated user.' });
        const staff = mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)
          : null;
        if (!staff) return res.status(400).json({ message: 'Invalid user id' });
        const leaves = await Leave.find({ staff }).sort({ appliedAt: -1 });
        res.status(200).json({ leaves });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findOne({ _id: req.params.leaveId, staff: req.user._id });
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });

        await leave.remove();
        res.status(200).json({ message: 'Leave cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ADMIN ROUTES
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({}).populate('staff', 'name email').sort({ appliedAt: -1 });
        res.status(200).json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = status;
        leave.approvedBy = req.user._id; // Admin who approved/rejected
        await leave.save();

        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get leave statistics for admin dashboard
exports.getLeaveStats = async (req, res) => {
    try {
        const stats = await Leave.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object for easier frontend consumption
        const leaveStats = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            leaveStats[stat._id] = stat.count;
            leaveStats.total += stat.count;
        });

        res.status(200).json({
            success: true,
            ...leaveStats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server Error', 
            error: error.message 
        });
    }
};

// MANAGER ROUTES
exports.getPendingLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ status: 'pending' })
            .populate('staff', 'name email')
            .sort({ appliedAt: -1 });
        // Map to include staffName for convenience
        const records = leaves.map(l => ({
            _id: l._id,
            staff: l.staff?._id || null,
            staffName: l.staff?.name || '',
            leaveType: l.leaveType,
            dayType: l.dayType,
            startDate: l.startDate,
            endDate: l.endDate,
            reason: l.reason,
            status: l.status,
            appliedAt: l.appliedAt,
        }));
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.managerApproveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be approved' });
        leave.status = 'approved';
        leave.approvedBy = req.user._id;
        await leave.save();
        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.managerRejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be rejected' });
        leave.status = 'rejected';
        leave.approvedBy = req.user._id;
        await leave.save();
        res.status(200).json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPendingLeavesCount = async (req, res) => {
    try {
        const count = await Leave.countDocuments({ status: 'pending' });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
