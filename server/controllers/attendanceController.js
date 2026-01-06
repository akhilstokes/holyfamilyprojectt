const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');
const ActivityLogger = require('../services/activityLogger');

const attendanceController = {
  async getAttendance(req, res) {
    try {
      const { staffId, date, status } = req.query;
      const query = {};
      
      if (staffId) query.staff = staffId;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        query.date = { $gte: startDate, $lt: endDate };
      }
      if (status) query.status = status;

      const attendance = await Attendance.find(query)
        .populate('staff', 'name email staffId')
        .sort({ date: -1 });
      
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  },

  async getAttendanceById(req, res) {
    try {
      const attendance = await Attendance.findById(req.params.id)
        .populate('staff', 'name email staffId');
      
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }
      
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  },

  async createAttendance(req, res) {
    try {
      const { staff, date, status, checkInAt, checkOutAt } = req.body;
      
      if (!staff || !date) {
        return res.status(400).json({ message: 'Staff and date are required' });
      }

      const attendance = new Attendance({
        staff,
        date: new Date(date),
        status: status || 'present',
        checkInAt: checkInAt ? new Date(checkInAt) : null,
        checkOutAt: checkOutAt ? new Date(checkOutAt) : null
      });

      await attendance.save();
      await attendance.populate('staff', 'name email staffId');
      
      res.status(201).json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({ message: 'Failed to create attendance' });
    }
  },

  async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const attendance = await Attendance.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      ).populate('staff', 'name email staffId');

      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({ message: 'Failed to update attendance' });
    }
  },

  async verifyAttendance(req, res) {
    try {
      const { id } = req.params;
      const { verified, notes } = req.body;
      const managerId = req.user?._id;

      const attendance = await Attendance.findById(id)
        .populate('staff', 'name email staffId');

      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      attendance.verified = verified;
      attendance.verifiedBy = managerId;
      attendance.verifiedAt = new Date();
      if (notes) attendance.approvalNotes = notes;

      await attendance.save();

      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error verifying attendance:', error);
      res.status(500).json({ message: 'Failed to verify attendance' });
    }
  },

  async deleteAttendance(req, res) {
    try {
      const attendance = await Attendance.findByIdAndDelete(req.params.id);
      
      if (!attendance) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      res.json({ success: true, message: 'Attendance deleted' });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({ message: 'Failed to delete attendance' });
    }
  },

  async getStaffAttendance(req, res) {
    try {
      const { staffId } = req.params;
      const { startDate, endDate } = req.query;

      const query = { staff: staffId };
      
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(query)
        .populate('staff', 'name email staffId')
        .sort({ date: -1 });

      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching staff attendance:', error);
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  }
};

module.exports = attendanceController;
