const AccountantAuditLog = require('../models/accountantAuditLogModel');

exports.logAudit = async (auditData) => {
  try {
    await AccountantAuditLog.create({
      action: auditData.action,
      actor: auditData.actor,
      actorRole: auditData.actorRole,
      target: auditData.target,
      targetType: auditData.targetType,
      changes: auditData.changes,
      description: auditData.description,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging audit:', error);
    // Don't throw - audit logging should not break main operation
  }
};

exports.getAuditLogs = async (filter = {}, options = {}) => {
  try {
    const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const logs = await AccountantAuditLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('actor', 'name email role');
    
    const total = await AccountantAuditLog.countDocuments(filter);
    
    return {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};
