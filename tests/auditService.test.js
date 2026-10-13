import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import logger from '../src/config/logger/logger.js';
import AuditLog from '../src/modules/audit/models/AuditLog.js';
import auditService from '../src/modules/audit/services/auditService.js';
import { runWithContext } from '../src/common/context/requestContext.js';

test('record persiste y audita con datos redactados y contexto de request', async () => {
  let persisted = null;
  const auditSpy = mock.method(logger, 'audit', () => {});
  const createSpy = mock.method(AuditLog, 'create', async (entry) => {
    persisted = entry;
    return entry;
  });

  await runWithContext(
    { requestId: 'req-1', userId: null, ip: '127.0.0.1', userAgent: 'node-test' },
    async () => {
      await auditService.record({
        action: 'USER_CREATED',
        entity: 'User',
        entityId: 'abc',
        changes: { password: 'secreto', name: 'Ana' },
      });
    }
  );

  assert.equal(createSpy.mock.callCount(), 1);
  assert.equal(auditSpy.mock.callCount(), 1);
  assert.equal(persisted.action, 'USER_CREATED');
  assert.equal(persisted.entity, 'User');
  assert.equal(persisted.entityId, 'abc');
  assert.equal(persisted.requestId, 'req-1');
  assert.equal(persisted.ip, '127.0.0.1');
  assert.equal(persisted.source, 'service');
  assert.equal(persisted.changes.password, '[REDACTED]');
  assert.equal(persisted.changes.name, 'Ana');

  mock.restoreAll();
});
