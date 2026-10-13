import test from 'node:test';
import assert from 'node:assert/strict';
import logger from '../src/config/logger/logger.js';

test('redact oculta claves sensibles de forma recursiva', () => {
  const input = {
    name: 'Carely',
    password: 'secreto',
    nested: { token: 'abc', keep: 1 },
    list: [{ password: 'x' }, { ok: true }],
  };

  const out = logger.redact(input);

  assert.equal(out.name, 'Carely');
  assert.equal(out.password, '[REDACTED]');
  assert.equal(out.nested.token, '[REDACTED]');
  assert.equal(out.nested.keep, 1);
  assert.equal(out.list[0].password, '[REDACTED]');
  assert.equal(out.list[1].ok, true);
});

test('redact convierte Date y Error', () => {
  const out = logger.redact({
    when: new Date('2026-01-01T00:00:00.000Z'),
    err: new Error('fallo'),
  });

  assert.equal(out.when, '2026-01-01T00:00:00.000Z');
  assert.equal(out.err.name, 'Error');
  assert.equal(out.err.message, 'fallo');
});

test('redact evita referencias circulares', () => {
  const a = { name: 'a' };
  a.self = a;

  const out = logger.redact(a);

  assert.equal(out.name, 'a');
  assert.equal(out.self, '[Circular]');
});

test('redact soporta objetos con toObject tipo mongoose', () => {
  const doc = {
    password: 'p',
    toObject() {
      return { password: 'p', name: 'doc' };
    },
  };

  const out = logger.redact(doc);

  assert.equal(out.password, '[REDACTED]');
  assert.equal(out.name, 'doc');
});
