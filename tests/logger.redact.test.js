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

test('redact normaliza ObjectId a string hex', () => {
  const objectId = {
    _bsontype: 'ObjectId',
    toHexString: () => '6512abcdef0123456789abcd',
  };

  const out = logger.redact({ id: objectId, nested: { ref: objectId } });

  assert.equal(out.id, '6512abcdef0123456789abcd');
  assert.equal(out.nested.ref, '6512abcdef0123456789abcd');
});

test('redact resume Buffer como texto', () => {
  const out = logger.redact({ data: Buffer.from([1, 2, 3, 4]) });

  assert.equal(out.data, '[Buffer 4 bytes]');
});

test('toSpacedJson produce una sola línea con espacios', () => {
  const out = logger.toSpacedJson({ level: 'info', meta: { a: 1, b: 'x' } });

  assert.equal(out.includes('\n'), false);
  assert.equal(out, '{ "level": "info", "meta": { "a": 1, "b": "x" } }');
});

