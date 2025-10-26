const Rate = require('../models/rateModel');
const LatexRequest = require('../models/latexRequestModel');
const ActivityLogger = require('../services/activityLogger');

// Get current company rate
exports.getCurrentRate = async (req, res) => {
  try {
    const { product = 'latex60' } = req.query;

    const latestRate = await Rate.findOne({ product, status: 'published' })
      .sort({ effectiveDate: -1, createdAt: -1 });

    if (!latestRate) {
      return res.status(404).json({ message: 'No rates found' });
    }

    res.json({
      success: true,
      data: {
        product: latestRate.product,
        companyRate: latestRate.companyRate,
        marketRate: latestRate.marketRate,
        effectiveDate: latestRate.effectiveDate,
        lastUpdated: latestRate.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching current rate:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching current rate',
      error: error.message
    });
  }
};

// Get rate history
exports.getRateHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, product = 'latex60' } = req.query;

    const skip = (page - 1) * limit;

    const rates = await Rate.find({ product })
      .sort({ effectiveDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Rate.countDocuments({ product });

    res.json({
      success: true,
      data: rates,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching rate history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rate history',
      error: error.message
    });
  }
};

// Submit latex sell request
exports.submitLatexRequest = async (req, res) => {
  try {
    const { quantity, quality, location, contactNumber, notes } = req.body;
    const userId = req.user._id;

    if (!quantity || !quality || !location || !contactNumber) {
      return res.status(400).json({ 
        message: 'Quantity, quality, location, and contact number are required' 
      });
    }

    // Get current rate for calculation
    const currentRate = await Rate.findOne({ product: 'latex60', status: 'published' })
      .sort({ effectiveDate: -1, createdAt: -1 });

    if (!currentRate) {
      return res.status(400).json({ message: 'No current rate available' });
    }

    // Calculate estimated payment
    const estimatedPayment = quantity * currentRate.companyRate;

    const latexRequest = new LatexRequest({
      user: userId,
      quantity: Number(quantity),
      quality,
      location,
      contactNumber,
      notes: notes || '',
      currentRate: currentRate.companyRate,
      estimatedPayment,
      status: 'pending'
    });

    await latexRequest.save();

    // Log the request submission
    await ActivityLogger.logActivity({
      user: userId,
      action: 'latex_request_submitted',
      description: `Submitted latex sell request for ${quantity}kg at ₹${currentRate.companyRate}/kg`,
      entityType: 'request',
      entityId: latexRequest._id,
      metadata: { quantity, quality, estimatedPayment }
    });

    res.json({
      success: true,
      message: 'Latex sell request submitted successfully',
      data: {
        requestId: latexRequest._id,
        quantity,
        quality,
        currentRate: currentRate.companyRate,
        estimatedPayment,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error submitting latex request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting latex request',
      error: error.message
    });
  }
};

// Get user's latex requests
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    let query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const requests = await LatexRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LatexRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// Get specific request details
exports.getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await LatexRequest.findOne({
      _id: requestId,
      user: userId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching request details',
      error: error.message
    });
  }
};

// Calculate payment for given quantity
exports.calculatePayment = async (req, res) => {
  try {
    const { quantity, quality = 'standard' } = req.query;

    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Get current published rate
    const currentRate = await Rate.findOne({ product: 'latex60', status: 'published' })
      .sort({ effectiveDate: -1, createdAt: -1 });

    if (!currentRate) {
      return res.status(400).json({ message: 'No current rate available' });
    }

    const qty = Number(quantity);
    let baseRate = currentRate.companyRate;

    // Apply quality adjustments
    const qualityMultipliers = {
      'premium': 1.1,
      'standard': 1.0,
      'average': 0.9
    };

    const adjustedRate = baseRate * (qualityMultipliers[quality] || 1.0);
    const totalPayment = qty * adjustedRate;

    res.json({
      success: true,
      data: {
        quantity: qty,
        quality,
        baseRate: currentRate.companyRate,
        adjustedRate: Math.round(adjustedRate * 100) / 100,
        totalPayment: Math.round(totalPayment * 100) / 100,
        rateDate: currentRate.effectiveDate
      }
    });
  } catch (error) {
    console.error('Error calculating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating payment',
      error: error.message
    });
  }
};

// Get user dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get current published rate for calculation
    const currentRate = await Rate.findOne({ product: 'latex60', status: 'published' })
      .sort({ effectiveDate: -1, createdAt: -1 });

    // Get user's request statistics
    const requestStats = await LatexRequest.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalPayment: { $sum: '$estimatedPayment' }
        }
      }
    ]);

    // Get recent requests
    const recentRequests = await LatexRequest.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get rate history (last 10 entries)
    const rateHistory = await Rate.find({ product: 'latex60' })
      .sort({ effectiveDate: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        currentRate: currentRate ? {
          companyRate: currentRate.companyRate,
          marketRate: currentRate.marketRate,
          effectiveDate: currentRate.effectiveDate
        } : null,
        requestStats: requestStats,
        recentRequests,
        rateHistory
      }
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// Generate receipt for approved request
exports.generateReceipt = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await LatexRequest.findOne({
      _id: requestId,
      user: userId,
      status: { $in: ['approved', 'paid'] }
    });

    if (!request) {
      return res.status(404).json({ message: 'Approved request not found' });
    }

    const receipt = {
      receiptId: `RCP-${request._id.toString().slice(-8).toUpperCase()}`,
      requestId: request._id,
      user: req.user.name,
      email: req.user.email,
      quantity: request.quantity,
      quality: request.quality,
      rate: request.currentRate,
      totalAmount: request.estimatedPayment,
      status: request.status,
      submittedAt: request.createdAt,
      approvedAt: request.approvedAt,
      paidAt: request.paidAt
    };

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating receipt',
      error: error.message
    });
  }
};




















