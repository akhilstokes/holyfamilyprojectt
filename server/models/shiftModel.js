const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  gracePeriod: {
    type: Number,
    default: 5,
    min: 0,
    max: 60
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
shiftSchema.index({ name: 1 });
shiftSchema.index({ isActive: 1 });
shiftSchema.index({ assignedStaff: 1 });

// Virtual for shift duration
shiftSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  
  if (end < start) {
    // Handle overnight shifts
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHours}h ${diffMinutes}m`;
});

// Method to check if current time is within shift
shiftSchema.methods.isWithinShift = function(date = new Date()) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const shiftStart = new Date(`${today}T${this.startTime}:00`);
  const shiftEnd = new Date(`${today}T${this.endTime}:00`);
  
  // Handle overnight shifts
  if (shiftEnd < shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }
  
  return now >= shiftStart && now <= shiftEnd;
};

// Method to check if within grace period
shiftSchema.methods.isWithinGracePeriod = function(date = new Date()) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const shiftStart = new Date(`${today}T${this.startTime}:00`);
  const gracePeriodEnd = new Date(shiftStart.getTime() + this.gracePeriod * 60 * 1000);
  
  return now >= shiftStart && now <= gracePeriodEnd;
};

// Method to get grace period end time
shiftSchema.methods.getGracePeriodEnd = function(date = new Date()) {
  const today = date.toISOString().split('T')[0];
  const shiftStart = new Date(`${today}T${this.startTime}:00`);
  return new Date(shiftStart.getTime() + this.gracePeriod * 60 * 1000);
};

module.exports = mongoose.model('Shift', shiftSchema);