const { getAuditLogs } = require('../services/auditService');
const AccountantAuditLog = require('../models/accountantAuditLogModel');

// Get Audit Logs with Filters
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, actor, targetType, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let filter = {};
    if (action) filter.action = action;
    if (actor) filter.actor = actor;
    if (targetType) filter.targetType = targetType;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { timestamp: -1 }
    };
    
    const result = await getAuditLogs(filter, options);
    
    res.json({
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Audit Log Details
exports.getAuditLog = async (req, res) => {
  try {
    const { auditId } = req.params;
    
    const auditLog = await AccountantAuditLog.findById(auditId)
      .populate('actor', 'name email role');
    
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.json({ data: auditLog });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get Audit Summary
exports.getAuditSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }
    
    // Get action summary
    const actionSummary = await AccountantAuditLog.aggregate([
      { $match: dateFilter.timestamp ? { timestamp: dateFilter } : {} },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get actor summary
    const actorSummary = await AccountantAuditLog.aggregate([
      { $match: dateFilter.timestamp ? { timestamp: dateFilter } : {} },
      {
        $group: {
          _id: '$actor',
          count: { $sum: 1 },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate actor details
    const actorIds = actorSummary.map(item => item._id);
    const actors = await require('../models/userModel').find({
      _id: { $in: actorIds }
    }).select('name email role');
    
    const enrichedActorSummary = actorSummary.map(item => {
      const actorDetails = actors.find(actor => actor._id.equals(item._id));
      return {
        ...item,
        actor: actorDetails ? {
          name: actorDetails.name,
          email: actorDetails.email,
          role: actorDetails.role
        } : null
      };
    });
    
    res.json({
      data: {
        actionSummary,
        actorSummary: enrichedActorSummary,
        period: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      }
    });
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};