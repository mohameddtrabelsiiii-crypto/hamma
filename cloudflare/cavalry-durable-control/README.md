# Cavalry durable control

A separate Cloudflare Worker coordinating a minimal daily multi-step Workflow and an SQLite-backed Durable Object. Both are isolated from TaskForge's payment/customer traffic.

Live test (2026-10-11): created workflow instance via Cloudflare API -> completed DB read step -> Durable Object counter increment -> D1 events record `workflow, cavalry-durable-control, run 1`.

The daily schedule is `15 1 * * *` (UTC). Workflow creation and deployment were performed via Cloudflare API. Repo sources are a mirror for future controlled deployment; GitHub push does not auto-deploy to Cloudflare.

Do not broaden permissions or add customer processing without secure authentication and business workflow validation.
