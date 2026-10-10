# Cavalry Commerce — Med Art (Fourthwall)

**Purpose:** Autonomous-where-possible, zero-upfront-spend print-on-demand ecommerce operations through Cavalry/Hermes, while respecting merchant verification, platform policy and consumer protection. This directory is an **operational handoff**, not a claim that the shop is live.

**Store re-audited through authenticated Fourthwall MCP on 2026-10-10:**
- Fourthwall store: [Med Art](https://med-art-shop.fourthwall.com) — **COMING_SOON**, not publicly launched.
- Fourthwall OAuth/MCP authenticated on the owner's Windows Hermes installation; discovery confirmed 126 tools. This does **not** authorize publishing, charging, or exporting private credentials from that computer.
- Existing store offers: **three HIDDEN, unavailable-for-purchase POD products**, all fulfilled by Fourthwall: **Night Geometry - Original Abstract Art Mug** ($16.95, white 11oz), **Contour Flow - Original Abstract Art Tee** (black XS–5XL, $22.75–$30.75), and **Orbit Notes - Minimal Art Sticker** (white 3×3 inch, $6.29).
- Existing collection: **Original Abstract Art Gifts** currently **HIDDEN** and correctly linked to all three unavailable-for-purchase products.
- All three products have mockups, descriptions, sizes/colors, and USD variant prices. **Products are drafts**, not ready for buyers. No confirmed unit net margin, real checkout, or fulfilled order.
- Fourthwall's payout account showed **INACTIVE** on the latest authenticated audit. The store cannot be considered financially ready. A Fourthwall support reply stated a Tunisia/Stripe payout flow should be available, but the team requested clarification about true Tunisia-based legal residency and a Tunisia-based bank. **Do not assert eligibility until the merchant onboarding actually succeeds.**
- Local Hermes has a separate **cavalry** profile configured against a no-fee Ollama Qwen 2.5 1.5B model; the model was downloaded, but Hermes end-to-end inference was **not verified as successful**.
- Local Windows scheduled jobs and a separate Cloudflare hourly public-site reachability Worker were previously verified. The Windows PC may be offline or asleep, so local automation is NOT 24/7 when unavailable. The cloud uptime check does not establish product salability.
- **No verified paying customer, payout, profit or fulfilled order.**

## Business model and zero-spend boundary

Fourthwall handles production and fulfillment for its POD catalog and supplies checkout. The merchant does not buy inventory first. Do not use an unrelated Whop checkout as a substitute for Fourthwall order/payments without a verified compliant order-fulfillment integration.

Spending cap: USD 0 in new charges. Do not purchase samples, paid domains, ads, subscriptions, AI APIs or other services without a separate explicit spending authorization. Production base price is not total delivered cost.

Only original/licensed artwork; no copyrighted characters, brand trademarks, invented health claims, fake reviews, artificial scarcity, unsolicited bulk outreach, data scraping behind access controls or false delivery promises.

## Deliverables / ownership

The key local source is `C:\Users\hama\Documents\HermesWorkspace\TaskForge\cavalry\`; it includes `COMMERCE_MASTER_PLAN.md`, `FOURTHWALL_STORE_AUDIT.md`, `dropshipping/assets/`, and the installed `fourthwall-dropshipping` Hermes skill. This public repository intentionally stores **no keys, OAuth tokens, customer data, private bank details, or copies of identity documents.**

See `store-state.json` for machine-readable verified baseline and `growth-sprint.md` for execution-order experiments.

## Next autonomous steps

1. **Re-establish authorized Desktop Commander connection** and obtain a fresh *read-only* Med Art MCP audit. Never infer status from previous outputs.
2. **Check existing offers before writes** so retries cannot create duplicate products. Confirm that the sticker remains nonpublic. Verify the new collection remains hidden.
3. **Completed:** Tee/Mug drafted in Fourthwall through its managed-asset process. **Do not create duplicates.** Next: inspect the three existing product mockups and verify print quality, contrast, sizes, production/shipping timing and per-variant profit.
4. Inspect finished mockups, catalog sizes, base costs, country shipping estimates, refunds, taxes, and actual price math. Prohibit unverified positive-margin claims.
5. **Payout:** follow Fourthwall's secure Stripe Connect instructions using truthful legal and bank information; do not enter merchant identity or bank details into public files or emails. The owner may legally have to complete secure identity verification themselves.
6. Prepare content drafts, original close-ups and truthful SEO descriptions. Schedule/send through authenticated terms-compliant channels only. No spam and no auto-publish until storefront is ready.
7. **Gated launch:** payout active, policies/contact/checkout verified, >=3 complete products, positive conservative contribution, and authorized storefront-publication action. If any gate fails, remain in COMING_SOON and issue an honest blocker report.
8. Review sales/traffic only from authorized, dated data. Never claim a first sale without merchant-side evidence.

## Reliability

- Local Windows scheduler runs only when PC is awake and online.
- Cloudflare Worker check can run when the PC is off; it's public storefront **reachability**, not a full Fourthwall account audit.
- ChatGPT automation may watch project status hourly; do not duplicate alerts or read-only logs as evidence of customer sales.
- Do not use a lightweight local LLM to autonomously execute irreversible financial actions.

## Operating principle

**EXECUTE → VALIDATE → ADAPT → REPEAT**, with evidence and a $0 spend ceiling.