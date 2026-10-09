# Cavalry's Med Art dropshipping unit

**Chief operator: Cavalry** (alias: Calgary). Nine role-specialized worker profiles report to him. This is a zero-*incremental-spend* print-on-demand preparation system linked to the existing Med Art Fourthwall project, not TaskForge customer orders.

## Operation and current limit

- Store: https://med-art-shop.fourthwall.com; platform handles checkout, POD printing and delivery (not Whop checkout).
- Existing PC watcher: `Cavalry_MedArt_Watch`, read-only hourly Fourthwall OAuth MCP check. Run the new `Cavalry_MedArt_Team` scheduler job after verification.
- `run_team.cmd` runs stdlib Python to read the last Fourthwall audit and create a separate queue for each agent in `cavalry/runtime/latest-team-cycle.json` and daily team briefs. It performs **no external writes**.
- AI reasoning/learning is **not active** without a confirmed free, working Hermes model. This system installs prompts, processes, tests and tasks, not magically nine independent minds.
- When PC is shut down, Windows scheduled tasks cannot run. 24/7 AI needs a verified always-on host, inference, and credentials within the zero-spend policy.
- On 2026-10-09, authenticated read-only audit showed Med Art Coming Soon, no products, no collections and inactive payouts. An hourly read-only watcher later returned a timeout; it needs a connectivity retest.

## Run and test

From `cavalry/dropshipping`:

```powershell
python test_team.py
python team_runner.py
```

Windows native Hermes Python is used by `run_team.cmd`. Runtime history and any sensitive OAuth secrets **stay on device**, not GitHub. Avoid order or buyer PII in logs. If no recent healthy Fourthwall audit exists, every external activity stays blocked.

## Gates before claiming a live business

Authenticated current store audit; legitimate active payouts; real original licensed designs and 3+ priced products; verified positive unit contribution including all fees; public storefront with accurate policies, support and delivery timeline; approved checkout testing; legal, privacy and refund checks; permission for all external writes. Each gate requires evidence.

No paid ads, pay-per-use models, vendor purchases, unapproved refunds or payment changes. Existing Whop link is separate from Fourthwall and **must not** replace Fourthwall product checkout without tested integration.

## Training

See [TEAM_TRAINING.md](TEAM_TRAINING.md). These are role instructions and onboarding drills. Passing tests proves the control software works, not that an AI agent has acquired persistent real-world skills.

## Official platform references

- https://docs.fourthwall.com/apps/
- https://help.fourthwall.com/
- https://fourthwall.com/print-on-demand
