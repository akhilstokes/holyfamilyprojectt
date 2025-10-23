const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    barrelIds: [{
        type: String,
        required: true
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card']
    },
    notes: {
        type: String,
        maxlength: 500
    },
    paidAt: {
        type: Date,
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    receiptNumber: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// Generate receipt number before saving
paymentSchema.pre('save', async function(next) {
    if (this.isNew && !this.receiptNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        
        // Get the last receipt number for this month
        const lastPayment = await this.constructor.findOne({
            receiptNumber: new RegExp(`^RCP${year}${month}`)
        }).sort({ receiptNumber: -1 });
        
        let sequence = 1;
        if (lastPayment && lastPayment.receiptNumber) {
            const lastSequence = parseInt(lastPayment.receiptNumber.slice(-4));
            sequence = lastSequence + 1;
        }
        
        this.receiptNumber = `RCP${year}${month}${sequence.toString().padStart(4, '0')}`;
    }
    next();
});

// Index for faster queries
paymentSchema.index({ paidBy: 1, paidAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ barrelIds: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
