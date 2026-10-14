import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEvent, signature, createWebhookServer } from './webhook-demo.mjs';

const secret = 'local-synthetic-test-secret-not-production';
const now = Date.UTC(2026, 9, 14, 7, 0, 0);
const stamp = String(Math.floor(now / 1000));
const sample = (id = 'evt_demo_001') => Buffer.from(JSON.stringify({ id, type: 'demo.event', data: { synthetic: true } }));
const headersFor = (rawBody, at = stamp) => ({
  'content-type': 'application/json', 'x-event-timestamp': at,
  'x-demo-signature': signature(secret, at, rawBody),
});
const verify = (id, overrides = {}) => {
  const rawBody = overrides.rawBody || sample(id);
  return handleEvent({ headers: overrides.headers || headersFor(rawBody), rawBody, secret, now: overrides.now ?? now, seen: overrides.seen || new Map() });
};

test('valid signed synthetic event accepted', () => assert.equal(verify('good').status, 202));
test('duplicate delivery acknowledged without reprocessing', () => {
  const seen = new Map();
  assert.equal(verify('repeat', { seen }).data.duplicate, false);
  assert.equal(verify('repeat', { seen }).data.duplicate, true);
  assert.equal(seen.size, 1);
});
test('invalid signature rejected', () => {
  const body = sample('bad-signature');
  const headers = headersFor(body); headers['x-demo-signature'] = 'sha256=' + '0'.repeat(64);
  assert.equal(verify('bad-signature', { headers }).status, 401);
});
test('unsigned body rejected', () => assert.equal(verify('unsigned', { headers: { 'content-type': 'application/json', 'x-event-timestamp': stamp } }).status, 401));
test('old event replay rejected', () => {
  const body = sample('old');
  assert.equal(verify('old', { headers: headersFor(body, String(Math.floor((now - 6 * 60 * 1000) / 1000))) }).status, 401);
});
test('future timestamp rejected', () => {
  const body = sample('future');
  assert.equal(verify('future', { headers: headersFor(body, String(Math.floor((now + 6 * 60 * 1000) / 1000))) }).status, 401);
});
test('missing timestamp rejected', () => assert.equal(verify('no-time', { headers: { 'content-type': 'application/json', 'x-demo-signature': 'abc' } }).status, 401));
test('wrong media type rejected', () => {
  const body = sample('plain'); const headers = headersFor(body); headers['content-type'] = 'text/plain';
  assert.equal(verify('plain', { headers }).status, 415);
});
test('malformed JSON rejected after valid signing', () => {
  const rawBody = Buffer.from('{bad json');
  assert.equal(verify('bad-json', { rawBody }).status, 400);
});
test('array root rejected', () => {
  const rawBody = Buffer.from('[]');
  assert.equal(verify('arr', { rawBody }).status, 422);
});
test('missing event ID rejected', () => {
  const rawBody = Buffer.from(JSON.stringify({ type: 'demo.event', data: {} }));
  assert.equal(verify('missing-id', { rawBody }).status, 422);
});
test('unsafe event ID rejected', () => {
  const rawBody = sample('bad id!');
  assert.equal(verify('bad id!', { rawBody }).status, 422);
});
test('unknown event type rejected', () => {
  const rawBody = Buffer.from(JSON.stringify({ id: 'unknown', type: 'user.delete', data: {} }));
  assert.equal(verify('unknown', { rawBody }).status, 422);
});
test('malformed data rejected', () => {
  const rawBody = Buffer.from(JSON.stringify({ id: 'data', type: 'demo.event', data: null }));
  assert.equal(verify('data', { rawBody }).status, 422);
});
test('oversized body rejected', () => {
  const rawBody = Buffer.alloc(32 * 1024 + 1, 'x');
  assert.equal(verify('huge', { rawBody }).status, 413);
});
test('weak or missing secret rejected', () => {
  const rawBody = sample('weak');
  assert.equal(handleEvent({ headers: headersFor(rawBody), rawBody, secret: 'weak', now, seen: new Map() }).status, 503);
});
test('expired in-memory dedupe entry permits event again (not durable storage)', () => {
  const seen = new Map();
  assert.equal(verify('ttl', { seen }).status, 202);
  assert.equal(verify('ttl', { seen, now: now + 61 * 60 * 1000, headers: headersFor(sample('ttl'), String(Math.floor((now + 61 * 60 * 1000) / 1000))) }).status, 202);
});
test('at capacity refuses new IDs without evicting live entries', () => {
  const seen = new Map(Array.from({ length: 1000 }, (_, i) => [`existing-${i}`, now + 10000]));
  assert.equal(verify('overflow', { seen }).status, 503);
});
test('HTTP smoke: health, route, valid and duplicate delivery', async () => {
  const server = createWebhookServer({ secret });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = server.address().port;
    const base = `http://127.0.0.1:${port}`;
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, demo: true });
    const notFound = await fetch(`${base}/does-not-exist`);
    assert.equal(notFound.status, 404);
    const rawBody = sample('http');
    const at = String(Math.floor(Date.now() / 1000));
    const headers = headersFor(rawBody, at);
    const first = await fetch(`${base}/webhook`, { method: 'POST', headers, body: rawBody });
    assert.equal(first.status, 202);
    const second = await fetch(`${base}/webhook`, { method: 'POST', headers, body: rawBody });
    assert.equal(second.status, 200);
    assert.equal((await second.json()).duplicate, true);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
