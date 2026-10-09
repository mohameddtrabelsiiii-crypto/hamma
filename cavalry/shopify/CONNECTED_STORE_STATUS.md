# Shopify Med Art — authenticated launch checkpoint

Checked 2026-10-09 via the connected Shopify plugin. This is an actual merchant configuration checkpoint, **not** a claim that a Shopify business is trading or fully autonomous.

| Fact | Verified status |
| --- | --- |
| Store | `bthrzf-rr.myshopify.com` |
| Current display name | My Store (Med Art is a proposed brand/channel) |
| Registered shop country / currency | Tunisia / TND |
| Shopify plan | trial; subscription required before selling |
| Products | 3 created as **DRAFT**: Contour Flow Tee, Night Geometry Mug, Orbit Notes Sticker |
| Product variants | All currently show default price of **0 TND**; unpriced concepts, never publish with this default |
| Collection | Original Abstract Art Gifts, smart/tag-based, created |
| Orders at checkpoint | 0 |
| Payments and payouts | Not verified; store not production ready |
| Shopify Collective sourcing | Unavailable for the connected store country/currency; do not retry |
| Preferred category | Original abstract-art print-on-demand (POD) |

The existing Cavalry Commerce Watch has been updated to review both Fourthwall and Shopify hourly through authorized tools. Its task configuration does not prove a real AI sales staff or order fulfillment. GitHub Actions connector safety tests passed on 2026-10-09 in run https://github.com/mohameddtrabelsiiii-crypto/hamma/actions/runs/37954810649.

## Next operational gates

1. Use only **original or properly licensed artwork** and manufacturer-specific print files.
2. Choose and authorize a legitimate POD fulfillment provider from Shopify Admin; `Printful` is a candidate but not yet installed. Order fulfillment costs may be charged before store payouts arrive, so *no up-front cash* is not guaranteed in a POD cash-flow cycle.
3. Verify actual per-unit provider cost, shipping destinations, payment fees, Shopify transaction fees, taxes and returns, and strictly positive contribution per SKU.
4. Determine Shopify-supported third-party payment gateway eligibility for a Tunisia-registered store, merchant KYC and settlement bank account. Shopify Payments is not available in all countries. The TaskForge Whop checkout and Fourthwall checkout are separate systems.
5. Confirm shipping, refund, privacy and support pages, checkout and fulfillment tests, then decide on any Shopify subscription charge. Zero spending authority remains.
6. Only after meeting these gates change product status or activate paid transaction flows. No sale or revenue claim before verified Shopify orders/settlement.

The `cavalry/shopify/shopify_audit.py` local standalone watchdog still needs separate explicitly scoped Shopify credentials supplied privately to its host. Connecting the Shopify ChatGPT app alone **does not supply** this local Python monitor with any token. Existing official ChatGPT Shopify connector checks and the hourly watch are separate from the PC runner.

This file intentionally contains no API access token, personal email or buyer information.
