const rateScheduler = require('../services/rateScheduler');
const Rate = require('../models/rateModel');
const RateHistory = require('../models/RateHistory');

// Get scheduler status
exports.getSchedulerStatus = async (req, res) => {
  try {
    const status = rateScheduler.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting scheduler status',
      error: error.message
    });
  }
};

// Start scheduler
exports.startScheduler = async (req, res) => {
  try {
    rateScheduler.start();
    res.json({
      success: true,
      message: 'Rate scheduler started successfully'
    });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting scheduler',
      error: error.message
    });
  }
};

// Stop scheduler
exports.stopScheduler = async (req, res) => {
  try {
    rateScheduler.stop();
    res.json({
      success: true,
      message: 'Rate scheduler stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping scheduler',
      error: error.message
    });
  }
};

// Trigger manual rate fetch
exports.triggerRateFetch = async (req, res) => {
  try {
    await rateScheduler.triggerFetch();
    res.json({
      success: true,
      message: 'Manual rate fetch triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering rate fetch:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering rate fetch',
      error: error.message
    });
  }
};

// Get latest rates from all sources
exports.getLatestRates = async (req, res) => {
  try {
    const { product } = req.query;
    
    const filter = {};
    if (product) {
      filter.product = product;
    }

    // Get latest rates from all sources
    const rates = await Rate.find(filter)
      .sort({ effectiveDate: -1, createdAt: -1 })
      .limit(50);

    // Group by product and source
    const groupedRates = rates.reduce((acc, rate) => {
      const key = `${rate.product}_${rate.source}`;
      if (!acc[key] || rate.effectiveDate > acc[key].effectiveDate) {
        acc[key] = rate;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(groupedRates)
    });
  } catch (error) {
    console.error('Error getting latest rates:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting latest rates',
      error: error.message
    });
  }
};

// Get rate history with filters
exports.getRateHistory = async (req, res) => {
  try {
    const { 
      product, 
      source, 
      from, 
      to, 
      limit = 100,
      page = 1 
    } = req.query;

    const filter = {};
    
    if (product) filter.rateType = product;
    if (source) filter.source = source;
    
    if (from || to) {
      filter.effectiveDate = {};
      if (from) filter.effectiveDate.$gte = new Date(from);
      if (to) filter.effectiveDate.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [rates, total] = await Promise.all([
      RateHistory.find(filter)
        .populate('updatedBy', 'name email')
        .sort({ effectiveDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      RateHistory.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: rates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting rate history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting rate history',
      error: error.message
    });
  }
};

// Get rate statistics
exports.getRateStatistics = async (req, res) => {
  try {
    const { product, days = 30 } = req.query;
    
    const filter = {};
    if (product) filter.product = product;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    filter.effectiveDate = { $gte: startDate };

    const rates = await Rate.find(filter).sort({ effectiveDate: -1 });
    
    // Calculate statistics
    const stats = {
      totalRates: rates.length,
      bySource: {},
      byProduct: {},
      averageRates: {},
      latestRates: {}
    };

    rates.forEach(rate => {
      // Count by source
      stats.bySource[rate.source] = (stats.bySource[rate.source] || 0) + 1;
      
      // Count by product
      stats.byProduct[rate.product] = (stats.byProduct[rate.product] || 0) + 1;
      
      // Calculate average rates
      if (!stats.averageRates[rate.product]) {
        stats.averageRates[rate.product] = { total: 0, count: 0 };
      }
      stats.averageRates[rate.product].total += rate.rate || rate.marketRate || rate.companyRate || 0;
      stats.averageRates[rate.product].count += 1;
      
      // Get latest rates
      if (!stats.latestRates[rate.product] || rate.effectiveDate > stats.latestRates[rate.product].effectiveDate) {
        stats.latestRates[rate.product] = rate;
      }
    });

    // Calculate averages
    Object.keys(stats.averageRates).forEach(product => {
      const data = stats.averageRates[product];
      stats.averageRates[product] = data.count > 0 ? data.total / data.count : 0;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting rate statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting rate statistics',
      error: error.message
    });
  }
};






