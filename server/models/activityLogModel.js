const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // Who performed the action
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // What action was performed
  action: { 
    type: String, 
    required: true,
    enum: [
      'staff_invited',
      'staff_registered', 
      'staff_approved',
      'attendance_marked',
      'attendance_verified',
      'leave_applied',
      'leave_approved',
      'leave_rejected',
      'rate_updated',
      'rate_approved',
      'salary_processed',
      'document_uploaded',
      'shift_assigned',
      'user_login',
      'user_logout',
      'profile_updated',
      'password_changed'
    ]
  },
  
  // Description of the action
  description: { 
    type: String, 
    required: true 
  },
  
  // What entity was affected (optional)
  entityType: { 
    type: String,
    enum: ['user', 'attendance', 'leave', 'rate', 'salary', 'document', 'shift']
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // IP address and user agent for security
  ipAddress: String,
  userAgent: String,
  
  // Location data for GPS-based actions
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },
  
  // Approval chain tracking
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedAt: Date,
  
  // Status of the action
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  }
}, { 
  timestamps: true 
});

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);


















