-- Keep the Whop event ledger inaccessible to anon/authenticated clients.
-- Server-side service_role access bypasses RLS, so no client policy is needed.
drop policy if exists "service role only whop events" on public.whop_events;
