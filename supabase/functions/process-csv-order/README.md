# CSV processing checkpoint — 2026-10-06

`process-csv-order` is a server-only Supabase Edge Function. POST JSON `{ "order_id": "UUID" }` using the project's service-role bearer token from a trusted server only. Never put that token in a browser, repository, or customer message. Both gateway JWT validation and exact server-key comparison are enabled.

Only `spreadsheet-cleanup` orders with status `paid`, a payment confirmation timestamp, and a CSV file are eligible. An atomic status update claims the order; concurrent/repeated requests cannot process the same paid state twice. No payment flags are created or altered by this function.

The processor handles UTF-8 comma-delimited files up to 2 MB, trims surrounding whitespace, removes fully blank rows, preserves numeric strings and duplicate rows, normalizes quoting/newlines, and rejects ambiguous columns/quotes. Formula-like values are flagged and remain private pending review. Output is written under `results/` in the existing private `order-files` bucket; the original upload is preserved. Output location and QA counts are recorded in `orders.result_text` as JSON. Completion moves the order to `needs_review`, never `delivered`, with `result_checked=false`.

Errors also hold claimed orders for review. If a database outage prevents this update, the order may remain `processing` and requires operator recovery. An uploaded result may remain private but unreferenced if the final database update fails. No automatic retry or external notification is configured.

Tests: `node --test processor.test.mjs`. Tests exercise data preservation, malformed input, payment/auth gates, state transitions and replay with mocked Supabase HTTP responses. Deployment is separately checked for rejection of anonymous requests. A real paid-order end-to-end run remains pending Whop credentials. This function is deployed but not automatically invoked by the webhook yet; broader PDF/XLSX processing, customer download authorization and delivery notifications remain unfinished.
