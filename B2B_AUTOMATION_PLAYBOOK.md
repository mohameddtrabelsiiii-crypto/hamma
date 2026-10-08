# TaskForge AI — B2B Automation Sales & Delivery Playbook
Updated 2026-10-08. This is a **go-to-market and pilot design**, not a claim that customer integrations are already live.

## Positioning
TaskForge helps operational teams reduce repetitive manual handoffs using controlled automation, structured data, AI-assisted triage and review gates. A measurable pilot comes before any promised production rollout.

**Customer segment:** growing service providers, distributors, logistics operators and small-to-mid-sized online businesses that use email, spreadsheets and basic CRM/ERP tools, with repetitive intake work.

## First three offers
| Pilot | Buyer | Workflow | Measurable outcome | Safeguard |
|---|---|---|---|---|
| Lead qualification & CRM routing | Head of sales, operations manager, agency founder | Collect inbound inquiries → normalize fields → classify intent → queue the right person → approved CRM write | Minutes spent per lead, assignment speed, missing-field rate | No unauthorised outreach; human sign-off on lead status or sensitive messages |
| Invoice/PO intake & exception review | Finance operations, purchasing and distributors | Extract approved fields from non-sensitive sample invoices/POs → detect mismatches and missing data → review queue → optional ERP write after approval | Minutes per document, exception rate, field accuracy | Never invent missing invoice data or approve payments; no bank/payment credentials in intake |
| Support inbox triage | Customer operations, ecommerce support | Categorize ticket → flag priority → propose draft response → human-approved handoff | Time-to-first-triage, classification accuracy, backlog | No automated refunds, contractual commitments or high-impact decisions |

**First implementation priority:** inbound lead qualification and CRM routing, because its scope is easier to test against synthetic or properly authorized sample messages before handling sensitive finance data.

## Qualification rules
The live form is at `https://taskforge-ai.pages.dev/automation`; submissions use `POST /api/lead` and the existing Supabase `leads` table. Treat all submissions as inquiries **only**.

A qualified opportunity identifies:
1. A real business contact, company, workflow owner and existing tools.
2. A repeated problem with a baseline volume, such as emails per week or minutes per item.
3. Desired action and any requirement for human review, approvals, audit logs or data residency.
4. A budget **range supplied by the buyer**, not an invented price.
5. Permission to handle only the information necessary for feasibility assessment.

Avoid collecting passwords, API keys, identifiable third-party client records, protected health data, bank records or other confidential raw documents in the public lead form.

## Operating lead triage (implemented in Supabase)
- The database migration `supabase/migrations/20261008013900_b2b_lead_qualification.sql` runs an INSERT trigger when `source='website-b2b-automation'`.
- It stores `workflow_category` (sales/CRM, invoices/PO, support inbox, other), `qualification_score` (0–100), `review_priority`, `triage_state='awaiting_human_review'`, and `review_due_at`.
- The score measures **completeness of the self-reported brief**, not likelihood of purchase, legitimacy, lead value, accuracy or creditworthiness. Higher-scoring inquiries are placed earlier in the review queue. No messages are sent, customer systems accessed or payments initiated.
- Internal review queue SQL: `ops/b2b-review-queue.sql` (authorized Supabase operator only). Never publish the output, which includes submitted names, companies and contact details.
- The migration was tested with high/low informational sample transactions and **ROLLBACK**. No test leads were retained. Existing RLS access stayed unchanged.
- A separate public, browser-only routing demonstration is at `https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/demo`. It uses fictional text and deterministic keyword rules; it is not an AI model or live customer integration.

## Proposal outline
- **Discovery:** map the as-is workflow and integration permissions.
- **Pilot scope:** one trigger, a few transformations, one destination and a manual exception queue.
- **Acceptance tests:** agreed representative sample, error-handling, security boundary, success metric and rollback method.
- **Commercial terms:** quote after feasibility review; define milestones, change controls, ownership of integrations and support.
- **Scale decision:** proceed only on evidence from the pilot. No guaranteed ROI or untested fully autonomous outcomes.

## ROI calculation (illustrative; verify customer data)
`weekly_hours_saved = validated_weekly_volume * measured_minutes_saved_per_item / 60`.
`monthly_labor_capacity_hours = weekly_hours_saved * 4.33`.
This measures capacity released, **not** automatic cash savings. Always disclose error review and ongoing subscription/support costs.

## First sellable proof: LeadOps CSV pilot (2026-10-08)
- Demo: **https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/leadops**.
- Tested implementation: accepts CSV with a text inquiry column (maximum 2 MB, 2,000 data rows, 40 columns), suggests rules-based queue assignments, flags potential duplicate contacts or incomplete requests, and exports all rows as a quoted CSV for human review.
- CSV exports protect leading formula-like spreadsheet values; no browser network requests are permitted by the page's `connect-src 'none'` policy. No client files go to our backend.
- Unit tests validate quoted/newline CSV fields, malformed content rejection, duplicate flags, routing cases, and CSV formula protection. Production preview external HTTPS smoke tests verify the public page and guarded route.
- This is **not generative AI and not a customer integration**; sell the *outcome* (fewer manual routing steps), then build integrations only with written scope, customer authorization and measured acceptance tests.
- A first-revenue offer, qualification and personalized outreach plan lives at `sales/leadops-first-revenue-sprint.md`. Any numeric prices are internal hypotheses, not active public quotations or completed sales.

## Revenue path and guardrails
1. First: prove that genuine business leads arrive and the intake writes only authorized data.
2. Then: deliver one safe, paid, verifiable pilot and obtain permission for a case study.
3. Then: repeat in one niche, improve templates and document support costs.
4. Then: scale to higher-ticket implementations or paid maintenance where an actual client need is confirmed.

Public website checkout remains closed for new automation pilots until real quote, service fulfillment and merchant payment integration are reviewed. Do not reuse the consumer PDF/CSV order checkout as an automatic B2B payment system.

## Honest operating status
- 2026-10-08: B2B preview page and local demo live; external smoke tests pass. Public intake function is ACTIVE and database lead triage is implemented. Branded canonical production remains on a previous release because the B2B production promotion request was blocked by connector security.
- Customer CRM integrations, automation agents, execution workflows and enterprise access control require implementation and customer-specific verification.
- Never manufacture leads, clients, ROI figures, references or successful case studies.

## CRM contact matching — verified free pilot (2026-10-08)
- **Live:** https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/crm-cleanup
- Compare a new contacts CSV to an existing CRM export without uploading files; flag exact email, phone or name-plus-address matches; protect distinct people who share a mailing address; export original records plus review reasons and an exceptions-only CSV.
- The parser bounds two files to 2 MB, 3,000 rows each, 35 columns each, rejects invalid quoted CSV and guards formula-like fields in exports. Browser CSP blocks network connections for this page. Unit tests plus GitHub HTTPS smoke passed.
- Not implemented: validated mailing-address correction, US phone number verification, fuzzy entity resolution, actual client CRM write-back, marketing emails, or real client delivery. These require a funded, scoped job and authorized source data.
- This makes the earlier $100 CRM-import cleanup posting more technically feasible but **does not remove Upwork's 18-Connect application cost**, and no bid was sent. Buyers must approve ambiguous dedupe rules before imports.
