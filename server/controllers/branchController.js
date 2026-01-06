const Branch = require('../models/branchModel');
const { logAudit } = require('../services/auditService');

// Get all branches
exports.getBranches = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const branches = await Branch.find(query)
      .populate('contact.manager', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Error fetching branches:', error);




    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single branch
exports.getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('contact.manager', 'name email')
      .populate('createdBy', 'name email');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    res.json({
      success: true,
      data: branch
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create branch
exports.createBranch = async (req, res) => {
  try {
    const branchData = {
      ...req.body,
      createdBy: req.user._id
    };

    const branch = new Branch(branchData);
    await branch.save();

    // Log audit
    await logAudit({
      action: 'branch_created',
      actor: req.user._id,
      actorRole: req.user.role,
      target: branch._id,
      targetType: 'branch',
      description: `Branch created: ${branch.name} (${branch.code})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Branch code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update branch
exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    Object.assign(branch, req.body);
    await branch.save();

    // Log audit
    await logAudit({
      action: 'branch_updated',
      actor: req.user._id,
      actorRole: req.user.role,
      target: branch._id,
      targetType: 'branch',
      description: `Branch updated: ${branch.name} (${branch.code})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: branch
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete branch
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Log audit before deletion
    await logAudit({
      action: 'branch_deleted',
      actor: req.user._id,
      actorRole: req.user.role,
      target: branch._id,
      targetType: 'branch',
      description: `Branch deleted: ${branch.name} (${branch.code})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await branch.deleteOne();

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get branch financial summary
exports.getBranchFinancialSummary = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    
    // This would aggregate financial data per branch
    // Implementation depends on your Invoice and Payment models
    const summary = {
      branchId,
      totalRevenue: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      pendingInvoices: 0,
      pendingPayments: 0
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching branch financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

