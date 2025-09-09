const mongoose = require('mongoose');

const latexRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    drcPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    quality: {
        type: String,
        enum: ['Grade A', 'Grade B', 'Grade C'],
        default: 'Grade A'
    },
    location: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    estimatedPayment: {
        type: Number,
        required: true,
        min: 0
    },
    actualPayment: {
        type: Number,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processing', 'completed'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
latexRequestSchema.index({ user: 1, submittedAt: -1 });
latexRequestSchema.index({ status: 1 });
latexRequestSchema.index({ submittedAt: -1 });

// Virtual for dry rubber content calculation
latexRequestSchema.virtual('dryRubberContent').get(function() {
    return (this.quantity * this.drcPercentage / 100).toFixed(2);
});

// Method to calculate payment based on current rates
latexRequestSchema.methods.calculatePayment = function(ratePerKg) {
    const dryContent = this.quantity * this.drcPercentage / 100;
    return dryContent * ratePerKg;
};

// Pre-save middleware to update timestamps
latexRequestSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('LatexRequest', latexRequestSchema);














