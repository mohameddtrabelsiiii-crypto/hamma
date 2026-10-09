# Cavalry Med Art — verified autonomous cloud draft engine

Date: 2026-10-09 (UTC)

## What actually runs

- Cloudflare Worker `cavalry-medart-agents`, source: `cloud-team-worker.js`.
- Cloudflare Workers AI model `@cf/meta/llama-3.1-8b-instruct-fp8`.
- Persistent D1 database `cavalry_medart_agents`. Tables: `cycles` and `messages`. Every AI-authored message is `verified=0`.
- Scheduled execution: `0 */3 * * *` UTC; eight runs maximum per UTC day; two model calls per run: one Cavalry supervisor instruction, one specialist draft. No external posting, payments, customer data, product creation, refunds, ads, or bank updates from this Worker.
- Nine role rotation: Atlas -> Muse -> Forge -> Ledger -> Sentinel -> Pulse -> Beacon -> Harbor -> Relay -> Atlas.
- Once per role cycle: retrieve last relevant handoff, Cavalry gives role a scoped assignment, specialist generates a draft and sends it to the next specialist AND Cavalry, D1 durably stores 3 messages.
- This is true hosted AI text inference; it does not rely on the Windows PC staying on.
- Public read-only machine status: https://cavalry-medart-agents.mohameddtrabelsiiii.workers.dev/status
- Cloudflare account AI/D1 usage planned to remain within free allocation. This is not a guarantee if other account services exhaust shared quotas or the account has metered billing. Hard cap of 8 daily cycles is app-local, not an account-wide billing cap.

## Validation completed on 2026-10-09

1. Cloudflare Workers AI returned an actual model response.
2. D1 database tables created and queried successfully.
3. Cloudflare Worker deployed with both `AI` and `DB` bindings.
4. Public `/status` returned HTTP success with team and cycle metrics.
5. Cloudflare cron verified present, set to `0 */3 * * *`.
6. Manual two-agent communication cycles tested: Cavalry -> Atlas -> Muse -> Forge, with 2 specialist outputs, 2 supervisor assignments, 6 durable messages. Persistent message read from Atlas to Muse confirmed.
7. Atlas's initial output contained unsupported market claims; the Muse-facing handoff was corrected and marked as unverified. Source-backed research remains necessary.
8. Windows companion `autonomous_team.py` is installed locally and in GitHub. Mocked inference and fail-closed tests passed; live local model completion is not yet verified.

## Business launch gates **not passed**

Fourthwall Med Art shop: read-only authenticated audit on 2026-10-09 showed **COMING_SOON**, zero product offers and **INACTIVE payout**. The scheduled cloud team currently cannot log into or write Fourthwall. A separate read-only OAuth watcher on the PC had been validated. Public sale, live product listing, checkout and real fulfillment **were NOT executed or proven**. Fourthwall owns its POD checkout; the separate Whop checkout is not a tested Fourthwall integration.

Store launch requires legal merchant payout verification (owner KYC/tax details as requested by the platform), original/licensed finished artwork with real manufacturing specifications, verified base costs and margins, policies/support, product drafts reviewed, public launch and safe test checkout. Do not bypass these controls.

## Security and economics

No third-party pay-per-use model was connected on the Windows PC. The Cloudflare model uses its own server-side AI binding. Never copy Fourthwall OAuth tokens, financial data, personal identities, customer contacts, payment details, or other private fields into D1 or public GitHub. Product and market claims remain unverified until evidenced.

**Definition**: Multi-agent cloud draft execution = proven. Unattended full commercial dropshipping store with sales and payouts = not proven and still blocked.
