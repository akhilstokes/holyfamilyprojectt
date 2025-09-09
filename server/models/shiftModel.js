const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    shiftType: {
        type: String,
        enum: ['Morning', 'Evening', 'Night'], // support 3-shift rotation
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    assignedStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);