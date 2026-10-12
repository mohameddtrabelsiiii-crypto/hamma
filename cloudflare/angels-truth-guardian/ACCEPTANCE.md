# ANGELS.co Guardian — acceptance gate (not a certificate)

Every requirement remains UNVERIFIED until a separate authorized verifier records independent evidence.

| Criterion | Present implementation | Certification status |
| --- | --- | --- |
| Separate runtime | Dedicated Worker source & binding | Requires live deployment observation |
| Persistent identity | Durable Object Ed25519 keypair | Needs independent restart and owner escrow validation |
| Tamper-evident ledger | Hash chain + signatures | Needs adversarial storage corruption test + external notarization |
| Independent company discovery | Two internal worker bindings only; no company registry integration | BLOCKED |
| Project/task/worker event ingestion | Not connected | BLOCKED |
| Temporal failure detection | Only self-observation | BLOCKED |
| Persistent incidents | Failed endpoint probe incident schema; not independently tested | UNVERIFIED |
| Bounded recovery | Disabled by design | BLOCKED |
| STOP / FREEZE enforcement | No mutation permissions | Requires real owner-control integration tests |
| Independent outcome verification | First signed self-event independently verified by Node; business outcomes not connected | BLOCKED |
| Worker handover confirmation | Not connected | BLOCKED |
| Disaster recovery / secondary provider | Not configured | BLOCKED |
| Two proven autonomous cycles | Await real Cron receipts | UNVERIFIED |
| 18 adversarial scenarios | Not executed | BLOCKED |
| Independent production signoff | Not issued | BLOCKED |

## Required next execution stages

1. Register authoritative ANGELS.co projects and authenticated telemetry sources. Any not discovered stay UNKNOWN.
2. Issue signed, scoped ingest authority per producer; verify actual receipt and delivery, reject unsigned claims as evidence.
3. Establish measured state machine, objective evidence checks, custody and durable incident registry.
4. Add independent read-only verification probes and qualified recovery worker handovers.
5. Preserve founder STOP/FREEZE in a separately administered authority channel before any recovery mutates state.
6. Export sealed checkpoints to independently managed backup and test isolated restore.
7. Execute all 18 adversarial scenarios with recorded verdicts.
8. Obtain independent authorized certification only after all mandatory live-workload tests pass.

## Verified activation evidence (2026-10-12)

- Cloudflare deployment API accepted dedicated Worker with SQLite Durable Object migration and scheduled trigger.
- External laptop HTTP GET /health and /identity both returned 200; POST /events returned 404.
- First scheduled self-cycle written at 2026-10-12T14:30:47Z, identity fingerprint `cade0bff6d81b9edbaf475ed82878312f70e7a8fb4978e69cca49eed02c76ace`.
- External Windows Node 24 verifier compared pinned identity, SHA-256 chain and Ed25519 signature and returned `independent_verdict: PASS` for event sequence 1.
- Cloudflare API confirmed read-only service bindings to `cavalry-free-hub`, `cavalry-durable-control`; actual scheduled external probe receipts remain pending at time of this record.
- GitHub issue #13 records full non-certified engineering mission. Sending an issue is **not** worker acknowledgement or execution.

**Caution:** This is activation evidence, not production certification. The scheduled self-event proves autonomy for that cycle only; it does not demonstrate company-wide coverage, recovery or provider independence.

## Follow-up runtime validation and known defects (2026-10-12)

- Cloudflare API verified two read-only service bindings in the deployed Worker and a correctly configured Cron.
- As of 2026-10-12T14:53Z, direct `/health` still reported `ledger_entries:1`, `observed_worker_count:0`, `last_service_probe_at:null`, company coverage UNKNOWN. This is evidence of an **unverified service observation stage**, not monitoring success. Cron propagation may be delayed, but an actual successful v2 observation must be demonstrated independently.
- Temporary one-minute activation-test Cron was restored to the intended every-30-minutes schedule; Cloudflare GET confirmed `*/30 * * * *` at 2026-10-12T14:54:10Z.
- **P0 before sustained operation:** `validateLedger()` deliberately fails closed after 2000 entries and performs a full signature scan on each run. Replace with a scalable, independently checkpointed scheme and test capacity under realistic retention. At two events per half-hour, the threshold could be reached in approximately 21 days; do not imply perpetual operational continuity.
- **P0 before company monitoring:** prove scheduled service observations record correct worker outcomes and actual persisted incidents, and verify invalid false health responses are rejected.
- **P0 before sovereignty:** private identity material still exists in only one Cloudflare provider; a separate independently managed recovery key, evidence escrow and tested backup are mandatory.
