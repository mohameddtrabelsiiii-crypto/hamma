---
name: cavalry-med-art-team
description: Run Cavalry's nine specialist zero-cost Med Art POD planning roles on Fourthwall. Trigger on Cavalry, Calgary, dropshipping team, Med Art autonomous commerce.
---
# Cavalry's Med Art Commerce Team

Cavalry supervises **Atlas** (demand), **Muse** (original creative), **Forge** (listings), **Ledger** (pricing), **Pulse** (organic content), **Beacon** (SEO and data), **Harbor** (support), **Sentinel** (safety), and **Relay** (automation).

1. Load `../../../../cavalry/dropshipping/TEAM_TRAINING.md`, `team.json`, and `cavalry/COMMERCE_MASTER_PLAN.md` if present.
2. First check the authenticated Fourthwall Med Art audit and `cavalry/runtime/latest-team-cycle.json`. Use the `fourthwall-dropshipping` skill for verified platform tools.
3. Assign exactly one scoped internal task to each role; label outputs **draft**, **verified**, or **blocked** with dates and sources. Never invent product costs, traffic, store readiness, paid orders or social posts.
4. Block listing publication and checkout until legitimate payout eligibility, verified economics, rights, policies, and tests are documented.
5. Never spend money, publish, send unsolicited marketing, modify bank/payout info, perform refunds, or expose customer identity.
6. A skill prompt does not create nine independent models. Actual multi-agent execution needs a running free inference provider and explicit Hermes subagent support; report it as unavailable until verified.
7. Only Fourthwall owns the POD shop checkout and automatic provider fulfillment. Do not redirect Med Art product buyers to the separate Whop link without a verified integration.

Follow the step-by-step agent training, reliability and compliance playbook in `cavalry/dropshipping/TEAM_TRAINING.md`. Run `python cavalry/dropshipping/test_team.py` to check static controls.

## Verified hosted AI team (2026-10-09)

Cloudflare Worker: `cavalry-medart-agents` with scheduled cron `0 */3 * * *` (UTC), Workers AI `@cf/meta/llama-3.1-8b-instruct-fp8`, D1 `cavalry_medart_agents`. Read-only health: https://cavalry-medart-agents.mohameddtrabelsiiii.workers.dev/status . Uses a daily maximum of 8 AI cycles (Cavalry supervisor assignment + 1 specialist draft, capped). As of first tests, two real model cycles and six persistent messages were verified; Atlas handed off to Muse, Muse handed off to Forge. Both external actions and merchant sales remain blocked. Do not claim Fourthwall checkout/payout enabled; last verified shop state COMING_SOON, payout INACTIVE, zero offers. Cloud roles are operational for **internal unverified drafts**, not autonomous public selling. Cloud AI does not hold Fourthwall OAuth; PC read-only watcher is separate. Do not send real customer information into prompts or database.

Hermes remains able to load this skill and coordinate the same named roles, but do not claim a confirmed Hermes `delegate_task` run until a suitable model has passed a dedicated smoke test. The connected PC's small local Ollama model download and setup are separate from the verified cloud runtime.
