const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift'
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day'],
    default: 'absent'
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  checkInLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  checkOutLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  workingHours: {
    type: Number, // in minutes
    default: 0
  },
  overtimeHours: {
    type: Number, // in minutes
    default: 0
  },
  // Who marked this attendance (admin/manager/accountant or self)
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  markedByRole: {
    type: String,
    trim: true,
    maxlength: 64
  },
  markedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
attendanceSchema.index({ staff: 1, date: -1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ shift: 1 });
attendanceSchema.index({ checkIn: 1 });
attendanceSchema.index({ checkOut: 1 });

// Virtual for working hours in hours
attendanceSchema.virtual('workingHoursFormatted').get(function() {
  if (!this.workingHours) return '0h 0m';
  const hours = Math.floor(this.workingHours / 60);
  const minutes = this.workingHours % 60;
  return `${hours}h ${minutes}m`;
});

// Virtual for overtime hours in hours
attendanceSchema.virtual('overtimeHoursFormatted').get(function() {
  if (!this.overtimeHours) return '0h 0m';
  const hours = Math.floor(this.overtimeHours / 60);
  const minutes = this.overtimeHours % 60;
  return `${hours}h ${minutes}m`;
});

// Virtuals to align legacy "verified*" fields with approved* fields
attendanceSchema.virtual('verifiedBy', {
  ref: 'User',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true
});

attendanceSchema.virtual('verifiedAt').get(function() {
  return this.approvedAt;
});

// Pre-save middleware to calculate working hours and status
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    // Calculate working hours
    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    const diffMs = end - start;
    this.workingHours = Math.floor(diffMs / (1000 * 60)); // in minutes
    
    // Calculate overtime if applicable
    if (this.shift) {
      // This would need to be calculated based on shift duration
      // For now, we'll assume 8 hours (480 minutes) as standard
      const standardHours = 8 * 60; // 8 hours in minutes
      if (this.workingHours > standardHours) {
        this.overtimeHours = this.workingHours - standardHours;
      }
    }
  }
  
  // Determine if late
  if (this.checkIn && this.shift) {
    const shiftStart = new Date(this.checkIn);
    shiftStart.setHours(parseInt(this.shift.startTime.split(':')[0]));
    shiftStart.setMinutes(parseInt(this.shift.startTime.split(':')[1]));
    shiftStart.setSeconds(0);
    
    const gracePeriodEnd = new Date(shiftStart.getTime() + this.shift.gracePeriod * 60 * 1000);
    
    if (this.checkIn > gracePeriodEnd) {
      this.isLate = true;
      this.lateMinutes = Math.floor((this.checkIn - gracePeriodEnd) / (1000 * 60));
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
  
  next();
});

// Static method to get attendance summary for a date range
attendanceSchema.statics.getAttendanceSummary = async function(startDate, endDate, staffId = null) {
  const matchQuery = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (staffId) {
    matchQuery.staff = staffId;
  }
  
  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalWorkingHours: { $sum: '$workingHours' },
        totalOvertimeHours: { $sum: '$overtimeHours' }
      }
    }
  ]);
};

// Static method to get staff attendance for a specific date
attendanceSchema.statics.getStaffAttendance = async function(staffId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.findOne({
    staff: staffId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).populate('shift', 'name startTime endTime gracePeriod');
};

// Static method to get today's attendance for all staff
attendanceSchema.statics.getTodayAttendance = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await this.find({
    date: {
      $gte: today,
      $lte: endOfDay
    }
  })
  .populate('staff', 'name email role')
  .populate('shift', 'name startTime endTime')
  .populate('markedBy', 'name email role')
  .sort({ checkIn: -1 });
};

module.exports = mongoose.model('Attendance', attendanceSchema);