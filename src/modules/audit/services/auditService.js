import logger from '../../../config/logger/logger.js';
import { getContext } from '../../../common/context/requestContext.js';
import AuditLog from '../models/AuditLog.js';

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  async list({ q, entity, action, source, page = 1, perPage = 20 } = {}) {
    const filter = {};
    if (q) {
      const regex = new RegExp(escapeRegExp(q), 'i');
      filter.$or = [
        { action: regex },
        { entity: regex },
        { entityId: regex },
        { actorEmail: regex },
        { requestId: regex },
      ];
    }
    if (entity) filter.entity = entity;
    if (action) filter.action = action;
    if (source) filter.source = source;

    const skip = (page - 1) * perPage;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, pages: Math.ceil(total / perPage) };
  },

  async getFilterOptions() {
    const [entities, actions, sources] = await Promise.all([
      AuditLog.distinct('entity'),
      AuditLog.distinct('action'),
      AuditLog.distinct('source'),
    ]);
    return {
      entities: entities.filter(Boolean).sort(),
      actions: actions.filter(Boolean).sort(),
      sources: sources.filter(Boolean).sort(),
    };
  },
};

export default auditService;
