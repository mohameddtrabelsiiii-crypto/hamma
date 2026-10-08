# TaskForge AI
AI-powered digital operations services. Zero-cost launch architecture using Cloudflare Workers + Supabase.

## Cavalry operating objective
Acquire legitimate customer requests, qualify them, price fixed-scope work, deliver verified outputs, and iterate without inventing facts or bypassing platform rules.

## Live launch
- Public website: https://taskforge-ai.pages.dev
- Cloudflare Pages direct-upload deployment is live; GitHub-to-Pages auto-deploy is not yet connected because the Cloudflare GitHub installation needs repair.
- Lead intake: Cloudflare Worker -> Supabase Edge Function -> public.leads
- Database: Supabase with RLS enabled on operational tables.
- No paid infrastructure was added.

## Customer tracking — public fallback deployed and HTTPS-verified (2026-10-08)
- Updated intake, customer sign-in, protected order tracking, service landing pages, checkout and download interfaces are deployed to the free Supabase Edge Runtime at **https://epkhqmhhzwlbxxypywau.supabase.co/functions/v1/taskforge-public**.
- Source of truth: `worker.js`. Reproducible build: `node scripts/build-supabase-portal.mjs` -> `dist/taskforge-public/index.mjs`; deployment: Supabase Edge Function `taskforge-public`, `verify_jwt=false` for the public HTML and guarded router only.
- The private `order-status` function has `verify_jwt=true` and checks the JWT, verified customer email and matching order ownership before returning minimal status fields.
- Live public smoke tests are at `.github/workflows/portal-smoke.yml`. GitHub-hosted external HTTPS requests successfully checked the homepage, spreadsheet service landing page, anonymous status refusal, invalid order refusal and anonymous checkout refusal.
- The primary **https://taskforge-ai.pages.dev/** is live on Cloudflare Pages. The previous customer-tracking release `0b86f5c5-faf5-47f9-bf35-545dc3022179` passed hosted HTTPS smoke checks, including anonymous refusal for private tracking and downloads; see the B2B production update below for the newer release. Those historical checks are not a substitute for paid-order settlement.
- GitHub Actions continuous automatic Direct Upload is **still gated**: `.github/workflows/pages-deploy.yml` skips the upload unless a scoped `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` repository variable are configured. A green skipped job is not a deployment. This does **not** prevent verified releases through the authenticated Cloudflare connection.
- The Cloudflare Pages project cannot be switched from Direct Upload to Git. Creating a separate Git-connected project failed with error `8000011` (Cloudflare Git app installation); a corrected Git app installation or explicit deployment credentials are still required for continuous branded-domain sync.
- A public smoke test is not a real paid-order test: verified account login, webhook settlement, real fulfillment and withdrawal remain unproven.

## B2B workflow automation growth track (2026-10-08)
- Three scoped **assessment/pilot offers**: lead intake & CRM routing, invoice/PO intake with exception review, and support inbox triage with human approvals.
- Public **preview**: https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation. Its homepage links to the assessment, and the `/api/lead` proxy validates data and restricts origins. GitHub-hosted external HTTPS checks for the preview passed; see `.github/workflows/b2b-smoke.yml`.
- Actual business inquiry capture uses the updated **ACTIVE** Supabase Edge Function `capture-lead` version 2 and the existing private RLS-protected `leads` table. The function bounds inputs, validates emails and budget categories, strips unrecognized data and refuses errors without leaking database details. No fake leads were created to test successful writes.
- New: B2B leads are categorized and scored **in the database** by the migration `supabase/migrations/20261008013900_b2b_lead_qualification.sql`. The score measures completeness, not legitimacy or readiness to buy. It sets a human-review priority and review target date; no outbound contact, payment or CRM mutation occurs.
- Two rolled-back database transaction tests verified appropriate high/low-priority triage and ignored customer-supplied status overrides. After rollback, the production leads table still contained **0 records**.
- A **working, fictional-sample routing demo** is deployed to `https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/demo` and runs only in the visitor's browser. Its category suggestions come from explicit rules, not an AI provider. The stable preview HTTPS smoke workflow checks this demo and the lead-submission rejection guards.
- Operator-only, read-only SQL at `ops/b2b-review-queue.sql` provides a ranked review queue and anonymized workload summary; it is not a public customer portal.
- Operational CSV intake pilot released and tested on the stable preview: **https://taskforge-b2b-preview.taskforge-ai.pages.dev/automation/leadops**. Upload up to 2 MB/2,000 rows, suggest routing, flag duplicates and review exceptions, export safely quoted CSV without a backend upload. The tool is deterministic rules, not generative AI, and makes no CRM writes or outreach.
- Live HTTPS checks: `.github/workflows/b2b-smoke.yml`. Core parser, routing, review and export safety tests: `worker.test.mjs`.
- First paying-customer qualification, internal price assumptions and tailored prospecting plan are recorded in `sales/leadops-first-revenue-sprint.md`; prices are **not** approved public quotes.
- Go-to-market and delivery acceptance criteria are documented in `B2B_AUTOMATION_PLAYBOOK.md`.
- **Production update (2026-10-08):** The tested B2B landing, routing demonstration and LeadOps browser-only CSV pilot are now available on the canonical Cloudflare site. The latest CTA enhancement was deployed as production deployment `78897df7-4ee3-4049-9e3c-a5bf17cd7143` for commit `705f68567016a8da1b136bb92380f40d3e4ba816`. The 58-test Node suite, Pages Worker build and Cloudflare deployment status passed. First customer-specific integration, data permissions, CRM writes and a real paid transaction remain **unverified**.
- These are invitations for a paid pilot proposal after feasibility review, **not** finished CRM, accounting or support software and not fixed-price instant checkout products. Confidential source documents, API keys and customer PII must not be submitted through the public assessment form.

## Customer checkout and delivery
- Customers create an account using their project email and confirm that email.
- The account section can open an approved quote's Whop checkout or download an approved result.
- Checkout requires verified order ownership, a positive server-side quote, and `awaiting_payment` status. Browser-supplied prices are ignored.
- Checkout stays closed until `WHOP_COMPANY_API_KEY`, `WHOP_COMPANY_ID`, and `WHOP_WEBHOOK_SECRET` are configured in Supabase.
- Configure Whop's webhook to `https://epkhqmhhzwlbxxypywau.supabase.co/functions/v1/whop-webhook`.
- Current service prices are intentionally unset, so no real checkout can open until a quote is explicitly approved.
- Current quotes use TND. Confirm merchant currency support before approving a real quote; do not silently reinterpret existing amounts in another currency.
- Spreadsheet-cleanup CSV orders are dispatched only after verified Whop payment. Deterministic cleanup results with no formula-like cells and no duplicate rows can auto-deliver; ambiguous files remain in `needs_review`.
- Payment acceptance and settlement still require one genuine merchant end-to-end test after Whop webhook configuration; mocked tests do not prove settlement.
- Run verification with `node --test worker.test.mjs supabase/functions/*/*.test.mjs`.

## Public deployment
- `node scripts/build-pages.mjs` creates `dist/_worker.js` from the same source as the existing Worker.
- Cloudflare Pages `taskforge-ai` currently uses Direct Upload.
- Cloudflare's Git connection API returns installation error `8000011`; repair/reinstall the Cloudflare GitHub app before enabling automatic Git deploys.
- Until automated GitHub credentials are configured, deploy future Pages changes via the authenticated Cloudflare connection after the GitHub build and tests succeed; a GitHub push alone does not update the Pages site. Automated daily verification of the live site continues.

## Current service catalog
- PDF to Excel
- Spreadsheet cleanup
- Company list (verified-result workflow)
- CV writing (verified-result workflow)

## Operating boundary
Cavalry can build, deploy, validate and optimize infrastructure autonomously. It must not fabricate customers, payments or results, bypass verification, or spend money without authorization.
