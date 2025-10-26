const StockTransaction = require('../models/stockTransactionModel');
const Stock = require('../models/stockModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Helper function to resolve staff ObjectId
async function resolveStaffObjectId(authUser) {
  try {
    // Handle built-in tokens that have string IDs
    if (authUser?._id && typeof authUser._id === 'string' && authUser._id.startsWith('builtin-')) {
      if (authUser.staffId) {
        const userDoc = await User.findOne({ staffId: authUser.staffId }).select('_id');
        if (userDoc?._id) return userDoc._id;
      }
      return null;
    }
    
    if (authUser?._id && mongoose.isValidObjectId(authUser._id)) {
      return new mongoose.Types.ObjectId(authUser._id);
    }
    if (authUser?.id && mongoose.isValidObjectId(authUser.id)) {
      return new mongoose.Types.ObjectId(authUser.id);
    }
    if (authUser?.userId && mongoose.isValidObjectId(authUser.userId)) {
      return new mongoose.Types.ObjectId(authUser.userId);
    }
    if (authUser?.staffId) {
      const userDoc = await User.findOne({ staffId: authUser.staffId }).select('_id');
      if (userDoc?._id) return userDoc._id;
    }
    return null;
  } catch (_) { 
    return null; 
  }
}

// Create a new stock transaction
exports.createStockTransaction = async (req, res) => {
  try {
    const {
      productName,
      transactionType,
      quantity,
      unit,
      reason,
      reference,
      batchNumber,
      location,
      department,
      unitCost,
      supplier,
      qualityGrade,
      qualityNotes,
      tags,
      requiresApproval
    } = req.body;

    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user. Unable to resolve staff id.' });
    }

    // Get user details
    const user = await User.findById(staffId).select('name role');
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Get current stock level
    let stock = await Stock.findOne({ productName });
    if (!stock) {
      return res.status(404).json({ message: 'Product not found in stock.' });
    }

    const quantityBefore = stock.quantityInLiters;
    let quantityAfter = quantityBefore;

    // Calculate new quantity based on transaction type
    if (transactionType === 'in' || transactionType === 'return' || transactionType === 'production') {
      quantityAfter = quantityBefore + quantity;
    } else if (transactionType === 'out' || transactionType === 'waste') {
      if (quantityBefore < quantity) {
        return res.status(400).json({ message: 'Insufficient stock for this transaction.' });
      }
      quantityAfter = quantityBefore - quantity;
    } else if (transactionType === 'adjustment') {
      quantityAfter = quantity; // For adjustments, quantity is the new absolute value
    }

    // Create transaction
    const transaction = new StockTransaction({
      productName,
      transactionType,
      quantity,
      unit,
      quantityBefore,
      quantityAfter,
      reason,
      reference,
      batchNumber,
      location,
      department,
      unitCost,
      totalCost: unitCost ? unitCost * quantity : undefined,
      supplier,
      qualityGrade,
      qualityNotes,
      tags,
      performedBy: staffId,
      performedByName: user.name,
      performedByRole: user.role,
      requiresApproval: requiresApproval || quantity > 1000, // Auto-approval required for large quantities
      transactionDate: new Date()
    });

    await transaction.save();

    // Update stock level
    stock.quantityInLiters = quantityAfter;
    stock.lastUpdated = new Date();
    stock.lastUpdatedBy = staffId;
    await stock.save();

    res.status(201).json({
      success: true,
      message: 'Stock transaction created successfully',
      transaction,
      newStockLevel: quantityAfter
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get stock history for a product
exports.getStockHistory = async (req, res) => {
  try {
    const { productName } = req.params;
    const { fromDate, toDate, transactionType, limit = 50, page = 1 } = req.query;

    const query = { productName };
    
    if (transactionType) {
      query.transactionType = transactionType;
    }
    
    if (fromDate || toDate) {
      query.transactionDate = {};
      if (fromDate) query.transactionDate.$gte = new Date(fromDate);
      if (toDate) query.transactionDate.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;
    
    const transactions = await StockTransaction.find(query)
      .populate('performedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get all stock transactions (for managers/admins)
exports.getAllStockTransactions = async (req, res) => {
  try {
    const { 
      productName, 
      transactionType, 
      fromDate, 
      toDate, 
      performedBy, 
      location,
      department,
      limit = 50, 
      page = 1 
    } = req.query;

    const query = {};
    
    if (productName) query.productName = productName;
    if (transactionType) query.transactionType = transactionType;
    if (performedBy) query.performedBy = performedBy;
    if (location) query.location = location;
    if (department) query.department = department;
    
    if (fromDate || toDate) {
      query.transactionDate = {};
      if (fromDate) query.transactionDate.$gte = new Date(fromDate);
      if (toDate) query.transactionDate.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;
    
    const transactions = await StockTransaction.find(query)
      .populate('performedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get stock summary and analytics
exports.getStockAnalytics = async (req, res) => {
  try {
    const { productName, fromDate, toDate } = req.query;

    const matchQuery = {};
    if (productName) matchQuery.productName = productName;
    if (fromDate || toDate) {
      matchQuery.transactionDate = {};
      if (fromDate) matchQuery.transactionDate.$gte = new Date(fromDate);
      if (toDate) matchQuery.transactionDate.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    // Get transaction summary by type
    const transactionSummary = await StockTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgQuantity: { $avg: '$quantity' }
        }
      }
    ]);

    // Get daily stock levels
    const dailyLevels = await StockTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' },
            day: { $dayOfMonth: '$transactionDate' }
          },
          level: { $last: '$quantityAfter' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top performers
    const topPerformers = await StockTransaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$performedBy',
          transactionCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { transactionCount: -1 } },
      { $limit: 10 }
    ]);

    // Get current stock levels for all products
    const currentStock = await Stock.find({}).select('productName quantityInLiters lastUpdated');

    res.status(200).json({
      success: true,
      analytics: {
        transactionSummary,
        dailyLevels,
        topPerformers,
        currentStock
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Approve a stock transaction (for managers/admins)
exports.approveStockTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;

    const transaction = await StockTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (!transaction.requiresApproval) {
      return res.status(400).json({ message: 'This transaction does not require approval' });
    }

    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    const user = await User.findById(staffId).select('name');
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    transaction.approvedBy = staffId;
    transaction.approvedByName = user.name;
    transaction.approvedAt = new Date();
    transaction.approvalNotes = approvalNotes;

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction approved successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Reverse a stock transaction
exports.reverseStockTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reversalReason } = req.body;

    const transaction = await StockTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.isReversed) {
      return res.status(400).json({ message: 'Transaction is already reversed' });
    }

    const staffId = await resolveStaffObjectId(req.user);
    if (!staffId) {
      return res.status(400).json({ message: 'Invalid authenticated user.' });
    }

    const user = await User.findById(staffId).select('name');
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Create reverse transaction
    const reverseTransaction = new StockTransaction({
      productName: transaction.productName,
      transactionType: transaction.transactionType === 'in' ? 'out' : 
                      transaction.transactionType === 'out' ? 'in' : 'adjustment',
      quantity: transaction.quantity,
      unit: transaction.unit,
      quantityBefore: transaction.quantityAfter,
      quantityAfter: transaction.quantityBefore,
      reason: `Reversal of transaction ${transaction._id}: ${reversalReason}`,
      reference: `REV-${transaction._id}`,
      performedBy: staffId,
      performedByName: user.name,
      performedByRole: user.role,
      transactionDate: new Date()
    });

    await reverseTransaction.save();

    // Mark original transaction as reversed
    transaction.isReversed = true;
    transaction.reversedBy = staffId;
    transaction.reversedAt = new Date();
    transaction.reversalReason = reversalReason;
    await transaction.save();

    // Update stock level
    const stock = await Stock.findOne({ productName: transaction.productName });
    if (stock) {
      stock.quantityInLiters = transaction.quantityBefore;
      stock.lastUpdated = new Date();
      stock.lastUpdatedBy = staffId;
      await stock.save();
    }

    res.status(200).json({
      success: true,
      message: 'Transaction reversed successfully',
      reverseTransaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get stock transaction by ID
exports.getStockTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await StockTransaction.findById(id)
      .populate('performedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('reversedBy', 'name email role');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};




