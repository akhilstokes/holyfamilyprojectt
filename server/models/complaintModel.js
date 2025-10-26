const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Basic complaint information
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['workplace', 'equipment', 'safety', 'hr', 'management', 'other']
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: { 
    type: String, 
    required: true,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // User information
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reportedByName: { type: String, required: true },
  reportedByRole: { type: String, required: true },
  
  // Assignment and resolution
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedToName: { type: String },
  assignedToRole: { type: String },
  
  // Timestamps
  reportedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  
  // Resolution details
  resolution: { type: String },
  resolutionNotes: { type: String },
  resolvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  resolvedByName: { type: String },
  
  // Additional information
  location: { type: String },
  department: { type: String },
  attachments: [{ 
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Follow-up and feedback
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  feedback: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  
  // Internal notes (visible only to managers/admins)
  internalNotes: [{ 
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedByName: String,
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
complaintSchema.index({ reportedBy: 1, reportedAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ reportedAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);




