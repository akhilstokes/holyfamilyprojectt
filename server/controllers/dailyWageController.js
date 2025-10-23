const Worker = require('../models/workerModel');
const Attendance = require('../models/attendanceModel');
const PayrollEntry = require('../models/payrollEntryModel');
const SalarySummary = require('../models/salarySummaryModel');
const WageTemplate = require('../models/wageTemplateModel');
const WageHistory = require('../models/wageHistoryModel');
const mongoose = require('mongoose');

function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

// Set daily wage for a worker
exports.setDailyWage = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }
    const { dailyWage, effectiveDate, reason } = req.body;

    if (!dailyWage || dailyWage <= 0) {
      return res.status(400).json({ message: 'Daily wage must be greater than 0' });
    }

    const worker = await Worker.findById(workerId).populate('user', 'name email role staffId');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Record wage change in history
    const previousWage = worker.dailyWage;
    const wageChange = await WageHistory.create({
      worker: workerId,
      changeType: 'salary_adjustment',
      previousValues: { dailyWage: previousWage },
      newValues: { dailyWage: Number(dailyWage) },
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || 'Daily wage adjustment',
      amount: Number(dailyWage) - previousWage,
      createdBy: req.user._id
    });

    // Update worker wage
    worker.dailyWage = Number(dailyWage);
    await worker.save();

    res.json({
      message: 'Daily wage updated successfully',
      data: {
        worker,
        wageChange
      }
    });
  } catch (error) {
    console.error('Error setting daily wage:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get daily wage for a worker
exports.getDailyWage = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email role staffId');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json({
      data: {
        workerId: worker._id,
        name: worker.name,
        dailyWage: worker.dailyWage,
        user: worker.user
      }
    });
  } catch (error) {
    console.error('Error fetching daily wage:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Calculate monthly salary for daily wage worker
exports.calculateMonthlySalary = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }
    const { year, month } = req.query;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid year and month (1-12) are required' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Count working days from attendance
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 0);
    to.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      staff: worker.user._id,
      date: { $gte: from, $lte: to },
      checkInAt: { $ne: null }
    });

    const workingDays = attendance.length;
    const dailyWage = worker.dailyWage || 0;
    const grossSalary = workingDays * dailyWage;

    // Get or create salary summary
    let summary = await SalarySummary.findOne({
      staff: worker.user._id,
      year: Number(year),
      month: Number(month)
    });

    if (!summary) {
      summary = await SalarySummary.create({
        staff: worker.user._id,
        year: Number(year),
        month: Number(month)
      });
    }

    // Update summary with calculated values
    summary.workingDays = workingDays;
    summary.dailyWage = dailyWage;
    summary.grossSalary = grossSalary;
    summary.pendingAmount = Math.max(0, 
      grossSalary + 
      (summary.bonusAmount || 0) - 
      (summary.deductionAmount || 0) - 
      (summary.receivedAmount || 0)
    );
    await summary.save();

    res.json({
      data: {
        worker: {
          id: worker._id,
          name: worker.name,
          dailyWage: worker.dailyWage
        },
        month: {
          year: Number(year),
          month: Number(month),
          workingDays,
          grossSalary,
          receivedAmount: summary.receivedAmount || 0,
          advanceAmount: summary.advanceAmount || 0,
          bonusAmount: summary.bonusAmount || 0,
          deductionAmount: summary.deductionAmount || 0,
          pendingAmount: summary.pendingAmount
        }
      }
    });
  } catch (error) {
    console.error('Error calculating monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Record payment for daily wage worker
exports.recordPayment = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }
    const { year, month, amount, type, note } = req.body;

    if (!year || !month || !amount || !type) {
      return res.status(400).json({ message: 'Year, month, amount, and type are required' });
    }

    const validTypes = ['received', 'advance', 'deduction', 'bonus'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Type must be one of: received, advance, deduction, bonus' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Ensure salary summary exists
    let summary = await SalarySummary.findOne({
      staff: worker.user._id,
      year: Number(year),
      month: Number(month)
    });

    if (!summary) {
      summary = await SalarySummary.create({
        staff: worker.user._id,
        year: Number(year),
        month: Number(month)
      });
    }

    // Create payroll entry
    await PayrollEntry.create({
      staff: worker.user._id,
      year: Number(year),
      month: Number(month),
      type,
      amount: Number(amount),
      note: note || '',
      createdBy: req.user._id
    });

    // Update summary totals
    if (type === 'received') {
      summary.receivedAmount = (summary.receivedAmount || 0) + Number(amount);
    } else if (type === 'advance') {
      summary.advanceAmount = (summary.advanceAmount || 0) + Number(amount);
    } else if (type === 'bonus') {
      summary.bonusAmount = (summary.bonusAmount || 0) + Number(amount);
    } else if (type === 'deduction') {
      summary.deductionAmount = (summary.deductionAmount || 0) + Number(amount);
    }

    // Recalculate pending amount
    summary.pendingAmount = Math.max(0,
      (summary.grossSalary || 0) +
      (summary.bonusAmount || 0) -
      (summary.deductionAmount || 0) -
      (summary.receivedAmount || 0)
    );

    await summary.save();

    res.json({
      message: 'Payment recorded successfully',
      data: {
        type,
        amount: Number(amount),
        note: note || '',
        summary: {
          receivedAmount: summary.receivedAmount,
          advanceAmount: summary.advanceAmount,
          bonusAmount: summary.bonusAmount,
          deductionAmount: summary.deductionAmount,
          pendingAmount: summary.pendingAmount
        }
      }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get payroll history for a worker
exports.getPayrollHistory = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }
    const { year, month, limit = 50 } = req.query;

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    let query = { staff: worker.user._id };
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);

    const payrollEntries = await PayrollEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('createdBy', 'name');

    res.json({ data: payrollEntries });
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get salary summary for a worker
exports.getSalarySummary = async (req, res) => {
  try {
    const { workerId } = req.params;
    if (!isValidObjectId(workerId)) {
      return res.status(400).json({ message: 'Invalid workerId' });
    }
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const summary = await SalarySummary.findOne({
      staff: worker.user._id,
      year: Number(year),
      month: Number(month)
    });

    if (!summary) {
      return res.status(404).json({ message: 'Salary summary not found for this month' });
    }

    res.json({ data: summary });
  } catch (error) {
    console.error('Error fetching salary summary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all daily wage workers with their current wages
exports.getAllDailyWageWorkers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aadhaarNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const workers = await Worker.find(query)
      .populate('user', 'name email role staffId')
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Worker.countDocuments(query);

    res.json({
      data: workers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching daily wage workers:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Bulk update daily wages
exports.bulkUpdateDailyWages = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { workerId, dailyWage }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { workerId, dailyWage } = update;
        
        if (!workerId || !dailyWage || dailyWage <= 0) {
          errors.push({ workerId, error: 'Invalid workerId or dailyWage' });
          continue;
        }

        const worker = await Worker.findByIdAndUpdate(
          workerId,
          { dailyWage: Number(dailyWage) },
          { new: true }
        ).populate('user', 'name email role staffId');

        if (!worker) {
          errors.push({ workerId, error: 'Worker not found' });
          continue;
        }

        results.push(worker);
      } catch (error) {
        errors.push({ workerId: update.workerId, error: error.message });
      }
    }

    res.json({
      message: `Updated ${results.length} workers successfully`,
      data: {
        updated: results,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error bulk updating daily wages:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get daily wage statistics
exports.getDailyWageStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get total workers count
    const totalWorkers = await Worker.countDocuments({ isActive: true });

    // Get average daily wage
    const avgWageResult = await Worker.aggregate([
      { $match: { isActive: true, dailyWage: { $gt: 0 } } },
      { $group: { _id: null, avgWage: { $avg: '$dailyWage' } } }
    ]);

    const avgDailyWage = avgWageResult.length > 0 ? avgWageResult[0].avgWage : 0;

    // Get salary summary statistics for the month
    const salaryStats = await SalarySummary.aggregate([
      {
        $match: {
          year: Number(currentYear),
          month: Number(currentMonth)
        }
      },
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: '$grossSalary' },
          totalReceived: { $sum: '$receivedAmount' },
          totalPending: { $sum: '$pendingAmount' },
          avgWorkingDays: { $avg: '$workingDays' }
        }
      }
    ]);

    res.json({
      data: {
        totalWorkers,
        avgDailyWage: Math.round(avgDailyWage),
        currentMonth: {
          year: Number(currentYear),
          month: Number(currentMonth),
          totalGrossSalary: salaryStats.length > 0 ? salaryStats[0].totalGrossSalary : 0,
          totalReceived: salaryStats.length > 0 ? salaryStats[0].totalReceived : 0,
          totalPending: salaryStats.length > 0 ? salaryStats[0].totalPending : 0,
          avgWorkingDays: salaryStats.length > 0 ? Math.round(salaryStats[0].avgWorkingDays) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching daily wage stats:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Apply wage template to worker
exports.applyWageTemplate = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { templateId, effectiveDate, reason } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const template = await WageTemplate.findById(templateId);
    if (!template || !template.isActive) {
      return res.status(404).json({ message: 'Wage template not found or inactive' });
    }

    // Record previous values
    const previousValues = {
      wageType: worker.wageType,
      dailyWage: worker.dailyWage,
      monthlySalary: worker.monthlySalary,
      hourlyRate: worker.hourlyRate,
      wageCategory: worker.wageCategory,
      benefits: worker.benefits
    };

    // Apply template values
    const newValues = {
      wageType: template.wageType,
      dailyWage: template.baseDailyWage,
      monthlySalary: template.baseMonthlySalary,
      hourlyRate: template.baseHourlyRate,
      wageCategory: template.wageCategory,
      benefits: template.benefits
    };

    // Update worker
    Object.assign(worker, newValues);
    await worker.save();

    // Record wage change
    const wageChange = await WageHistory.create({
      worker: workerId,
      changeType: 'wage_type_change',
      previousValues,
      newValues,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || `Applied template: ${template.name}`,
      createdBy: req.user._id
    });

    res.json({
      message: 'Wage template applied successfully',
      data: {
        worker,
        template,
        wageChange
      }
    });
  } catch (error) {
    console.error('Error applying wage template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get wage history for a worker
exports.getWageHistory = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const wageHistory = await WageHistory.find({ worker: workerId })
      .sort({ effectiveDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    const total = await WageHistory.countDocuments({ worker: workerId });

    res.json({
      data: wageHistory,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching wage history:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Enhanced salary calculation with overtime and benefits
exports.calculateEnhancedSalary = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { year, month, overtimeHours = 0, pieceWorkUnits = 0 } = req.query;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid year and month (1-12) are required' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Get attendance data
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 0);
    to.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      staff: worker.user._id,
      date: { $gte: from, $lte: to },
      checkInAt: { $ne: null }
    });

    const workingDays = attendance.length;
    const totalHours = attendance.reduce((sum, record) => {
      if (record.checkInAt && record.checkOutAt) {
        const hours = (record.checkOutAt - record.checkInAt) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum + 8; // Default 8 hours if no checkout time
    }, 0);

    // Calculate base salary based on wage type
    let baseSalary = 0;
    let overtimePay = 0;
    let pieceWorkPay = 0;

    switch (worker.wageType) {
      case 'daily':
        baseSalary = workingDays * (worker.dailyWage || 0);
        if (Number(overtimeHours) > 0) {
          overtimePay = Number(overtimeHours) * (worker.hourlyRate || 0) * (worker.overtimeRate || 1.5);
        }
        break;
      case 'monthly':
        baseSalary = worker.monthlySalary || 0;
        if (Number(overtimeHours) > 0) {
          overtimePay = Number(overtimeHours) * (worker.hourlyRate || 0) * (worker.overtimeRate || 1.5);
        }
        break;
      case 'piece_rate':
        pieceWorkPay = Number(pieceWorkUnits) * (worker.pieceRate || 0);
        baseSalary = pieceWorkPay;
        break;
      default:
        baseSalary = workingDays * (worker.dailyWage || 0);
    }

    // Calculate benefits
    const totalBenefits = Object.values(worker.benefits || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

    // Calculate bonuses
    const totalBonuses = (worker.attendanceBonus || 0) + (worker.productivityBonus || 0) + (worker.performanceBonus || 0);

    // Calculate gross salary
    const grossSalary = baseSalary + overtimePay + pieceWorkPay + totalBenefits + totalBonuses;

    // Get or create salary summary
    let summary = await SalarySummary.findOne({
      staff: worker.user._id,
      year: Number(year),
      month: Number(month)
    });

    if (!summary) {
      summary = await SalarySummary.create({
        staff: worker.user._id,
        worker: workerId,
        year: Number(year),
        month: Number(month)
      });
    }

    // Update summary with enhanced calculations
    summary.wageType = worker.wageType;
    summary.wageCategory = worker.wageCategory;
    summary.workingDays = workingDays;
    summary.totalHours = totalHours;
    summary.overtimeHours = Number(overtimeHours);
    summary.pieceWorkUnits = Number(pieceWorkUnits);
    summary.dailyWage = worker.dailyWage;
    summary.monthlySalary = worker.monthlySalary;
    summary.hourlyRate = worker.hourlyRate;
    summary.overtimeRate = worker.overtimeRate;
    summary.pieceRate = worker.pieceRate;
    summary.baseSalary = baseSalary;
    summary.overtimePay = overtimePay;
    summary.pieceWorkPay = pieceWorkPay;
    summary.grossSalary = grossSalary;
    summary.benefits = worker.benefits;
    summary.totalBenefits = totalBenefits;
    summary.attendanceBonus = worker.attendanceBonus;
    summary.productivityBonus = worker.productivityBonus;
    summary.performanceBonus = worker.performanceBonus;
    summary.totalBonuses = totalBonuses;
    summary.calculatedAt = new Date();
    summary.status = 'calculated';

    await summary.save();

    res.json({
      data: {
        worker: {
          name: worker.name,
          wageType: worker.wageType,
          wageCategory: worker.wageCategory
        },
        calculation: {
          workingDays,
          totalHours,
          overtimeHours: Number(overtimeHours),
          pieceWorkUnits: Number(pieceWorkUnits),
          baseSalary,
          overtimePay,
          pieceWorkPay,
          totalBenefits,
          totalBonuses,
          grossSalary
        },
        summary
      }
    });
  } catch (error) {
    console.error('Error calculating enhanced salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
