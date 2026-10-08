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

## Customer status tracking — built and backend deployed (2026-10-08)
- `order-status` Supabase Edge Function is ACTIVE with gateway JWT verification enabled.
- Authenticated, email-confirmed customers can check their own TF reference without exposing other customers' projects, files or payment identifiers.
- The response distinguishes quote review, priced-but-unpaid, payment recorded, processing, quality review, checked delivery, and rejection. A downloadable state requires payment confirmation and checked results.
- Source: `supabase/functions/order-status/`; tests run with `node --test supabase/functions/order-status/*.test.mjs`.
- The homepage's **Check project status** button and service-specific landing page links are coded in `worker.js`. The GitHub build passes, but this Worker change is **NOT live**: Cloudflare Pages still uses the earlier Direct Upload deployment. A Cloudflare deployment request in this session was blocked by tooling, so no claim of a website rollout is made.
- Do not send new status-link announcements to customers until the latest Worker is successfully deployed and the live authenticated flow has been exercised.

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
- Until then, deploy future Pages changes directly; a GitHub push alone does not update the Pages site.

## Current service catalog
- PDF to Excel
- Spreadsheet cleanup
- Company list (verified-result workflow)
- CV writing (verified-result workflow)

## Operating boundary
Cavalry can build, deploy, validate and optimize infrastructure autonomously. It must not fabricate customers, payments or results, bypass verification, or spend money without authorization.
