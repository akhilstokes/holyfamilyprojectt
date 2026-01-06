const mongoose = require('mongoose');

const shiftAssignmentSchema = new mongoose.Schema({
  // Reference to the shift template
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  
  // Staff member assigned to this shift
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Specific date for this assignment
  date: {
    type: Date,
    required: true
  },
  
  // Assignment status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Actual times (may differ from scheduled times)
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  
  // Break records
  breaks: [{
    name: String,
    startTime: Date,
    endTime: Date,
    duration: Number // in minutes
  }],
  
  // Overtime information
  overtime: {
    approved: {
      type: Boolean,
      default: false
    },
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date
  },
  
  // Performance and notes
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ratedAt: Date
  },
  
  // Attendance tracking
  attendance: {
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedOut: {
      type: Boolean,
      default: false
    },
    checkInTime: Date,
    checkOutTime: Date,
    checkInLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    checkOutLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  
  // Replacement information (if staff is replaced)
  replacement: {
    originalStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    replacementStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    replacedAt: Date,
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Special instructions or notes
  notes: {
    type: String,
    trim: true
  },
  
  // Shift-specific requirements met
  requirementsMet: [{
    requirement: String,
    met: Boolean,
    notes: String
  }],
  
  // Compensation details
  compensation: {
    baseHours: {
      type: Number,
      default: 0
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      default: 0
    },
    overtimeRate: {
      type: Number,
      default: 0
    },
    totalPay: {
      type: Number,
      default: 0
    },
    bonuses: [{
      type: String,
      amount: Number,
      reason: String
    }],
    deductions: [{
      type: String,
      amount: Number,
      reason: String
    }]
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total worked hours
shiftAssignmentSchema.virtual('workedHours').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    const diffMs = this.actualEndTime - this.actualStartTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Subtract break time
    const breakMinutes = this.breaks.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0);
    }, 0);
    
    return Math.max(0, diffHours - (breakMinutes / 60));
  }
  return 0;
});

// Virtual for scheduled hours
shiftAssignmentSchema.virtual('scheduledHours').get(function() {
  if (this.shift && this.shift.durationHours) {
    return this.shift.durationHours;
  }
  return 0;
});

// Virtual for late arrival (in minutes)
shiftAssignmentSchema.virtual('lateMinutes').get(function() {
  if (this.actualStartTime && this.shift) {
    const scheduledStart = new Date(this.date);
    const [hours, minutes] = this.shift.startTime.split(':');
    scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = this.actualStartTime - scheduledStart;
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }
  return 0;
});

// Virtual for early departure (in minutes)
shiftAssignmentSchema.virtual('earlyDepartureMinutes').get(function() {
  if (this.actualEndTime && this.shift) {
    const scheduledEnd = new Date(this.date);
    const [hours, minutes] = this.shift.endTime.split(':');
    scheduledEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Handle overnight shifts
    if (this.shift.isOvernightShift && this.shift.isOvernightShift()) {
      scheduledEnd.setDate(scheduledEnd.getDate() + 1);
    }
    
    const diffMs = scheduledEnd - this.actualEndTime;
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }
  return 0;
});

// Indexes for better query performance
shiftAssignmentSchema.index({ shift: 1, date: 1 });
shiftAssignmentSchema.index({ staff: 1, date: 1 });
shiftAssignmentSchema.index({ date: 1, status: 1 });
shiftAssignmentSchema.index({ 'attendance.checkedIn': 1, 'attendance.checkedOut': 1 });
shiftAssignmentSchema.index({ createdAt: -1 });

// Compound index for efficient queries
shiftAssignmentSchema.index({ staff: 1, date: 1, status: 1 });

// Pre-save middleware to calculate compensation
shiftAssignmentSchema.pre('save', function(next) {
  if (this.workedHours > 0 && this.compensation.hourlyRate > 0) {
    const baseHours = Math.min(this.workedHours, this.scheduledHours);
    const overtimeHours = Math.max(0, this.workedHours - this.scheduledHours);
    
    this.compensation.baseHours = baseHours;
    this.compensation.overtimeHours = overtimeHours;
    this.compensation.totalHours = this.workedHours;
    
    const basePay = baseHours * this.compensation.hourlyRate;
    const overtimePay = overtimeHours * (this.compensation.overtimeRate || this.compensation.hourlyRate * 1.5);
    
    const bonusTotal = this.compensation.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const deductionTotal = this.compensation.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    
    this.compensation.totalPay = basePay + overtimePay + bonusTotal - deductionTotal;
  }
  
  next();
});

// Static method to get assignments by date range
shiftAssignmentSchema.statics.getAssignmentsByDateRange = function(startDate, endDate, options = {}) {
  const query = {
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (options.staff) query.staff = options.staff;
  if (options.shift) query.shift = options.shift;
  if (options.status) query.status = options.status;
  
  return this.find(query)
    .populate('shift', 'name type startTime endTime category')
    .populate('staff', 'name email phone')
    .sort({ date: 1, 'shift.startTime': 1 });
};

// Static method to get staff availability
shiftAssignmentSchema.statics.getStaffAvailability = function(date, staffId) {
  return this.find({
    date: date,
    staff: staffId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
  }).populate('shift', 'startTime endTime');
};

// Instance method to check if assignment conflicts with another
shiftAssignmentSchema.methods.hasConflictWith = function(otherAssignment) {
  if (this.date.toDateString() !== otherAssignment.date.toDateString()) {
    return false;
  }
  
  // Compare shift times
  const thisStart = this.shift.startTime;
  const thisEnd = this.shift.endTime;
  const otherStart = otherAssignment.shift.startTime;
  const otherEnd = otherAssignment.shift.endTime;
  
  // Simple time overlap check (assumes same day)
  return (thisStart < otherEnd && thisEnd > otherStart);
};

// Instance method to mark as completed
shiftAssignmentSchema.methods.markCompleted = function(endTime = new Date()) {
  this.status = 'completed';
  this.actualEndTime = endTime;
  this.attendance.checkedOut = true;
  this.attendance.checkOutTime = endTime;
  return this.save();
};

module.exports = mongoose.models.ShiftAssignment || mongoose.model('ShiftAssignment', shiftAssignmentSchema);