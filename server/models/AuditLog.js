const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actorRole: String,
  action: {
    type: String,
    required: true,
    // e.g. 'STATUS_CHANGE', 'KYC_ACCESS', 'OS_FLASH', 'PAYOUT', 'USER_BLOCK', 'LOGIN'
  },
  targetModel: String, // 'Device', 'SellRequest', 'Order', 'User'
  targetId: mongoose.Schema.Types.ObjectId,
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

// Index for fast querying
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ action: 1 });

const { resolveModel } = require('../db/getModel');

module.exports = resolveModel('AuditLog', () => {
  return mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
});
