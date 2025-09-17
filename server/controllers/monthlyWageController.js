const Worker = require('../models/workerModel');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const PayrollEntry = require('../models/payrollEntryModel');
const SalarySummary = require('../models/salarySummaryModel');
const WageTemplate = require('../models/wageTemplateModel');
const WageHistory = require('../models/wageHistoryModel');

// Set monthly salary for a worker
exports.setMonthlySalary = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { monthlySalary, effectiveDate, reason } = req.body;

    if (!monthlySalary || monthlySalary <= 0) {
      return res.status(400).json({ message: 'Monthly salary must be greater than 0' });
    }

    const worker = await Worker.findById(workerId).populate('user', 'name email role staffId');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Record wage change in history
    const previousSalary = worker.monthlySalary;
    const wageChange = await WageHistory.create({
      worker: workerId,
      changeType: 'salary_adjustment',
      previousValues: { monthlySalary: previousSalary, wageType: worker.wageType },
      newValues: { monthlySalary: Number(monthlySalary), wageType: 'monthly' },
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      reason: reason || 'Monthly salary adjustment',
      amount: Number(monthlySalary) - previousSalary,
      createdBy: req.user._id
    });

    // Update worker salary and wage type
    worker.monthlySalary = Number(monthlySalary);
    worker.wageType = 'monthly';
    await worker.save();

    res.json({
      message: 'Monthly salary updated successfully',
      data: {
        worker,
        wageChange
      }
    });
  } catch (error) {
    console.error('Error setting monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get monthly salary for a worker
exports.getMonthlySalary = async (req, res) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId)
      .populate('user', 'name email role staffId');

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json({
      data: {
        workerId: worker._id,
        name: worker.name,
        monthlySalary: worker.monthlySalary,
        wageType: worker.wageType,
        wageCategory: worker.wageCategory,
        benefits: worker.benefits,
        user: worker.user
      }
    });
  } catch (error) {
    console.error('Error fetching monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Calculate monthly salary with attendance and deductions
exports.calculateMonthlySalary = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { year, month, overtimeHours = 0, deductions = {} } = req.query;

    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid year and month (1-12) are required' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (worker.wageType !== 'monthly') {
      return res.status(400).json({ message: 'Worker is not on monthly salary' });
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
    const totalDaysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const attendancePercentage = (workingDays / totalDaysInMonth) * 100;

    // Calculate base salary (pro-rated based on attendance)
    const baseSalary = worker.monthlySalary || 0;
    const proratedSalary = (baseSalary * workingDays) / totalDaysInMonth;

    // Calculate overtime pay
    const overtimePay = Number(overtimeHours) * (worker.hourlyRate || 0) * (worker.overtimeRate || 1.5);

    // Calculate benefits
    const totalBenefits = Object.values(worker.benefits || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

    // Calculate bonuses
    const totalBonuses = (worker.attendanceBonus || 0) + (worker.productivityBonus || 0) + (worker.performanceBonus || 0);

    // Calculate deductions
    const deductionAmount = Number(deductions.amount) || 0;
    const taxDeduction = Number(deductions.tax) || 0;
    const providentFundDeduction = worker.benefits?.providentFund ? (baseSalary * 0.12) : 0; // 12% PF
    const otherDeductions = Number(deductions.other) || 0;
    const totalDeductions = deductionAmount + taxDeduction + providentFundDeduction + otherDeductions;

    // Calculate gross and net salary
    const grossSalary = proratedSalary + overtimePay + totalBenefits + totalBonuses;
    const netSalary = grossSalary - totalDeductions;

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

    // Update summary with monthly salary calculations
    summary.wageType = 'monthly';
    summary.wageCategory = worker.wageCategory;
    summary.workingDays = workingDays;
    summary.overtimeHours = Number(overtimeHours);
    summary.monthlySalary = worker.monthlySalary;
    summary.hourlyRate = worker.hourlyRate;
    summary.overtimeRate = worker.overtimeRate;
    summary.baseSalary = proratedSalary;
    summary.overtimePay = overtimePay;
    summary.grossSalary = grossSalary;
    summary.benefits = worker.benefits;
    summary.totalBenefits = totalBenefits;
    summary.attendanceBonus = worker.attendanceBonus;
    summary.productivityBonus = worker.productivityBonus;
    summary.performanceBonus = worker.performanceBonus;
    summary.totalBonuses = totalBonuses;
    summary.deductionAmount = deductionAmount;
    summary.taxDeduction = taxDeduction;
    summary.providentFundDeduction = providentFundDeduction;
    summary.otherDeductions = otherDeductions;
    summary.totalDeductions = totalDeductions;
    summary.netSalary = netSalary;
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
          totalDaysInMonth,
          workingDays,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
          baseSalary: worker.monthlySalary,
          proratedSalary,
          overtimeHours: Number(overtimeHours),
          overtimePay,
          totalBenefits,
          totalBonuses,
          grossSalary,
          totalDeductions,
          netSalary
        },
        summary
      }
    });
  } catch (error) {
    console.error('Error calculating monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all monthly salary workers
exports.getAllMonthlySalaryWorkers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = { isActive: true, wageType: 'monthly' };
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
    console.error('Error fetching monthly salary workers:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Bulk update monthly salaries
exports.bulkUpdateMonthlySalaries = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { workerId, monthlySalary }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { workerId, monthlySalary } = update;
        
        if (!workerId || !monthlySalary || monthlySalary <= 0) {
          errors.push({ workerId, error: 'Invalid workerId or monthlySalary' });
          continue;
        }

        const worker = await Worker.findByIdAndUpdate(
          workerId,
          { 
            monthlySalary: Number(monthlySalary),
            wageType: 'monthly'
          },
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
    console.error('Error bulk updating monthly salaries:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get monthly salary statistics
exports.getMonthlySalaryStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get total monthly salary workers count
    const totalWorkers = await Worker.countDocuments({ isActive: true, wageType: 'monthly' });

    // Get average monthly salary
    const avgSalaryResult = await Worker.aggregate([
      { $match: { isActive: true, wageType: 'monthly', monthlySalary: { $gt: 0 } } },
      { $group: { _id: null, avgSalary: { $avg: '$monthlySalary' } } }
    ]);

    const avgMonthlySalary = avgSalaryResult.length > 0 ? avgSalaryResult[0].avgSalary : 0;

    // Get salary summary statistics for the month
    const salaryStats = await SalarySummary.aggregate([
      {
        $match: {
          wageType: 'monthly',
          year: Number(currentYear),
          month: Number(currentMonth)
        }
      },
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: '$grossSalary' },
          totalNetSalary: { $sum: '$netSalary' },
          totalReceived: { $sum: '$receivedAmount' },
          totalPending: { $sum: '$pendingAmount' },
          avgWorkingDays: { $avg: '$workingDays' }
        }
      }
    ]);

    res.json({
      data: {
        totalWorkers,
        avgMonthlySalary: Math.round(avgMonthlySalary),
        currentMonth: {
          year: Number(currentYear),
          month: Number(currentMonth),
          totalGrossSalary: salaryStats.length > 0 ? salaryStats[0].totalGrossSalary : 0,
          totalNetSalary: salaryStats.length > 0 ? salaryStats[0].totalNetSalary : 0,
          totalReceived: salaryStats.length > 0 ? salaryStats[0].totalReceived : 0,
          totalPending: salaryStats.length > 0 ? salaryStats[0].totalPending : 0,
          avgWorkingDays: salaryStats.length > 0 ? Math.round(salaryStats[0].avgWorkingDays) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching monthly salary stats:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




