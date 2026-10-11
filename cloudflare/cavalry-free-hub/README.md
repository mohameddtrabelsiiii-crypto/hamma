# Cavalry free Cloudflare backend

Deployed to Cloudflare on 2026-10-11. Separate from the current TaskForge Pages production site.

Resources:
- Worker `cavalry-free-hub`
- D1 `taskforge_operations` with `jobs` and `events` tables
- KV `taskforge-cavalry-config` (key `initialized=yes`)
- Queue `taskforge-jobs` with the Worker consumer
- Vectorize `cavalry-knowledge` using BGE-small embeddings dimensions
- Workers AI binding `AI` (configured, no inference automation)
- AI Gateway `taskforge-free-gateway` (BYOK only; separate, no paid model routing enabled)
- Six-hour Cloudflare Cron.

Deployment source is in this directory; the original deployment was made via Cloudflare API. Code here is a reproducible mirror. It does **not** automatically deploy.

Public GET /health is read-only; all other endpoints return 404. Do not expose a write route until request authentication and abuse controls are in place.

Live integration test on 2026-10-11: D1 insert -> Cloudflare Queue enqueue -> consumer Worker -> D1 state `complete` -> queue backlog zero.

This is an infrastructure heartbeat **not** a completed Hermes, Whop, Shopify, customer checkout, or autonomous fulfillment integration.

Do not activate or upgrade any paid Cloudflare service without checking account plan, cost, and permission.
