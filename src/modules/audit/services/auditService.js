import logger from '../../../config/logger/logger.js';
import { getContext } from '../../../common/context/requestContext.js';
import AuditLog from '../models/AuditLog.js';

const auditService = {
  async record({
    action,
    entity,
    entityId = null,
    changes = null,
    metadata = null,
    source = 'service',
    actor = null,
    actorEmail = '',
  }) {
    const ctx = getContext();

    const entry = {
      actor: actor || ctx.userId || null,
      actorEmail: actorEmail || ctx.userEmail || '',
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      changes: changes ? logger.redact(changes) : null,
      metadata: metadata ? logger.redact(metadata) : null,
      ip: ctx.ip || null,
      userAgent: ctx.userAgent || null,
      requestId: ctx.requestId || null,
      source,
    };

    logger.audit(action, entry);

    try {
      await AuditLog.create(entry);
    } catch (error) {
      logger.error('No se pudo persistir el registro de auditoría.', {
        action,
        entity,
        entityId: entry.entityId,
        error,
      });
    }

    return entry;
  },
};

export default auditService;
