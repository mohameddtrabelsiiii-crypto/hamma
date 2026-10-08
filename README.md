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
- The primary **https://taskforge-ai.pages.dev/** was updated by a credential-free direct Cloudflare Pages upload on 2026-10-08. The canonical production deployment `0b86f5c5-faf5-47f9-bf35-545dc3022179` succeeded for commit `1953bd398fc982c0c94dc58340cdbbd3e3e67d7b`; GitHub-hosted production HTTPS smoke tests pass including project tracking, checkout and downloads blocking anonymous callers.
- GitHub Actions continuous automatic Direct Upload is **still gated**: `.github/workflows/pages-deploy.yml` skips the upload unless a scoped `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` repository variable are configured. A green skipped job is not a deployment. This does **not** prevent verified releases through the authenticated Cloudflare connection.
- The Cloudflare Pages project cannot be switched from Direct Upload to Git. Creating a separate Git-connected project failed with error `8000011` (Cloudflare Git app installation); a corrected Git app installation or explicit deployment credentials are still required for continuous branded-domain sync.
- A public smoke test is not a real paid-order test: verified account login, webhook settlement, real fulfillment and withdrawal remain unproven.

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
