const BillRequest = require('../models/billRequestModel');
const Shift = require('../models/shiftModel');
const User = require('../models/userModel');
const StockTransaction = require('../models/stockModel');
const Barrel = require('../models/barrelModel');

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

exports.getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.find({}).populate('assignedStaff', 'name').sort({ date: -1 });
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.assignShift = async (req, res) => {
    const { shiftType, date, assignedStaff } = req.body;
    try {
        const staffMember = await User.findById(assignedStaff);
        if (!staffMember || staffMember.role !== 'field_staff') {
            return res.status(404).json({ message: 'Assigned staff member not found or is not a field staff.' });
        }
        // prevent duplicate assignment for same date & shift
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
