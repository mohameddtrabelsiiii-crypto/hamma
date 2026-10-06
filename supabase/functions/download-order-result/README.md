# Checked CSV result downloads

POST `{ "order_id": "UUID" }` or `{ "reference": "TF-1234ABCD" }` with a customer Supabase access token. The function validates the token with Auth, requires a confirmed email matching the order, and requires delivered status, confirmed payment and result_checked=true. It signs only the order-specific CSV result in the private order-files bucket, for 60 seconds. Customer-supplied output paths are never accepted.

The Next.js account screen calls this endpoint. The Cloudflare intake page also offers account creation and sign-in/download by TF reference. It keeps access tokens only in request-local memory, clears the password field, and does not expose refresh tokens. Operator review and delivered status are still required; this endpoint does not approve or deliver unchecked work. Signed URLs remain usable until expiry even after a refund.

Tests use mocked Auth, database and storage responses. Real customer download verification remains pending a genuinely paid, reviewed order. No real payments or delivery have been simulated in production.
