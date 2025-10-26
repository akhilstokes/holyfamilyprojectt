const ScheduleChangeRequest = require('../models/scheduleChangeRequestModel');
const WeeklyShiftSchedule = require('../models/weeklyShiftScheduleModel');
const User = require('../models/userModel');

// =================== STAFF SCHEDULE CHANGE REQUESTS ===================

// Create a new schedule change request
exports.createScheduleChangeRequest = async (req, res) => {
  try {
    const staffId = req.user._id;
    const { requestDate, currentShift, requestedShift, reason } = req.body;

    // Validate required fields
    if (!requestDate || !currentShift || !requestedShift || !reason) {
      return res.status(400).json({ 
        message: 'All fields are required: requestDate, currentShift, requestedShift, reason' 
      });
    }

    // Validate date format and future date
    const reqDate = new Date(requestDate);
    if (isNaN(reqDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if staff already has a pending request for this date
    const existingRequest = await ScheduleChangeRequest.findOne({
      staff: staffId,
      requestDate: reqDate,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending schedule change request for this date' 
      });
    }

    // Create the request
    const scheduleRequest = new ScheduleChangeRequest({
      staff: staffId,
      requestDate: reqDate,
      currentShift,
      requestedShift,
      reason: reason.trim()
    });

    await scheduleRequest.save();

    // Populate staff info for response
    await scheduleRequest.populate('staff', 'name email staffId');

    res.status(201).json({
      message: 'Schedule change request submitted successfully',
      request: scheduleRequest
    });
  } catch (error) {
    console.error('Error creating schedule change request:', error);
    if (error.message.includes('24 hours in advance') || error.message.includes('2 weeks in advance')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all schedule change requests for the authenticated staff member
exports.getMyScheduleChangeRequests = async (req, res) => {
  try {
    const staffId = req.user._id;
    const requests = await ScheduleChangeRequest.getByStaff(staffId);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching schedule change requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a schedule change request (only if pending and in future)
exports.updateScheduleChangeRequest = async (req, res) => {
  try {
    const staffId = req.user._id;
    const requestId = req.params.id;
    const { requestDate, currentShift, requestedShift, reason } = req.body;

    const request = await ScheduleChangeRequest.findOne({
      _id: requestId,
      staff: staffId
    });

    if (!request) {
      return res.status(404).json({ message: 'Schedule change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot update a request that has already been reviewed' 
      });
    }

    if (request.requestDate <= new Date()) {
      return res.status(400).json({ 
        message: 'Cannot update a request for a past date' 
      });
    }

    // Update fields if provided
    if (requestDate) {
      const reqDate = new Date(requestDate);
      if (isNaN(reqDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      request.requestDate = reqDate;
    }
    if (currentShift) request.currentShift = currentShift;
    if (requestedShift) request.requestedShift = requestedShift;
    if (reason) request.reason = reason.trim();

    await request.save();
    await request.populate('staff', 'name email staffId');

    res.json({
      message: 'Schedule change request updated successfully',
      request
    });
  } catch (error) {
    console.error('Error updating schedule change request:', error);
    if (error.message.includes('24 hours in advance') || error.message.includes('2 weeks in advance')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a schedule change request (only if pending)
exports.deleteScheduleChangeRequest = async (req, res) => {
  try {
    const staffId = req.user._id;
    const requestId = req.params.id;

    const request = await ScheduleChangeRequest.findOne({
      _id: requestId,
      staff: staffId
    });

    if (!request) {
      return res.status(404).json({ message: 'Schedule change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot delete a request that has already been reviewed' 
      });
    }

    await ScheduleChangeRequest.findByIdAndDelete(requestId);

    res.json({ message: 'Schedule change request deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule change request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =================== MANAGER/ADMIN SCHEDULE CHANGE REQUEST MANAGEMENT ===================

// Get all schedule change requests (for managers/admins)
exports.getAllScheduleChangeRequests = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.requestDate = {};
      if (startDate) filter.requestDate.$gte = new Date(startDate);
      if (endDate) filter.requestDate.$lte = new Date(endDate);
    }

    const requests = await ScheduleChangeRequest.find(filter)
      .populate('staff', 'name email staffId')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching all schedule change requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending schedule change requests (for managers/admins)
exports.getPendingScheduleChangeRequests = async (req, res) => {
  try {
    const requests = await ScheduleChangeRequest.getPendingRequests();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending schedule change requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a schedule change request
exports.approveScheduleChangeRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const managerId = req.user._id;
    const { response } = req.body;

    const request = await ScheduleChangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Schedule change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Request has already been reviewed' 
      });
    }

    await request.approve(managerId, response);
    await request.populate(['staff', 'reviewedBy']);

    // Also apply a per-day override to the weekly schedule
    try {
      const staffUser = await User.findById(request.staff).select('role');
      const role = staffUser?.role || '';
      const group = role === 'lab' ? 'lab' : 'field';

      // Compute Sunday weekStart for the request date
      const weekStart = new Date(request.requestDate);
      weekStart.setHours(0,0,0,0);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day);

      const shiftType = request.requestedShift === 'Off' ? null : request.requestedShift;
      // Ensure schedule exists
      let sched = await WeeklyShiftSchedule.findOne({ weekStart, group });
      if (!sched) {
        // Fallback default times
        sched = await WeeklyShiftSchedule.create({
          weekStart,
          group,
          morningStart: '09:00',
          morningEnd: '13:00',
          eveningStart: '13:30',
          eveningEnd: '18:00',
          assignments: [],
          status: 'active'
        });
      }
      // Remove existing override for same date+staff
      const d = new Date(request.requestDate); d.setHours(0,0,0,0);
      sched.overrides = (sched.overrides || []).filter(o => !(String(o.staff) === String(request.staff) && new Date(o.date).setHours(0,0,0,0) === d.getTime()));
      if (shiftType) {
        sched.overrides.push({ date: d, staff: request.staff, shiftType });
      }
      await sched.save();
    } catch (_) {
      // Non-fatal if override fails
    }

    res.json({
      message: 'Schedule change request approved successfully',
      request
    });
  } catch (error) {
    console.error('Error approving schedule change request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a schedule change request
exports.rejectScheduleChangeRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const managerId = req.user._id;
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ 
        message: 'Rejection reason is required' 
      });
    }

    const request = await ScheduleChangeRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Schedule change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Request has already been reviewed' 
      });
    }

    await request.reject(managerId, response.trim());
    await request.populate(['staff', 'reviewedBy']);

    res.json({
      message: 'Schedule change request rejected',
      request
    });
  } catch (error) {
    console.error('Error rejecting schedule change request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
















