# TaskForge AI
AI-powered digital operations services. Zero-cost launch architecture using Cloudflare Workers + Supabase.

## Cavalry operating objective
Acquire legitimate customer requests, qualify them, price fixed-scope work, deliver verified outputs, and iterate without inventing facts or bypassing platform rules.


## Live launch
- Public Worker: https://taskforge-cavalry.mohameddtrabelsiiii.workers.dev
- Lead intake: Cloudflare Worker -> Supabase Edge Function -> public.leads
- Database: Supabase with RLS enabled on operational tables.
- No paid infrastructure was added.

## Customer checkout and delivery
- Customers create an account using their project email and confirm that email.
- The account section can open an approved quote's Whop checkout or download an approved result.
- Checkout requires verified order ownership, a positive server-side quote, and `awaiting_payment` status. Browser-supplied prices are ignored.
- Checkout stays closed until `WHOP_COMPANY_API_KEY`, `WHOP_COMPANY_ID`, and `WHOP_WEBHOOK_SECRET` are configured in Supabase. Set `APP_URL` to the live homepage when changing the public address.
- Configure Whop's webhook to `https://epkhqmhhzwlbxxypywau.supabase.co/functions/v1/whop-webhook`. Payment verification, processing and delivery still require a real end-to-end test after merchant configuration; mocked tests do not prove payment acceptance or settlement.
- Current quotes use TND. Confirm merchant currency support before approving a real quote; do not silently reinterpret existing amounts in another currency.
- Run verification with `node --test worker.test.mjs supabase/functions/*/*.test.mjs`.

## Current service catalog
- PDF to Excel
- Spreadsheet cleanup
- Company list (verified-result workflow)
- CV writing (verified-result workflow)

## Operating boundary
Cavalry can build, deploy, validate and optimize infrastructure autonomously. It must not fabricate customers, payments or results, bypass verification, or spend money without authorization.
