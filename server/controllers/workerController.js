const Worker = require('../models/workerModel');
const BarrelEntry = require('../models/barrelEntryModel');
const TripLog = require('../models/tripLogModel');
const RouteTask = require('../models/routeTaskModel');
const Attendance = require('../models/attendanceModel');
const SalarySummary = require('../models/salarySummaryModel');
const PayrollEntry = require('../models/payrollEntryModel');

// Return the worker document linked to the authenticated user
exports.getSelfWorker = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    let worker = await Worker.findOne({ user: staffUserId }).populate('user', 'name email role');
    
    // If no worker profile exists, create one with basic info from user
    if (!worker) {
      worker = await Worker.create({
        user: staffUserId,
        name: req.user.name || '',
        createdBy: staffUserId
      });
      // Populate the user field after creation
      worker = await Worker.findById(worker._id).populate('user', 'name email role');
    }
    
    res.json(worker);
  } catch (e) {
    console.error('Error in getSelfWorker:', e);
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Update fields for the authenticated worker
exports.updateSelfWorker = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const allowed = [
      'name',
      'dateOfBirth',
      'contactNumber',
      'address',
      'emergencyContactName',
      'emergencyContactNumber',
      'aadhaarNumber',
      'photoUrl',
      'health',
      'origin',
      'dailyWage', // optional if allowed for self-edit; typically admin-only
    ];
    const update = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        update[key] = req.body[key];
      }
    }
    
    // Ensure worker profile exists before updating
    let worker = await Worker.findOne({ user: staffUserId });
    if (!worker) {
      worker = await Worker.create({
        user: staffUserId,
        name: req.user.name || '',
        createdBy: staffUserId
      });
    }
    
    // Update the worker profile
    worker = await Worker.findOneAndUpdate(
      { user: staffUserId },
      { $set: update },
      { new: true }
    ).populate('user', 'name email role');
    
    res.json(worker);
  } catch (e) {
    console.error('Error in updateSelfWorker:', e);
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Add a document entry for the authenticated worker
exports.addSelfDocument = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const { label, url } = req.body || {};
    if (!url) return res.status(400).json({ message: 'url is required' });
    
    // Ensure worker profile exists
    let worker = await Worker.findOne({ user: staffUserId });
    if (!worker) {
      worker = await Worker.create({
        user: staffUserId,
        name: req.user.name || '',
        createdBy: staffUserId
      });
    }
    
    const doc = { label: label || '', url, uploadedAt: new Date() };
    worker = await Worker.findOneAndUpdate(
      { user: staffUserId },
      { $push: { documents: doc } },
      { new: true }
    );
    res.status(201).json(worker.documents);
  } catch (e) {
    console.error('Error in addSelfDocument:', e);
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Remove a document by index for the authenticated worker
exports.removeSelfDocument = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const idx = Number(req.params.idx);
    if (Number.isNaN(idx)) return res.status(400).json({ message: 'Invalid index' });
    
    // Ensure worker profile exists
    let worker = await Worker.findOne({ user: staffUserId });
    if (!worker) {
      worker = await Worker.create({
        user: staffUserId,
        name: req.user.name || '',
        createdBy: staffUserId
      });
    }
    
    if (!Array.isArray(worker.documents) || idx < 0 || idx >= worker.documents.length) {
      return res.status(400).json({ message: 'Index out of bounds' });
    }
    worker.documents.splice(idx, 1);
    await worker.save();
    res.json(worker.documents);
  } catch (e) {
    console.error('Error in removeSelfDocument:', e);
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Salary history for authenticated worker from SalarySummary
exports.getSelfSalaryHistory = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const history = await SalarySummary.find({ staff: staffUserId })
      .sort({ year: -1, month: -1 })
      .lean();
    res.json(history || []);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};





// --- Field Staff APIs ---
exports.addBarrelEntry = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { farmerUserId, weightKg, ratePerKg, moisturePct, gps, photoUrl, routeTaskId, barrelId } = req.body;
    if (!farmerUserId || !weightKg || !ratePerKg) {
      return res.status(400).json({ message: 'farmerUserId, weightKg and ratePerKg are required' });
    }
    const amount = Number(weightKg) * Number(ratePerKg);
    const entry = await BarrelEntry.create({
      staff: staffId,
      farmerUser: farmerUserId,
      routeTaskId: routeTaskId || '',
      barrelId: barrelId || '',
      weightKg,
      ratePerKg,
      amount,
      moisturePct: moisturePct || 0,
      gps: gps || {},
      photoUrl: photoUrl || '',
    });
    res.status(201).json(entry);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listBarrelEntries = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { date } = req.query;
    const filter = { staff: staffId };
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.dateTime = { $gte: start, $lte: end };
    }
    const list = await BarrelEntry.find(filter).sort({ dateTime: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.addTripLog = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { vehicleId, odometerStart, odometerEnd, routeTaskId, date } = req.body;
    if (odometerStart == null || odometerEnd == null) {
      return res.status(400).json({ message: 'odometerStart and odometerEnd are required' });
    }
    if (Number(odometerEnd) < Number(odometerStart)) {
      return res.status(400).json({ message: 'odometerEnd must be >= odometerStart' });
    }
    const km = Number(odometerEnd) - Number(odometerStart);
    const log = await TripLog.create({
      staff: staffId,
      date: date ? new Date(date) : new Date(),
      vehicleId: vehicleId || '',
      odometerStart,
      odometerEnd,
      km,
      routeTaskId: routeTaskId || '',
    });
    res.status(201).json(log);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.listTripLogs = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { date } = req.query;
    const filter = { staff: staffId };
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    }
    const list = await TripLog.find(filter).sort({ date: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.getTodaySnapshot = async (req, res) => {
  try {
    const staffId = req.user.id;
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const [route] = await RouteTask.find({ staff: staffId, date: { $gte: start, $lte: end } }).sort({ createdAt: -1 }).limit(1);
    const barrels = await BarrelEntry.find({ staff: staffId, dateTime: { $gte: start, $lte: end } }).sort({ dateTime: -1 });
    const trips = await TripLog.find({ staff: staffId, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    // Include today's attendance record
    const attendance = await Attendance.findOne({ staff: staffId, date: start }).lean();
    res.json({ route: route || null, barrels, trips, attendance });
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.startRoute = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date(); today.setHours(0,0,0,0);
    let route = await RouteTask.findOne({ staff: staffId, date: today });
    if (!route) {
      route = new RouteTask({ staff: staffId, date: today, status: 'in_progress', startedAt: new Date() });
    } else {
      route.status = 'in_progress';
      route.startedAt = new Date();
    }
    await route.save();
    res.json(route);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.completeRoute = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date(); today.setHours(0,0,0,0);
    let route = await RouteTask.findOne({ staff: staffId, date: today });
    if (!route) return res.status(404).json({ message: 'Route not started' });
    route.status = 'completed';
    route.completedAt = new Date();
    await route.save();
    res.json(route);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// --- Attendance: self check-in/out, admin override ---
// Helper: get weekly schedule for a date
async function getWeekScheduleForDate(date) {
  const WeeklyShiftSchedule = require('../models/weeklyShiftScheduleModel');
  const weekStart = new Date(date);
  // Normalize to Sunday start (or adapt as needed)
  weekStart.setHours(0,0,0,0);
  const day = weekStart.getDay(); // 0..6; 0 = Sunday
  weekStart.setDate(weekStart.getDate() - day);
  return WeeklyShiftSchedule.findOne({ weekStart });
}

function parseHHMMToDate(baseDay, hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  const d = new Date(baseDay);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

exports.checkIn = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { location, photo } = req.body;
    
    // Validate location
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Location is required for check-in' });
    }
    
    if (location.accuracy > 100) {
      return res.status(400).json({ message: 'GPS accuracy is too low. Please wait for better signal.' });
    }
    
    const today = new Date(); today.setHours(0,0,0,0);
    const existing = await Attendance.findOne({ staff: staffId, date: today });
    if (existing && existing.checkInAt) return res.status(400).json({ message: 'Already checked in' });
    const now = new Date();

    // Determine late threshold from weekly schedule if available
    let lateThreshold = new Date(today); lateThreshold.setHours(9, 15, 0, 0);
    const sched = await getWeekScheduleForDate(today);
    if (sched) {
      const assignment = (sched.assignments || []).find(a => String(a.staff) === String(staffId));
      if (assignment) {
        const hhmm = assignment.shiftType === 'Morning' ? sched.morningStart : sched.eveningStart;
        // 15 min grace
        lateThreshold = parseHHMMToDate(today, hhmm);
        lateThreshold = new Date(lateThreshold.getTime() + 15 * 60 * 1000);
      }
    }

    const rec = existing || new Attendance({ staff: staffId, date: today });
    rec.checkInAt = now;
    rec.isLate = now.getTime() > lateThreshold.getTime();
    
    // Store location data
    rec.checkInLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address || ''
    };
    
    // Store photo data if provided
    if (photo) {
      rec.checkInPhoto = {
        url: photo.url || '',
        filename: photo.filename || '',
        uploadedAt: new Date()
      };
    }
    
    // Set verification flags
    rec.locationVerified = true;
    rec.photoVerified = !!photo;
    
    await rec.save();
    res.json(rec);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { location, photo } = req.body;
    
    // Validate location
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Location is required for check-out' });
    }
    
    if (location.accuracy > 100) {
      return res.status(400).json({ message: 'GPS accuracy is too low. Please wait for better signal.' });
    }
    
    const today = new Date(); today.setHours(0,0,0,0);
    const rec = await Attendance.findOne({ staff: staffId, date: today });
    if (!rec || !rec.checkInAt) return res.status(400).json({ message: 'Check-in required' });
    if (rec.checkOutAt) return res.status(400).json({ message: 'Already checked out' });
    
    rec.checkOutAt = new Date();
    
    // Store location data
    rec.checkOutLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address || ''
    };
    
    // Store photo data if provided
    if (photo) {
      rec.checkOutPhoto = {
        url: photo.url || '',
        filename: photo.filename || '',
        uploadedAt: new Date()
      };
    }
    
    await rec.save();
    res.json(rec);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Get staff's assigned shift schedule for current week
exports.getMyShiftSchedule = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date();
    const sched = await getWeekScheduleForDate(today);
    
    if (!sched) {
      return res.json({ 
        message: 'No schedule set for this week',
        schedule: null,
        myAssignment: null 
      });
    }

    // Find this staff's assignment
    const myAssignment = (sched.assignments || []).find(a => String(a.staff) === String(staffId));
    
    const response = {
      weekStart: sched.weekStart,
      morningStart: sched.morningStart,
      morningEnd: sched.morningEnd,
      eveningStart: sched.eveningStart,
      eveningEnd: sched.eveningEnd,
      myAssignment: myAssignment ? {
        shiftType: myAssignment.shiftType,
        startTime: myAssignment.shiftType === 'Morning' ? sched.morningStart : sched.eveningStart,
        endTime: myAssignment.shiftType === 'Morning' ? sched.morningEnd : sched.eveningEnd
      } : null
    };

    res.json(response);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Attendance history for staff (self)
exports.getAttendanceHistory = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { from, to, limit = 60 } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 30*24*60*60*1000);
    start.setHours(0,0,0,0);
    const end = to ? new Date(to) : new Date(); end.setHours(23,59,59,999);
    const list = await Attendance.find({ staff: staffId, date: { $gte: start, $lte: end } })
      .sort({ date: -1 })
      .limit(Number(limit));
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.adminMarkAttendance = async (req, res) => {
  try {
    const { staffId, date, checkInAt, checkOutAt, shiftId, notes, verified } = req.body;
    if (!staffId || !date) return res.status(400).json({ message: 'staffId and date required' });
    const day = new Date(date); day.setHours(0,0,0,0);
    const rec = await Attendance.findOneAndUpdate(
      { staff: staffId, date: day },
      { $set: { checkInAt: checkInAt ? new Date(checkInAt) : null, checkOutAt: checkOutAt ? new Date(checkOutAt) : null, shift: shiftId || null, notes: notes || '', verified: !!verified } },
      { upsert: true, new: true }
    );
    res.json(rec);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// Admin list attendance for date range
exports.listAttendance = async (req, res) => {
  try {
    const { from, to, staffId } = req.query;
    const start = from ? new Date(from) : new Date('1970-01-01'); start.setHours(0,0,0,0);
    const end = to ? new Date(to) : new Date(); end.setHours(23,59,59,999);
    const filter = { date: { $gte: start, $lte: end } };
    if (staffId) filter.staff = staffId;
    const list = await Attendance.find(filter).populate('staff', 'name email').sort({ date: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const staffId = req.params.staffId || req.user.id;
    const { year, month } = req.query; // month: 1-12
    
    // Validate ObjectId format if staffId is provided as parameter
    if (req.params.staffId && !req.params.staffId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid staffId format' });
    }
    
    if (!year || !month) return res.status(400).json({ message: 'year and month required' });

    // Count attendance days
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 0); // last day
    to.setHours(23,59,59,999);

    const attendance = await Attendance.find({ staff: staffId, date: { $gte: from, $lte: to }, checkInAt: { $ne: null } });
    const workingDays = attendance.length;

    // Get dailyWage from Worker by user link
    const worker = await Worker.findOne({ user: staffId });
    const dailyWage = worker?.dailyWage || 0;
    const grossSalary = workingDays * dailyWage;

    // Update or create month summary while preserving payments and adjustments
    let summary = await SalarySummary.findOne({ staff: staffId, year: Number(year), month: Number(month) });
    if (!summary) {
      summary = await SalarySummary.create({ staff: staffId, year: Number(year), month: Number(month) });
    }
    summary.workingDays = workingDays;
    summary.dailyWage = dailyWage;
    summary.grossSalary = grossSalary;
    // Recompute pending = max(0, gross + bonus - deduction - received)
    summary.pendingAmount = Math.max(0, Number(summary.grossSalary) + Number(summary.bonusAmount || 0) - Number(summary.deductionAmount || 0) - Number(summary.receivedAmount || 0));
    await summary.save();

    res.json({
      workingDays,
      dailyWage,
      grossSalary,
      receivedAmount: summary.receivedAmount,
      advanceAmount: summary.advanceAmount,
      bonusAmount: summary.bonusAmount || 0,
      deductionAmount: summary.deductionAmount || 0,
      pendingAmount: summary.pendingAmount,
    });
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

exports.staffDashboard = async (req, res) => {
  try {
    const staffId = req.user.id;
    const worker = await Worker.findOne({ user: staffId });
    const today = new Date(); today.setHours(0,0,0,0);
    const attendance = await Attendance.findOne({ staff: staffId, date: today });
    const route = await RouteTask.findOne({ staff: staffId, date: today }).sort({ createdAt: -1 });
    res.json({ worker, attendance, route });
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};


// --- Admin: record payroll ledger entry (received/advance/deduction/bonus) for a given month ---
exports.recordPayrollEntry = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month, amount, type, note } = req.body || {};
    
    // Validate ObjectId format
    if (!staffId || !staffId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid staffId format' });
    }
    
    if (!year || !month || !amount || !type) {
      return res.status(400).json({ message: 'year, month, amount, type required' });
    }
    const t = String(type);
    if (!['received', 'advance', 'deduction', 'bonus'].includes(t)) {
      return res.status(400).json({ message: 'type must be received, advance, deduction, or bonus' });
    }

    // Ensure a summary exists
    let summary = await SalarySummary.findOne({ staff: staffId, year: Number(year), month: Number(month) });
    if (!summary) {
      summary = await SalarySummary.create({ staff: staffId, year: Number(year), month: Number(month) });
    }

    // Create ledger entry
    await PayrollEntry.create({ staff: staffId, year: Number(year), month: Number(month), type: t, amount: Number(amount), note: note || '', createdBy: req.user?._id });

    // Update summary totals
    if (t === 'received') summary.receivedAmount = Number(summary.receivedAmount) + Number(amount);
    if (t === 'advance') summary.advanceAmount = Number(summary.advanceAmount) + Number(amount);
    if (t === 'bonus') summary.bonusAmount = Number(summary.bonusAmount || 0) + Number(amount);
    if (t === 'deduction') summary.deductionAmount = Number(summary.deductionAmount || 0) + Number(amount);

    // Recompute pending = max(0, gross + bonus - deduction - received)
    summary.pendingAmount = Math.max(0, Number(summary.grossSalary) + Number(summary.bonusAmount || 0) - Number(summary.deductionAmount || 0) - Number(summary.receivedAmount || 0));
    await summary.save();

    res.json(summary);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// --- Admin: list payroll ledger entries for a given staff and month ---
exports.listPayrollEntries = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month } = req.query;
    
    // Validate ObjectId format
    if (!staffId || !staffId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid staffId format' });
    }
    
    if (!year || !month) return res.status(400).json({ message: 'year, month required' });
    const entries = await PayrollEntry.find({ staff: staffId, year: Number(year), month: Number(month) }).sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

// --- Staff: view own payroll ledger for a month ---
exports.listMyPayrollEntries = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'year, month required' });
    const entries = await PayrollEntry.find({ staff: staffId, year: Number(year), month: Number(month) }).sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
};

