# ZENVOCLOUD — API/Webhook Reliability Demo

**Status: in-house technical sample; no paid customer, deployment or revenue implied.**

This standalone Node.js 22+ example demonstrates how to **validate and test** one signed webhook intake path for a synthetic `demo.event`. It uses only Node.js built-ins, no SaaS, no database, no API key, and no real personal information. Intended as a small evidence-backed portfolio reference for **IT bug fixes, API troubleshooting and scoped $50–$150 workflow diagnostics**.

## Run locally

```bash
node --test webhook-demo.test.mjs
export DEMO_WEBHOOK_SECRET='generate-a-new-long-demo-secret-not-for-production'
node webhook-demo.mjs
```

Then `GET http://127.0.0.1:8789/health`. To sign a **synthetic** request, compute `sha256=` plus `HMAC-SHA256(secret, "<10-digit-epoch-seconds>.<raw-JSON-body>")` and send it with `x-event-timestamp`, `x-demo-signature` and `Content-Type: application/json` to `POST /webhook`.

## Behaviors covered

- Strict JSON and basic synthetic event-type/ID validation.
- HMAC-SHA256 calculated from the raw request body and timestamp; constant-time comparison.
- Five-minute replay window, invalid-signature rejection and bounded body size (32 KiB).
- Duplicate event suppression within a process-local 60-minute TTL (not durable).
- Explicit 400, 401, 413, 415, 422 and 503 error paths.
- Automated unit and real HTTP smoke checks. No payloads are logged.

## Production limitations — important

**Not a production service.** In-memory deduplication resets when the process restarts and is **not atomic across replicas**. No persistent database, queue, retries, DLQ, observability, CORS policy, tenant isolation, or deployment/uptime guarantee is included. Secrets must be generated and held by the buyer; only use authorized endpoints and synthetic data until a paid and approved scope is agreed. Review the actual provider's signature scheme and clock-drift handling before any integration. A working local demonstration must not be represented as a shipped client system.

## Commercially scoped first task

For one existing webhook or API branch: diagnose failures and duplicates; produce a reproducible test matrix and a written findings report; quote fixes separately once buyer provides a sanitized failing case. A rate of **$50–$150** is only an indicative target and **not** an order or confirmed price.
