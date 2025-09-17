const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: ['scraping', 'inventory', 'barrel', 'other'], default: 'other' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open', index: true },
    adminResponse: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IssueReport', issueReportSchema);


