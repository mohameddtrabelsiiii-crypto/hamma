# Cavalry Shopify channel (prelaunch connector)

This is a second sales channel for Cavalry's existing nine-agent team. It does **not** replace Med Art/Fourthwall or TaskForge/Whop checkout.

## What is implemented
- A zero-dependency Python read-only audit of a connected Shopify store (shop name, canonical domain, and product count).
- Safe prelaunch status file: `cavalry/runtime/latest-shopify-health.json`.
- Fail-closed behavior for absent credentials, invalid domains, API problems or incomplete responses.
- The same Atlas, Muse, Forge, Ledger, Pulse, Beacon, Harbor, Sentinel and Relay roles may use this snapshot for **internal drafts only**.
- Windows runner using the bundled Hermes Python runtime, without purchasing software.

## What is NOT implemented
This is not a Shopify account, active paid store, published product, automated supplier, Hermes model integration, payment integration, or 24/7 cloud deployment. No sales, payouts, genuine paid orders or revenue have been verified. The standalone ChatGPT Shopify plugin must be connected separately and does not automatically authorize the local API runner.

## Secure connection
The account owner must authorize Shopify access and any required merchant/KYC information in Shopify. Never paste tokens into chat, repository, YAML or logs.

Configure these environment variables **on the private host or secret manager only**:
- `SHOPIFY_SHOP_DOMAIN`: e.g. `your-store.myshopify.com` (no scheme, path or port).
- `SHOPIFY_ADMIN_ACCESS_TOKEN`: an authorized token with `read_products` scope.

Run `run_watch.cmd` on Windows or `python shopify_audit.py`; `python -m unittest discover -s cavalry/shopify -p 'test_*.py'` runs the offline tests. The runner is read-only even after credentials are set. A watcher is scheduled only after confirmed account access and consent; the file existing in GitHub does not mean it is running.

## Cavalry gate to safe store operations
1. Authorized account connection and API audit (success status: `connected_read_only`).
2. Shopify plan/trial and operational cost approval within the user's **$0 spending rule**. Shopify is not permanently free.
3. Verified payment gateway, supported country and payouts; do not conflate Fourthwall checkout or TaskForge Whop links with Shopify checkout.
4. Licensed original product assets and a legitimate supplier/fulfillment integration; actual landed cost, processing fee, taxes, freight, returns reserve and nonnegative contribution verified per item.
5. Legal pages, customer support, return/refund process, shipping times and test transactions verified.
6. Separately authorize external writes: product publishing, contacting customers, fulfilling/refunding orders, and spending. Until then, all agents draft only.

Official references: https://shopify.dev/docs/api/admin-graphql/2026-07/queries/productsCount and https://www.shopify.com/pricing

This integration deliberately keeps no customer PII or Shopify tokens in GitHub or runtime audit files.
