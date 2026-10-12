# ANGELS.co Guardian — acceptance gate (not a certificate)

Every requirement remains UNVERIFIED until a separate authorized verifier records independent evidence.

| Criterion | Present implementation | Certification status |
| --- | --- | --- |
| Separate runtime | Dedicated Worker source & binding | Requires live deployment observation |
| Persistent identity | Durable Object Ed25519 keypair | Needs independent restart and owner escrow validation |
| Tamper-evident ledger | Hash chain + signatures | Needs adversarial storage corruption test + external notarization |
| Independent company discovery | Not connected | BLOCKED |
| Project/task/worker event ingestion | Not connected | BLOCKED |
| Temporal failure detection | Only self-observation | BLOCKED |
| Persistent incidents | Not connected | BLOCKED |
| Bounded recovery | Disabled by design | BLOCKED |
| STOP / FREEZE enforcement | No mutation permissions | Requires real owner-control integration tests |
| Independent outcome verification | Not connected | BLOCKED |
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
