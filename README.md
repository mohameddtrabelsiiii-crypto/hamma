# TaskForge AI
AI-powered digital operations services. Zero-cost launch architecture using Cloudflare Workers + Supabase.

## Cavalry operating objective
Acquire legitimate customer requests, qualify them, price fixed-scope work, deliver verified outputs, and iterate without inventing facts or bypassing platform rules.


## Live launch
- Public Worker: https://taskforge-cavalry.mohameddtrabelsiiii.workers.dev
- Lead intake: Cloudflare Worker -> Supabase Edge Function -> public.leads
- Database: Supabase with RLS enabled on operational tables.
- No paid infrastructure was added.

## Current service catalog
- PDF to Excel
- Spreadsheet cleanup
- Company list (verified-result workflow)
- CV writing (verified-result workflow)

## Operating boundary
Cavalry can build, deploy, validate and optimize infrastructure autonomously. It must not fabricate customers, payments or results, bypass verification, or spend money without authorization.
