# Cloudflare free infrastructure installation — 2026-10-11

## Verified active
- Existing Cloudflare Pages website: `taskforge-ai.pages.dev`, production deployment successful.
- Worker: `cavalry-free-hub`. Connected D1 `taskforge_operations`, KV `taskforge-cavalry-config`, Queue `taskforge-jobs`, Workers AI and Vectorize `cavalry-knowledge`. Cron: `0 */6 * * *`.
- Queue consumer: tested POST message -> Worker consumed -> D1 job status changed to complete, queue backlog 0. Public Worker only exposes read-only /health and rejects all other routes.
- Worker: `cavalry-durable-control`, SQLite Durable Object class `CavalryState`, Workflow `cavalry-daily-workflow`. Cron: `15 1 * * *`.
- Workflow instance test: Cloudflare status complete; D1 events recorded `workflow / cavalry-durable-control / run 1`.
- Workers AI `@cf/baai/bge-small-en-v1.5`: generated 384-dimensional embedding from safe business description. Insert and semantic retrieval through Vectorize confirmed.
- AI Gateway `taskforge-free-gateway`: configured with BYOK-only provider mode, limit 60/60s, disabled gateway logs, no external model credentials connected.
- Managed Turnstile widget for `taskforge-ai.pages.dev`, sitekey `0x4AAAAAAFT4tLg9QLakWBZM`. Its verification secret is stored as `TURNSTILE_SECRET` in Cloudflare Worker secrets; NEVER commit the secret into GitHub.
- Existing Cloudflare Web Analytics site linked to TaskForge Pages project configuration; tag/token presence verified. No live event collection test yet.
- Existing MedArt and Cavalry Worker scripts were preserved without code changes.

## Remaining steps / do not overstate
- Turnstile protection is NOT active on live submission endpoints until the page embeds the sitekey and its receiving backend verifies tokens with Cloudflare Siteverify.
- Whop checkout, customer order webhooks, Supabase order handling, Hermes execution, and actual paid order settlement are NOT connected to these new Workers.
- No externally verified HTTP response from `cavalry-free-hub` was obtained in this session; the internal queue, D1, Workflow and vector retrieval tests were successful.
- Cloudflare Analytics Engine returned account not enabled, so its binding was not deployed.
- R2 returned account not enabled; do not enroll in billing to create it under the $0 requirement.
- No owned DNS zone in Cloudflare; custom-domain CDN/WAF/DNS/email routing cannot be applied to the branded domain yet.
- Tunnel/Access requires protected local origin setup; do not expose the Hermes laptop directly.
- Hyperdrive requires authorized external DB credentials, which were not imported.
- AI Search is not set up (needs appropriate storage/source configuration; billing/quotas evolve).
- Browser Rendering, Images transforms, Queues and other services have free allocations but should be integrated only when there is a specific workload.
- Billing/subscription endpoint denied access; cannot certify actual account plan or present guaranteed $0 beyond the documented free allowances.

## Deployment ownership and safety
Cloudflare Worker source mirrors: `cloudflare/cavalry-free-hub/` and `cloudflare/cavalry-durable-control/`. They do NOT auto-deploy on GitHub push.
Cloudflare Cron uses UTC. Both scheduled jobs intentionally perform tiny internal checks, not customer work.
The API does not expose unauthenticated order/job creation; future customer interfaces require auth, signed payment confirmation, rate limits, retries, idempotency, and operational monitoring.
