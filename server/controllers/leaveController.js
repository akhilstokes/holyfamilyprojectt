const Leave = require('../models/leaveModel');
const User = require('../models/userModel');

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

exports.viewMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ staff: req.user._id }).sort({ appliedAt: -1 });
        res.status(200).json(leaves);
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
