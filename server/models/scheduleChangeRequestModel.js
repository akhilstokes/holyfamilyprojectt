const mongoose = require('mongoose');

const scheduleChangeRequestSchema = new mongoose.Schema({
  // Staff member making the request
  staff: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Date for which the schedule change is requested
  requestDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  // Current shift assignment for that date
  currentShift: { 
    type: String, 
    enum: ['Morning', 'Evening'], 
    required: true 
  },
  
  // Requested new shift (or day off)
  requestedShift: { 
    type: String, 
    enum: ['Morning', 'Evening', 'Off'], 
    required: true 
  },
  
  // Reason for the change request
  reason: { 
    type: String, 
    required: true,
    maxlength: 500 
  },
  
  // Request status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending',
    index: true 
  },
  
  // Manager response
  managerResponse: { 
    type: String, 
    maxlength: 500 
  },
  
  // Manager who reviewed the request
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // When the request was reviewed
  reviewedAt: { 
    type: Date 
  },
  
  // Priority level (for urgent requests)
  priority: { 
    type: String, 
    enum: ['normal', 'urgent'], 
    default: 'normal' 
  },
  
  // Whether this affects other staff (for manager consideration)
  affectsOthers: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Indexes for efficient queries
scheduleChangeRequestSchema.index({ staff: 1, createdAt: -1 });
scheduleChangeRequestSchema.index({ status: 1, createdAt: -1 });
scheduleChangeRequestSchema.index({ requestDate: 1, status: 1 });

// Prevent duplicate requests for same staff and date
scheduleChangeRequestSchema.index({ 
  staff: 1, 
  requestDate: 1, 
  status: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: 'pending' }
});

// Virtual for checking if request is still editable
scheduleChangeRequestSchema.virtual('isEditable').get(function() {
  return this.status === 'pending' && this.requestDate > new Date();
});

// Virtual for checking if request is expired
scheduleChangeRequestSchema.virtual('isExpired').get(function() {
  return this.requestDate < new Date() && this.status === 'pending';
});

// Pre-save middleware to validate request date
scheduleChangeRequestSchema.pre('save', function(next) {
  // Request date should be in the future (at least 24 hours ahead)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  if (this.requestDate < tomorrow) {
    return next(new Error('Schedule change requests must be made at least 24 hours in advance'));
  }
  
  // Request date should not be more than 2 weeks in advance
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  
  if (this.requestDate > maxDate) {
    return next(new Error('Schedule change requests cannot be made more than 2 weeks in advance'));
  }
  
  next();
});

// Static method to get pending requests for managers
scheduleChangeRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .populate('staff', 'name email staffId')
    .sort({ createdAt: -1 });
};

// Static method to get requests by staff member
scheduleChangeRequestSchema.statics.getByStaff = function(staffId) {
  return this.find({ staff: staffId })
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
};

// Instance method to approve request
scheduleChangeRequestSchema.methods.approve = function(managerId, response) {
  this.status = 'approved';
  this.reviewedBy = managerId;
  this.reviewedAt = new Date();
  if (response) this.managerResponse = response;
  return this.save();
};

// Instance method to reject request
scheduleChangeRequestSchema.methods.reject = function(managerId, response) {
  this.status = 'rejected';
  this.reviewedBy = managerId;
  this.reviewedAt = new Date();
  if (response) this.managerResponse = response;
  return this.save();
};

module.exports = mongoose.model('ScheduleChangeRequest', scheduleChangeRequestSchema);










