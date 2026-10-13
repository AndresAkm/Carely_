import test from 'node:test';
import assert from 'node:assert/strict';
import { runWithContext, getContext, setContext } from '../src/common/context/requestContext.js';

test('getContext devuelve un objeto vacío fuera de un contexto', () => {
  assert.deepEqual(getContext(), {});
});

test('runWithContext expone el contexto y setContext lo parchea', () => {
  runWithContext({ userId: '1', requestId: 'req-1' }, () => {
    assert.equal(getContext().userId, '1');
    assert.equal(getContext().requestId, 'req-1');

    setContext({ role: 'admin' });

    assert.equal(getContext().role, 'admin');
    assert.equal(getContext().userId, '1');
  });
});
