const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  // Basic shift information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Shift timing
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  
  // Shift type and category
  type: {
    type: String,
    enum: ['morning', 'evening', 'night', 'full_day', 'custom'],
    required: true,
    default: 'morning'
  },
  category: {
    type: String,
    enum: ['production', 'delivery', 'lab', 'admin', 'maintenance', 'security'],
    required: true
  },
  
  // Days of the week this shift applies to
  daysOfWeek: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  }],
  
  // Staff capacity
  minStaff: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  maxStaff: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  
  // Shift status
  isActive: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  
  // Break times
  breaks: [{
    name: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isPaid: {
      type: Boolean,
      default: true
    }
  }],
  
  // Overtime settings
  overtimeSettings: {
    allowOvertime: {
      type: Boolean,
      default: false
    },
    maxOvertimeHours: {
      type: Number,
      default: 2,
      min: 0,
      max: 8
    },
    overtimeRate: {
      type: Number,
      default: 1.5,
      min: 1
    }
  },
  
  // Location and department
  location: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Required skills/roles
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
  // Shift supervisor
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Special requirements
  specialRequirements: {
    type: String,
    trim: true
  },
  
  // Shift color for calendar display
  color: {
    type: String,
    default: '#3b82f6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
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

// Virtual for shift duration in hours
shiftSchema.virtual('durationHours').get(function() {
  const start = this.startTime.split(':');
  const end = this.endTime.split(':');
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  let endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return (endMinutes - startMinutes) / 60;
});

// Virtual for break duration in minutes
shiftSchema.virtual('totalBreakMinutes').get(function() {
  return this.breaks.reduce((total, breakItem) => {
    const start = breakItem.startTime.split(':');
    const end = breakItem.endTime.split(':');
    const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
    return total + (endMinutes - startMinutes);
  }, 0);
});

// Virtual for working hours (excluding breaks)
shiftSchema.virtual('workingHours').get(function() {
  return this.durationHours - (this.totalBreakMinutes / 60);
});

// Indexes for better query performance
shiftSchema.index({ type: 1, category: 1 });
shiftSchema.index({ daysOfWeek: 1 });
shiftSchema.index({ isActive: 1, isTemplate: 1 });
shiftSchema.index({ createdAt: -1 });
shiftSchema.index({ department: 1, location: 1 });

// Pre-save middleware to validate shift times
shiftSchema.pre('save', function(next) {
  // Validate that end time is after start time (for same-day shifts)
  const start = this.startTime.split(':');
  const end = this.endTime.split(':');
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  // Allow overnight shifts
  if (endMinutes <= startMinutes && endMinutes !== 0) {
    // This might be an overnight shift, which is valid
  }
  
  // Validate break times are within shift hours
  for (const breakItem of this.breaks) {
    const breakStart = breakItem.startTime.split(':');
    const breakEnd = breakItem.endTime.split(':');
    const breakStartMinutes = parseInt(breakStart[0]) * 60 + parseInt(breakStart[1]);
    const breakEndMinutes = parseInt(breakEnd[0]) * 60 + parseInt(breakEnd[1]);
    
    if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
      return next(new Error('Break times must be within shift hours'));
    }
    
    if (breakEndMinutes <= breakStartMinutes) {
      return next(new Error('Break end time must be after start time'));
    }
  }
  
  // Validate min/max staff
  if (this.maxStaff < this.minStaff) {
    return next(new Error('Maximum staff must be greater than or equal to minimum staff'));
  }
  
  next();
});

// Static method to get shifts by day of week
shiftSchema.statics.getShiftsByDay = function(dayOfWeek) {
  return this.find({
    daysOfWeek: dayOfWeek,
    isActive: true
  }).populate('supervisor', 'name email');
};

// Static method to get shifts by category
shiftSchema.statics.getShiftsByCategory = function(category) {
  return this.find({
    category: category,
    isActive: true
  }).populate('supervisor', 'name email');
};

// Instance method to check if shift is overnight
shiftSchema.methods.isOvernightShift = function() {
  const start = this.startTime.split(':');
  const end = this.endTime.split(':');
  const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
  const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
  
  return endMinutes < startMinutes;
};

// Instance method to get shift time range as string
shiftSchema.methods.getTimeRange = function() {
  return `${this.startTime} - ${this.endTime}`;
};

module.exports = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);