import auditService from '../../modules/audit/services/auditService.js';

const EXCLUDED_MODELS = new Set(['AuditLog']);

const modelNameOf = (ctx) => {
  if (!ctx) return null;
  if (typeof ctx.modelName === 'string') return ctx.modelName;
  if (ctx.constructor && typeof ctx.constructor.modelName === 'string') return ctx.constructor.modelName;
  if (ctx.model && typeof ctx.model.modelName === 'string') return ctx.model.modelName;
  return null;
};

const isExcluded = (entity) => !entity || EXCLUDED_MODELS.has(entity);

const snapshot = (doc) => {
  if (!doc) return null;
  if (typeof doc.toObject === 'function') {
    try {
      return doc.toObject();
    } catch {
      return null;
    }
  }
  return null;
};

const filterId = (filter) => (filter && filter._id ? String(filter._id) : null);

const auditPlugin = (schema) => {
  schema.pre('save', function preSave(next) {
    this.$locals.auditAction = this.isNew ? 'create' : 'update';
    if (!this.isNew) {
      const set = {};
      this.modifiedPaths().forEach((path) => {
        set[path] = this.get(path);
      });
      this.$locals.auditSet = set;
    }
    next();
  });

  schema.post('save', function postSave(doc) {
    const entity = modelNameOf(doc);
    if (isExcluded(entity)) return;
    const action = doc.$locals.auditAction || 'update';
    const changes = action === 'create' ? { after: snapshot(doc) } : { set: doc.$locals.auditSet };
    auditService.record({ action, entity, entityId: doc._id, changes, source: 'model' });
  });

  schema.post('insertMany', function postInsertMany(docs) {
    const entity = modelNameOf(this);
    if (isExcluded(entity)) return;
    auditService.record({
      action: 'create',
      entity,
      metadata: { via: 'insertMany', count: docs?.length || 0 },
      changes: { after: (docs || []).map(snapshot) },
      source: 'model',
    });
  });

  const postUpdate = function postUpdate() {
    const entity = modelNameOf(this);
    if (isExcluded(entity)) return;
    const filter = this.getFilter ? this.getFilter() : {};
    auditService.record({
      action: 'update',
      entity,
      entityId: filterId(filter),
      metadata: { filter },
      changes: { update: this.getUpdate ? this.getUpdate() : null },
      source: 'model',
    });
  };
  schema.post('findOneAndUpdate', postUpdate);
  schema.post('updateOne', postUpdate);
  schema.post('updateMany', postUpdate);

  const postDelete = function postDelete() {
    const entity = modelNameOf(this);
    if (isExcluded(entity)) return;
    const filter = this.getFilter ? this.getFilter() : {};
    auditService.record({
      action: 'delete',
      entity,
      entityId: filterId(filter),
      metadata: { filter },
      source: 'model',
    });
  };
  schema.post('findOneAndDelete', postDelete);
  schema.post('deleteMany', postDelete);
  schema.post('deleteOne', postDelete);
};

export default auditPlugin;
