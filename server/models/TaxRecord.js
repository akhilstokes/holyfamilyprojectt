const mongoose = require('mongoose');

const taxRecordSchema = new mongoose.Schema({
    type: {
        type: String, // 'gst', 'compliance', 'reminder'
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    // GST specific fields
    sales: Number,
    purchases: Number,
    gstPayable: Number,
    status: {
        type: String,
        default: 'pending', // 'pending', 'filed'
        enum: ['pending', 'filed', 'overdue']
    },
    // Compliance/Reminder specific fields
    title: String,
    description: String,
    dueDate: Date,
    filedDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TaxRecord', taxRecordSchema);
