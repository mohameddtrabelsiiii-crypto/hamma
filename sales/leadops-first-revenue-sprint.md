# TaskForge AI — LeadOps First-Revenue Sprint
Updated 2026-10-08 · Internal GTM plan · No customer, payment, endorsement or delivery claims are implied.

## The one offer to sell first
**LeadOps: inbound lead and RFQ triage for growing B2B operators.**

Buyer: sales-operations manager, distributor operations manager, freight/logistics company, or B2B agency owner. Their team receives repeated inquiries via email, spreadsheet, contact forms or shared inboxes and spends time sorting duplicate or incomplete requests before assigning them.

**What is available now**
- Working free browser-only pilot: https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/leadops
- CSV import up to 2 MB / 2,000 rows; deterministic routing for common sales, support and finance intents; duplicate and exception flags; export ready for review.
- Private business-assessment form: https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation
- Automatic **database-side** priority queue for incoming business assessment leads, without reading them publicly.
- This is NOT a generative AI model, a deployed CRM connector, an email sender or an autonomous sales agent. Do not describe it as any of those.

## Offer ladder — INTERNAL pricing hypotheses, not active public offers
These are testing assumptions to validate with buyers, not guaranteed prevailing market prices or live checkout amounts.

1. **Workflow assessment:** free short discovery against one existing manual bottleneck; establish evidence and whether automation is appropriate.
2. **Restricted pilot:** illustrative target US$750–$2,000, depending on data access and one approved trigger; deliver mapping, rule config, quality review and acceptance report for a small supplied sample. Do not accept this payment until legal scope, payouts and quote are verified.
3. **Production integration:** illustrative custom quote US$2,500–$7,500 for a single approved inbox/webform → review queue → CRM destination with integration testing, rollback and permissions. Not currently shipped or quoted.
4. **Maintenance:** only if requested and justified by actual ongoing support needs; scope and price are bespoke.

Price discovery depends on complexity, support costs, API/subscription fees, required access controls and client-approved specs. Customer data stays in their environment where possible.

## Qualify genuinely relevant prospects
Use publicly available company websites, opt-in marketplaces and legitimate professional directories; never scrape private contact data, invent email addresses or claim a relationship that doesn't exist.

Prioritize prospects with:
- Repetitive intake volumes (ask; don't assume a number).
- A team member who owns routing/CRM workflow and can authorize a pilot.
- Tools with documented export or official integrations, with consent.
- An identifiable failure mode: duplicate inquiries, missed follow-up, mismatched routing, long manual processing.
- A buyer willing to measure a baseline, define review thresholds and approve secure access.

Deprioritize unclear access, regulated/sensitive input without controls, vague 'fully autonomous AI' demands, and clients expecting unverified auto-messages or payment actions.

## Five-step first sale
1. **Show** the working free LeadOps CSV pilot to a relevant buyer using fictional demo data.
2. **Discover** one workflow and the owner, approximate volume, existing systems, and manual minutes per record.
3. **Propose** a time-boxed pilot with only authorized sample data and one unambiguous success metric.
4. **Validate** field accuracy, duplicate false positives, privacy, human review, failures and reversion before enabling connected services.
5. **Collect** payment only using properly configured and verified merchant infrastructure, and only on agreed written terms. No invoice or subscription is yet issued.

## Outreach template — customize facts and obey recipient/provider rules
**Subject:** Reduce manual inbound lead and RFQ sorting

Hi [first name],

I’m working on TaskForge LeadOps, a lightweight workflow for teams that manually triage inbound inquiries. We have a browser-only sample that flags repeated contacts, sorts requests into review queues and exports a CSV without uploading the records.

If [company] currently routes leads or RFQs manually, I can show the sample and discuss whether a narrowly scoped pilot could help your team. No access to your systems is needed to evaluate the demo:
https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/leadops

Would this be relevant to the person handling [verified workflow]? If not, please let me know and I won’t follow up.

TaskForge AI

**Personalization rule:** Mention only verified, publicly known details. Never claim to have inspected their inbox, measured their savings or built their integration. Do not send mass unsolicited email or evade opt-out and anti-spam controls.

## Discovery questions
- How many inbound RFQs / leads arrive weekly?
- What are the current data sources and destination(s)?
- How long is review / assignment per item? How was it measured?
- What errors are costly and what false-positive rate is acceptable?
- Who approves routing or contacting customers? What audit trail is required?
- What data is authorized for a sandbox pilot, and can it be anonymized?

## Proof and ROI
Only use customer-confirmed volumes and measured minutes saved. Calculate time capacity, not guaranteed revenue or salary savings:
`weekly_hours_released = customer_weekly_volume * measured_minutes_reduced_per_item / 60`.
Include staff QA, systems fees, security and rollback in pilot economics. Count only confirmed paid revenue.

## Revenue blockers
- **Payment:** Whop API key, company ID, webhook signing secret, payout identity and real settlement test not configured/verified.
- **Branded website:** canonical TaskForge domain currently runs an older Cloudflare Direct Upload; B2B assets are on a stable Cloudflare preview. Do not advertise the preview as the canonical homepage.
- **Sales:** zero verified qualified B2B leads and zero paid B2B pilots.
- **Real connectivity:** no customer-specific CRM, mail or ERP authorization yet. Only approve those integrations after agreement and access verification.

## Immediate operator success signal
A genuine B2B assessment from an authorized buyer, followed by an accepted written pilot scope. Avoid interpreting page visits, test submissions or hypothetical ROI as a sale.
