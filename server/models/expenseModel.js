const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
});

const expenseSchema = new mongoose.Schema({
    expenseNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    partyName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Office Supplies',
            'Travel & Transport',
            'Utilities',
            'Marketing',
            'Equipment',
            'Professional Services',
            'Maintenance',
            'Other'
        ]
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    items: [expenseItemSchema],
    gstEnabled: {
        type: Boolean,
        default: false
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for better query performance
expenseSchema.index({ expenseNumber: 1 });
expenseSchema.index({ createdBy: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });

// Virtual for subtotal calculation
expenseSchema.virtual('subtotal').get(function() {
    return this.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
});

// Pre-save middleware to calculate totals
expenseSchema.pre('save', function(next) {
    const subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
    
    if (this.gstEnabled) {
        this.gstAmount = subtotal * 0.18;
        this.totalAmount = subtotal + this.gstAmount;
    } else {
        this.gstAmount = 0;
        this.totalAmount = subtotal;
    }
    
    next();
});

// Static method to generate expense number
expenseSchema.statics.generateExpenseNumber = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EXP-${year}${month}${day}-${random}`;
};

// Instance method to approve expense
expenseSchema.methods.approve = function(approvedBy) {
    this.status = 'approved';
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    return this.save();
};

// Instance method to reject expense
expenseSchema.methods.reject = function(rejectionReason) {
    this.status = 'rejected';
    this.rejectionReason = rejectionReason;
    return this.save();
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;