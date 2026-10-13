import mongoose from 'mongoose';
import env from '../../../config/environment/env.js';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    actorEmail: { type: String, default: '', lowercase: true, trim: true },
    action: { type: String, required: true, index: true },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, default: null },
    changes: { type: mongoose.Schema.Types.Mixed, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    requestId: { type: String, default: null, index: true },
    source: { type: String, enum: ['service', 'model'], default: 'service' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: env.audit.retentionDays * 24 * 60 * 60, name: 'createdAt_ttl' }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
