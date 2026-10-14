/**
 * ZENVOCLOUD — webhook reliability demonstration (synthetic events only).
 * In-house, zero-dependency Node.js example. NOT a production integration.
 *
 * Checks: HMAC signature, signed timestamp + replay window, JSON structure,
 * event ID allowlist, duplicate delivery, bounded body size and health route.
 * A process-local Map is deliberately used for illustration; production needs
 * durable, atomic ID storage, authentication policy and operational review.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

const MAX_BYTES = 32 * 1024;
const REPLAY_WINDOW_MS = 5 * 60 * 1000;
const IDEMPOTENCY_TTL_MS = 60 * 60 * 1000;

export function signature(secret, timestamp, rawBody) {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.`).update(rawBody).digest('hex')}`;
}

function signatureMatches(provided, expected) {
  if (typeof provided !== 'string' || !/^sha256=[a-f0-9]{64}$/.test(provided)) return false;
  const actual = Buffer.from(provided, 'utf8');
  const want = Buffer.from(expected, 'utf8');
  return actual.length === want.length && timingSafeEqual(actual, want);
}

function jsonResponse(status, data) {
  return { status, data };
}

export function handleEvent({ headers, rawBody, secret, now = Date.now(), seen = new Map() }) {
  if (typeof secret !== 'string' || secret.length < 16) {
    return jsonResponse(503, { error: 'demo_not_configured' });
  }
  if (headers['content-type']?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    return jsonResponse(415, { error: 'content_type' });
  }
  if (!Buffer.isBuffer(rawBody) || rawBody.length > MAX_BYTES) {
    return jsonResponse(413, { error: 'body_size' });
  }
  const stamp = headers['x-event-timestamp'];
  if (typeof stamp !== 'string' || !/^[0-9]{10}$/.test(stamp)) {
    return jsonResponse(401, { error: 'timestamp' });
  }
  const epochMs = Number(stamp) * 1000;
  if (Math.abs(now - epochMs) > REPLAY_WINDOW_MS) {
    return jsonResponse(401, { error: 'timestamp_outside_window' });
  }
  if (!signatureMatches(headers['x-demo-signature'], signature(secret, stamp, rawBody))) {
    return jsonResponse(401, { error: 'signature' });
  }
  let payload;
  try { payload = JSON.parse(rawBody.toString('utf8')); }
  catch { return jsonResponse(400, { error: 'invalid_json' }); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse(422, { error: 'invalid_payload' });
  }
  const { id, type, data } = payload;
  if (typeof id !== 'string' || !/^[A-Za-z0-9._:-]{1,80}$/.test(id)) {
    return jsonResponse(422, { error: 'event_id' });
  }
  if (type !== 'demo.event' || !data || typeof data !== 'object' || Array.isArray(data)) {
    return jsonResponse(422, { error: 'event_type_or_data' });
  }
  for (const [key, expiry] of seen) if (expiry <= now) seen.delete(key);
  if (seen.has(id)) return jsonResponse(200, { accepted: true, duplicate: true, id });
  if (seen.size >= 1000) return jsonResponse(503, { error: 'demo_capacity' });
  seen.set(id, now + IDEMPOTENCY_TTL_MS);
  return jsonResponse(202, { accepted: true, duplicate: false, id });
}

export function createWebhookServer({ secret, nowFn = () => Date.now() }) {
  const seen = new Map();
  return createServer(async (req, res) => {
    const send = (status, data) => {
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(data));
    };
    if (req.method === 'GET' && req.url === '/health') return send(200, { ok: true, demo: true });
    if (req.method !== 'POST' || req.url !== '/webhook') return send(404, { error: 'not_found' });
    let chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > MAX_BYTES) return send(413, { error: 'body_size' });
      chunks.push(chunk);
    }
    const outcome = handleEvent({ headers: req.headers, rawBody: Buffer.concat(chunks), secret, seen, now: nowFn() });
    return send(outcome.status, outcome.data);
  });
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const secret = process.env.DEMO_WEBHOOK_SECRET;
  if (!secret || secret.length < 16) {
    console.error('Set DEMO_WEBHOOK_SECRET to a unique value (16+ characters).');
    process.exitCode = 1;
  } else {
    const port = Number(process.env.PORT || 8789);
    createWebhookServer({ secret }).listen(port, '127.0.0.1', () => {
      console.log(`Synthetic demo listening on http://127.0.0.1:${port}`);
    });
  }
}
