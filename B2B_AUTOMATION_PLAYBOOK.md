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

## Revenue path and guardrails
1. First: prove that genuine business leads arrive and the intake writes only authorized data.
2. Then: deliver one safe, paid, verifiable pilot and obtain permission for a case study.
3. Then: repeat in one niche, improve templates and document support costs.
4. Then: scale to higher-ticket implementations or paid maintenance where an actual client need is confirmed.

Public website checkout remains closed for new automation pilots until real quote, service fulfillment and merchant payment integration are reviewed. Do not reuse the consumer PDF/CSV order checkout as an automatic B2B payment system.

## Honest operating status
- 2026-10-08: marketing and qualification funnel built in source; production release to be verified separately.
- Customer CRM integrations, automation agents, execution workflows and enterprise access control require implementation and customer-specific verification.
- Never manufacture leads, clients, ROI figures, references or successful case studies.
