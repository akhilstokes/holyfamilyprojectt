const mongoose = require('mongoose');

const billRequestSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    approvedAmount: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Transportation', 'Materials', 'Equipment', 'Meals', 'Accommodation', 'Other']
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    receipts: [{
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'manager_approved', 'manager_rejected', 'admin_approved', 'admin_rejected', 'processing'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: '',
        maxlength: 1000
    },
    expenseDate: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    managerApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    managerApprovedAt: {
        type: Date
    },
    managerNotes: {
        type: String,
        default: '',
        maxlength: 1000
    },
    adminApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminApprovedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
billRequestSchema.index({ staff: 1, submittedAt: -1 });
billRequestSchema.index({ status: 1 });
billRequestSchema.index({ submittedAt: -1 });
billRequestSchema.index({ category: 1 });

// Virtual for approval status
billRequestSchema.virtual('isApproved').get(function() {
    return this.status === 'admin_approved';
});

// Virtual for manager approval status
billRequestSchema.virtual('isManagerApproved').get(function() {
    return this.status === 'manager_approved';
});

// Virtual for final approval status
billRequestSchema.virtual('isFinalApproved').get(function() {
    return this.status === 'admin_approved';
});

// Virtual for processing time
billRequestSchema.virtual('processingTime').get(function() {
    if (this.processedAt && this.submittedAt) {
        return Math.ceil((this.processedAt - this.submittedAt) / (1000 * 60 * 60 * 24)); // days
    }
    return null;
});

// Method to calculate approval percentage
billRequestSchema.methods.getApprovalPercentage = function() {
    if (this.approvedAmount && this.requestedAmount) {
        return ((this.approvedAmount / this.requestedAmount) * 100).toFixed(2);
    }
    return 0;
};

// Pre-save middleware to update timestamps
billRequestSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (this.status === 'manager_approved' || this.status === 'manager_rejected') {
            this.managerApprovedAt = new Date();
        }
        if (this.status === 'admin_approved' || this.status === 'admin_rejected') {
            this.adminApprovedAt = new Date();
            this.processedAt = new Date();
        }
    }
    next();
});

// Static method to get monthly statistics
billRequestSchema.statics.getMonthlyStats = async function(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return await this.aggregate([
        {
            $match: {
                submittedAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$requestedAmount' },
                avgAmount: { $avg: '$requestedAmount' }
            }
        }
    ]);
};

module.exports = mongoose.model('BillRequest', billRequestSchema);