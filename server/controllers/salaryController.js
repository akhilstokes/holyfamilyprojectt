const Salary = require('../models/salaryModel');
const SalaryTemplate = require('../models/salaryTemplateModel');
const User = require('../models/userModel');
const PayrollEntry = require('../models/payrollEntryModel');
const SalarySummary = require('../models/salarySummaryModel');

// Create or update salary template for a staff member
exports.createSalaryTemplate = async (req, res) => {
  try {
    const { staffId } = req.params;
    const {
      basicSalary,
      houseRentAllowance,
      medicalAllowance,
      transportAllowance,
      specialAllowance,
      providentFundRate,
      professionalTaxRate,
      incomeTaxRate,
      fixedDeductions,
      effectiveFrom,
      notes
    } = req.body;

    // Validate required fields
    if (!basicSalary || basicSalary <= 0) {
      return res.status(400).json({ message: 'Basic salary is required and must be greater than 0' });
    }

    // Check if staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if staff is admin or field_staff (not daily wage worker)
    if (staff.role === 'user' || staff.role === 'buyer') {
      return res.status(400).json({ message: 'Salary template can only be created for admin or field staff' });
    }

    // Deactivate existing template if any
    await SalaryTemplate.findOneAndUpdate(
      { staff: staffId, isActive: true },
      { isActive: false, effectiveTo: new Date() }
    );

    // Create new salary template
    const salaryTemplate = await SalaryTemplate.create({
      staff: staffId,
      basicSalary,
      houseRentAllowance: houseRentAllowance || 0,
      medicalAllowance: medicalAllowance || 0,
      transportAllowance: transportAllowance || 0,
      specialAllowance: specialAllowance || 0,
      providentFundRate: providentFundRate || 12,
      professionalTaxRate: professionalTaxRate || 2.5,
      incomeTaxRate: incomeTaxRate || 0,
      fixedDeductions: fixedDeductions || 0,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      createdBy: req.user._id,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Salary template created successfully',
      data: salaryTemplate
    });
  } catch (error) {
    console.error('Error creating salary template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get salary template for a staff member
exports.getSalaryTemplate = async (req, res) => {
  try {
    const { staffId } = req.params;

    const salaryTemplate = await SalaryTemplate.findOne({ 
      staff: staffId, 
      isActive: true 
    }).populate('staff', 'name email role staffId');

    if (!salaryTemplate) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    res.json({ data: salaryTemplate });
  } catch (error) {
    console.error('Error fetching salary template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update salary template
exports.updateSalaryTemplate = async (req, res) => {
  try {
    const { staffId } = req.params;
    const updateData = req.body;

    const salaryTemplate = await SalaryTemplate.findOneAndUpdate(
      { staff: staffId, isActive: true },
      { ...updateData, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!salaryTemplate) {
      return res.status(404).json({ message: 'Salary template not found' });
    }

    res.json({
      message: 'Salary template updated successfully',
      data: salaryTemplate
    });
  } catch (error) {
    console.error('Error updating salary template:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Generate monthly salary for a staff member
exports.generateMonthlySalary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month, bonus, overtime, notes } = req.body;

    // Validate inputs
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Valid year and month (1-12) are required' });
    }

    // Get salary template
    const salaryTemplate = await SalaryTemplate.findOne({ 
      staff: staffId, 
      isActive: true 
    });

    if (!salaryTemplate) {
      return res.status(404).json({ message: 'Salary template not found for this staff member' });
    }

    // Check if salary already exists for this month
    const existingSalary = await Salary.findOne({ 
      staff: staffId, 
      year: Number(year), 
      month: Number(month) 
    });

    if (existingSalary) {
      return res.status(400).json({ message: 'Salary already generated for this month' });
    }

    // Calculate deductions based on rates
    const grossSalary = salaryTemplate.basicSalary + 
                       salaryTemplate.houseRentAllowance + 
                       salaryTemplate.medicalAllowance + 
                       salaryTemplate.transportAllowance + 
                       salaryTemplate.specialAllowance + 
                       (bonus || 0) + 
                       (overtime || 0);

    const providentFund = (grossSalary * salaryTemplate.providentFundRate) / 100;
    const professionalTax = (grossSalary * salaryTemplate.professionalTaxRate) / 100;
    const incomeTax = (grossSalary * salaryTemplate.incomeTaxRate) / 100;

    // Create salary record
    const salary = await Salary.create({
      staff: staffId,
      year: Number(year),
      month: Number(month),
      basicSalary: salaryTemplate.basicSalary,
      houseRentAllowance: salaryTemplate.houseRentAllowance,
      medicalAllowance: salaryTemplate.medicalAllowance,
      transportAllowance: salaryTemplate.transportAllowance,
      specialAllowance: salaryTemplate.specialAllowance,
      providentFund,
      professionalTax,
      incomeTax,
      otherDeductions: salaryTemplate.fixedDeductions,
      bonus: bonus || 0,
      overtime: overtime || 0,
      status: 'draft',
      createdBy: req.user._id,
      notes: notes || ''
    });

    res.status(201).json({
      message: 'Monthly salary generated successfully',
      data: salary
    });
  } catch (error) {
    console.error('Error generating monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get monthly salary for a staff member
exports.getMonthlySalary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const salary = await Salary.findOne({ 
      staff: staffId, 
      year: Number(year), 
      month: Number(month) 
    }).populate('staff', 'name email role staffId')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found for this month' });
    }

    res.json({ data: salary });
  } catch (error) {
    console.error('Error fetching monthly salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update monthly salary
exports.updateMonthlySalary = async (req, res) => {
  try {
    const { salaryId } = req.params;
    const updateData = req.body;

    // Don't allow updating status to 'paid' directly
    if (updateData.status === 'paid') {
      return res.status(400).json({ message: 'Use approve and pay endpoint to mark salary as paid' });
    }

    const salary = await Salary.findByIdAndUpdate(
      salaryId,
      updateData,
      { new: true, runValidators: true }
    ).populate('staff', 'name email role staffId');

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({
      message: 'Salary updated successfully',
      data: salary
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Approve salary
exports.approveSalary = async (req, res) => {
  try {
    const { salaryId } = req.params;

    const salary = await Salary.findByIdAndUpdate(
      salaryId,
      { 
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('staff', 'name email role staffId')
     .populate('approvedBy', 'name');

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({
      message: 'Salary approved successfully',
      data: salary
    });
  } catch (error) {
    console.error('Error approving salary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Mark salary as paid
exports.paySalary = async (req, res) => {
  try {
    const { salaryId } = req.params;
    const { paymentMethod, paymentReference } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const salary = await Salary.findByIdAndUpdate(
      salaryId,
      { 
        status: 'paid',
        paymentDate: new Date(),
        paymentMethod,
        paymentReference: paymentReference || ''
      },
      { new: true }
    ).populate('staff', 'name email role staffId');

    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    // Create payroll entry for tracking
    await PayrollEntry.create({
      staff: salary.staff._id,
      year: salary.year,
      month: salary.month,
      type: 'received',
      amount: salary.netSalary,
      note: `Monthly salary payment - ${paymentMethod}`,
      createdBy: req.user._id
    });

    res.json({
      message: 'Salary marked as paid successfully',
      data: salary
    });
  } catch (error) {
    console.error('Error marking salary as paid:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get salary history for a staff member
exports.getSalaryHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year, limit = 12 } = req.query;

    let query = { staff: staffId };
    if (year) {
      query.year = Number(year);
    }

    const salaries = await Salary.find(query)
      .sort({ year: -1, month: -1 })
      .limit(Number(limit))
      .populate('staff', 'name email role staffId')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    res.json({ data: salaries });
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all salaries for admin dashboard
exports.getAllSalaries = async (req, res) => {
  try {
    const { year, month, status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (year) query.year = Number(year);
    if (month) query.month = Number(month);
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const salaries = await Salary.find(query)
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('staff', 'name email role staffId')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    const total = await Salary.countDocuments(query);

    res.json({
      data: salaries,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching all salaries:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get salary summary for dashboard
exports.getSalarySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get salary statistics for the specified month
    const salaryStats = await Salary.aggregate([
      {
        $match: {
          year: Number(currentYear),
          month: Number(currentMonth)
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netSalary' }
        }
      }
    ]);

    // Get total staff count with salary templates
    const totalStaff = await SalaryTemplate.countDocuments({ isActive: true });

    // Get pending salaries count
    const pendingSalaries = await Salary.countDocuments({ 
      status: 'draft',
      year: Number(currentYear),
      month: Number(currentMonth)
    });

    res.json({
      data: {
        salaryStats,
        totalStaff,
        pendingSalaries,
        currentYear,
        currentMonth
      }
    });
  } catch (error) {
    console.error('Error fetching salary summary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};






