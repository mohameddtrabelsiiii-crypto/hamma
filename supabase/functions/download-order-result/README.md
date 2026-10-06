# Checked CSV result downloads

POST `{ "order_id": "UUID" }` with a customer Supabase access token. The function validates the token with Auth, requires a confirmed email matching the order, and requires delivered status, confirmed payment and result_checked=true. It signs only the order-specific CSV result in the private order-files bucket, for 60 seconds. Customer-supplied output paths are never accepted.

The Next.js account screen calls this endpoint. The separate live Cloudflare intake page does not yet expose account login/downloads. Operator review and delivered status are still required; this endpoint does not approve or deliver unchecked work. Signed URLs remain usable until expiry even after a refund.

Tests use mocked Auth, database and storage responses. Real customer download verification remains pending a genuinely paid, reviewed order. No real payments or delivery have been simulated in production.
