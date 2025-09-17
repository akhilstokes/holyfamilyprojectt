const BillRequest = require('../models/billRequestModel');
const Shift = require('../models/shiftModel');
const WeeklyShiftSchedule = require('../models/weeklyShiftScheduleModel');
const User = require('../models/userModel');
const StockTransaction = require('../models/stockModel');
const Barrel = require('../models/barrelModel');
const BarrelMovement = require('../models/barrelMovementModel');
const BarrelRequest = require('../models/barrelRequestModel');
const IssueReport = require('../models/issueReportModel');

/* --------------------- Bill Routes --------------------- */
exports.getAllBills = async (req, res) => {
    try {
        const bills = await BillRequest.find({}).populate('supplier', 'name email').sort({ createdAt: -1 });
        res.status(200).json(bills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateBillStatus = async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        const bill = await BillRequest.findById(req.params.id);
        if (bill) {
            bill.status = status;
            bill.approvedBy = req.user._id;
            const updatedBill = await bill.save();
            res.status(200).json(updatedBill);
        } else {
            res.status(404).json({ message: 'Bill request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/* --------------------- Staff & Shifts --------------------- */
exports.getStaffList = async (req, res) => {
    try {
        const staff = await User.find({ role: 'field_staff' }).select('name');
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Legacy daily shift list (kept)
exports.getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.find({}).populate('assignedStaff', 'name').sort({ date: -1 });
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Legacy daily shift assignment (kept)
exports.assignShift = async (req, res) => {
    const { shiftType, date, assignedStaff } = req.body;
    try {
        const staffMember = await User.findById(assignedStaff);
        if (!staffMember || staffMember.role !== 'field_staff') {
            return res.status(404).json({ message: 'Assigned staff member not found or is not a field staff.' });
        }
        const exists = await Shift.findOne({ date: new Date(date), shiftType, assignedStaff });
        if (exists) {
            return res.status(409).json({ message: 'Staff already assigned for this shift/date' });
        }
        const newShift = new Shift({ shiftType, date, assignedStaff });
        const savedShift = await newShift.save();
        res.status(201).json(savedShift);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/* -------- Weekly shift schedules (Admin sets for a week) -------- */
// Create or update week schedule with Morning/Evening times
exports.upsertWeeklySchedule = async (req, res) => {
    try {
        const { weekStart, morningStart, morningEnd, eveningStart, eveningEnd } = req.body;
        if (!weekStart || !morningStart || !morningEnd || !eveningStart || !eveningEnd) {
            return res.status(400).json({ message: 'weekStart, morningStart, morningEnd, eveningStart, eveningEnd are required' });
        }
        const start = new Date(weekStart); start.setHours(0,0,0,0);
        const doc = await WeeklyShiftSchedule.findOneAndUpdate(
            { weekStart: start },
            { $set: { morningStart, morningEnd, eveningStart, eveningEnd, createdBy: req.user._id } },
            { new: true, upsert: true }
        );
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Assign a staff to Morning/Evening for the given week
exports.assignWeeklyShift = async (req, res) => {
    try {
        const { weekStart, staffId, shiftType } = req.body;
        if (!weekStart || !staffId || !['Morning','Evening'].includes(shiftType)) {
            return res.status(400).json({ message: 'weekStart, staffId, shiftType required' });
        }
        const start = new Date(weekStart); start.setHours(0,0,0,0);
        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'field_staff') return res.status(404).json({ message: 'Staff not found' });
        const sched = await WeeklyShiftSchedule.findOneAndUpdate(
            { weekStart: start },
            { $setOnInsert: { morningStart: '09:00', morningEnd: '13:00', eveningStart: '14:00', eveningEnd: '18:00', createdBy: req.user._id } },
            { new: true, upsert: true }
        );
        // Remove any previous assignment for staff in this week, then add
        sched.assignments = (sched.assignments || []).filter(a => String(a.staff) !== String(staffId));
        sched.assignments.push({ staff: staffId, shiftType });
        await sched.save();
        res.json(sched);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get schedule for a week
exports.getWeeklySchedule = async (req, res) => {
    try {
        const { weekStart } = req.query;
        if (!weekStart) return res.status(400).json({ message: 'weekStart required' });
        const start = new Date(weekStart); start.setHours(0,0,0,0);
        const doc = await WeeklyShiftSchedule.findOne({ weekStart: start }).populate('assignments.staff', 'name');
        res.json(doc || null);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/* --------------------- Stock Management --------------------- */
exports.getStockTransactions = async (req, res) => {
    try {
        const transactions = await StockTransaction.find({}).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addStockTransaction = async (req, res) => {
    const { type, quantity, notes } = req.body;
    try {
        const transaction = new StockTransaction({ type, quantity, notes, recordedBy: req.user._id });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/* --------------------- Barrel Management --------------------- */
exports.getBarrels = async (req, res) => {
    try {
        const barrels = await Barrel.find({}).sort({ purchaseDate: -1 });
        res.status(200).json(barrels);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addBarrel = async (req, res) => {
    const { barrelId, capacity, notes } = req.body;
    try {
        if (!capacity || capacity <= 0) {
            return res.status(400).json({ message: 'capacity (liters) is required and must be > 0' });
        }
        const barrel = new Barrel({ barrelId, capacity, notes });
        await barrel.save();
        res.status(201).json(barrel);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateBarrelStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const barrel = await Barrel.findById(req.params.id);
        if (barrel) {
            barrel.status = status;
            await barrel.save();
            res.status(200).json(barrel);
        } else {
            res.status(404).json({ message: 'Barrel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/* --------------------- Requests & Issues (Admin) --------------------- */
exports.listBarrelRequests = async (req, res) => {
    try {
        const list = await BarrelRequest.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(list);
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.updateBarrelRequestStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        if (!['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const doc = await BarrelRequest.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        doc.status = status;
        if (adminNotes !== undefined) doc.adminNotes = adminNotes;
        await doc.save();
        res.json(doc);
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.listIssueReports = async (req, res) => {
    try {
        const list = await IssueReport.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(list);
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.updateIssueStatus = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const doc = await IssueReport.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        doc.status = status;
        if (adminResponse !== undefined) doc.adminResponse = adminResponse;
        await doc.save();
        res.json(doc);
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

/* --------------------- Barrel Dispatch / Return --------------------- */
exports.dispatchBarrels = async (req, res) => {
    try {
        const { barrelIds = [], recipientUserId, notes = '' } = req.body;
        if (!Array.isArray(barrelIds) || barrelIds.length === 0 || !recipientUserId) {
            return res.status(400).json({ message: 'barrelIds and recipientUserId are required' });
        }
        const results = [];
        for (const serial of barrelIds) {
            const barrel = await Barrel.findOne({ barrelId: serial });
            if (!barrel) continue;
            const mv = await BarrelMovement.create({
                barrel: barrel._id,
                type: 'move',
                fromLocation: barrel.lastKnownLocation || 'warehouse',
                toLocation: 'customer',
                notes,
                movementKind: 'dispatch',
                recipientUser: recipientUserId,
                dispatchDate: new Date(),
                createdBy: req.user._id,
            });
            barrel.status = 'in-use';
            barrel.lastKnownLocation = 'customer';
            await barrel.save();
            results.push({ barrelId: serial, movementId: mv._id });
        }
        res.json({ success: true, results });
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

exports.returnBarrels = async (req, res) => {
    try {
        const { barrelIds = [], notes = '' } = req.body;
        if (!Array.isArray(barrelIds) || barrelIds.length === 0) {
            return res.status(400).json({ message: 'barrelIds are required' });
        }
        const results = [];
        for (const serial of barrelIds) {
            const barrel = await Barrel.findOne({ barrelId: serial });
            if (!barrel) continue;
            const mv = await BarrelMovement.create({
                barrel: barrel._id,
                type: 'move',
                fromLocation: barrel.lastKnownLocation || 'customer',
                toLocation: 'warehouse',
                notes,
                movementKind: 'return',
                returnDate: new Date(),
                createdBy: req.user._id,
            });
            barrel.status = 'in-storage';
            barrel.lastKnownLocation = 'warehouse';
            await barrel.save();
            results.push({ barrelId: serial, movementId: mv._id });
        }
        res.json({ success: true, results });
    } catch (e) {
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};
