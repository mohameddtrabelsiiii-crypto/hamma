# ANGELS.co Guardian — Phase I foundation

## Verified scope vs. claims

This is an independent **observe-only foundation** deployed separately from Cavalry. It is **not** a completed autonomous company guardian. Until independently certified, the system reports `production_certified: false`, company monitoring `UNKNOWN`, and **zero** authorized recoveries.

## What it implements

- Independent Cloudflare Worker script, separate from existing Cavalry Workers.
- SQLite-backed Durable Object with initialized Ed25519 identity and non-exported runtime signing operations. Public key is exposed; the private JWK remains within the DO storage.
- Durable, ordered hash-chained and Ed25519-signed self-observation events.
- Integrity verification on every scheduled check and health request, fail-closed on mismatch.
- 30-minute independent Cron schedule (UTC). A heartbeat is only liveness, **never** productive progress.
- Public read-only `GET /health`, `GET /identity` and `GET /proof` with no public mutation API.
- Read-only Cloudflare Service Bindings to two existing Cavalry Workers; probe results are not trusted as evidence of their business productivity.
- Durable incident entries on failed service probes; never clear automatically on heartbeat alone.
- A minimal reserved company registry schema, **not** an inventory of connected company systems.

## Absent critical requirements

Two internal Cloudflare Worker health probes are bound, but this is not full company discovery or independent external probes. Missing producer authentication, worker receipts, incident management, autonomy-driven investigation, recovery, authority certification, independent audit service, cross-provider state backup, STOP protocol integration, active handover verification, actual disaster recovery demonstration, or independent release certification. Provider independence, cryptographic identity escrow and two observed autonomous Cron cycles remain unverified.

## Certification gate

See `ACCEPTANCE.md`. A healthy `/health` indicates only an intact local self-observation ledger. It is NOT evidence that the corporate North Star is achieved. Do not label this release production-ready. Never accept arbitrary remote event ingestion or self-recovery without reviewed authority and verification.

## Operational controls

- GET /health — public *non-sensitive* self-state and ledger fingerprint. 503 on detected integrity corruption.
- GET /identity — public Ed25519 verification material; no private key.
- GET /proof — latest signed ledger receipt for independent cryptographic verification.
- Signed receipt verifier: `node verify-proof.mjs` (pin fingerprint independently).
- Any other path or method — 404.
- Intended operating Cron: every 30 minutes, creating signed self-observations, then signed read-only probe receipts for two known Workers. A temporary one-minute test schedule may be used during activation; restore 30 minutes after test.
- No spending, new domains or paid model API dependencies.
