-- Applied as orders_server_only_writes. Customer intake uses create-order.
revoke insert, update, delete on table public.orders from public, anon, authenticated;
drop policy if exists "orders owner can insert" on public.orders;
