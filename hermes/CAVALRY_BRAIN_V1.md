# Zenvocloud Cavalry Brain v1

This is a **bounded autonomous agent runner**, **not AGI** and not a commercial sales bot. It is intentionally separate from the public storefront and merchant systems.

- Local execution only on the authorized native Windows machine; code's dependency `mercury_lite_worker.py` and the native Hermes Kanban API must already exist in the same local folder.
- Reads aggregate task counts from the native Hermes board. Requests a small local Ollama model (`qwen3.5:0.8b`) to select among a **fixed set of read-only inspections**. Invalid or unavailable model responses fall back to the QA action.
- Performs one of: Node regression test of the existing customer-facing site, HTTP availability test of the existing public homepage, or inspection of pending owner-approved CSV manifests (no file processing).
- Creates, claims and completes a native Cavalry Kanban task. Checks task and run outcomes from the database before calling it verified; writes an evidence receipt at `HermesOps/runtime/cavalry-brain/latest-proof.json`.
- Refuses spending, customer contact, payment or checkout operations. Contains no external write tools and requires no new provider subscription.
- Source is a repository **copy** of the local installed runner. The Windows Task Scheduler task `Zenvocloud CAVALRY Brain v1` was created on 2026-10-14 with a four-hour recurrence. Confirm current status in Task Scheduler; the PC must be powered, signed in as needed, and connected for local model/web checks.

## Operational limits

The first 2026-10-14 native Hermes task `t_5d30d0cf` completed with 29/29 Node tests; the local model's first response was invalid and the safe fallback ran. **Do not report local model planning as verified until a later receipt shows `selected_by=local_ollama`.** The runner does not prospect externally, sign contracts, process customer work, verify merchant payments, or guarantee any income.

Initial live execution and a registered schedule are not proof that all future unattended runs will succeed. Monitor receipts and Scheduler exit codes. Task Scheduler's initial `LastTaskResult=267011` means the new task has not run under the scheduler yet.
