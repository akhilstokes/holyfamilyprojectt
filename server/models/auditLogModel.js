const mongoose = require('mongoose');

// Generic Audit Log model used by enhanced controllers
// Captures who did what, on which entity, with optional details and IP
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userRole: { type: String, default: '' },
  action: { type: String, required: true },
  entityType: { type: String, default: '' },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);


