# Shopify automotive feed and data optimization — proposal draft

Verified job: https://www.upwork.com/jobs/~022109209298583973720
Date checked: 2026-10-12
Status: ACTIVE; 0 hires; requires 16 Connects; Upwork account has 0; **NOT SUBMITTED**.
Type: hourly, expert-level, no advertised rate. Buyer has ~10,000 truck-cover/accessory SKUs, Spark Shipping (Keystone, Meyer), ACES/PIES data, ConverMax search, and Google Merchant Center feed.

## On-platform pitch (DRAFT ONLY)

Hello,

For a 10,000-product truck accessories catalog, I would start with a controlled product-data audit rather than overwrite live Shopify listings. The core problem is preserving accurate manufacturer-part and vehicle-fitment information while continuing the distributor price/stock sync.

I propose a small, reviewable Phase 1 pilot:

1. Map representative Spark Shipping exports and authorized manufacturer ACES/PIES source fields to Shopify product, variant, part number, and fitment attributes. Preserve the original source files and source IDs.
2. Produce an exception report covering conflicting brand/part numbers, missing UPCs/specs, duplicate products, malformed fitment or bed-length restrictions, and unresolved vendor SKU mappings. Flag uncertain matches for human approval; never invent fitment.
3. Test a carefully scoped sample in staging, including the relationship between a parent product, size-specific variants, vendor SKUs, the ConverMax vehicle search, and the Google Shopping feed.
4. Deliver a before/after diff, deterministic validation checks, a rollback procedure, and short refresh instructions before approving any bulk catalog changes.

My strongest evidence is in reproducible CSV/API data validation, deduplication, exception reports and logistics/inventory operations, using internally built TaskForge AI prototypes. I would not misrepresent these as previous client-delivered Shopify automotive fitment deployments. Given the consequences of an incorrect fitment, a sample review and access to the official schema are essential before proposing a full-catalog rollout.

Would you be open to agreeing on a small, reviewable pilot scope and its acceptance criteria before any production changes?

Best regards,
TaskForge AI
https://taskforge-ai.pages.dev/
https://github.com/mohameddtrabelsiiii-crypto/hamma

## Qualification checklist (internal)

- Confirm authorized manufacturer and distributor data access, permitted API exports, and use rights.
- Confirm source of truth and authoritative join key (brand + manufacturer part number + vendor SKU crosswalk).
- Confirm ACES/PIES version, fitment coverage and bed-length/trim constraints.
- Verify Shopify variant limits and ConverMax import expectations in the specific store setup; do not assume default behavior.
- Define negative fitment test cases, review owner, rollback, rate limits and Google feed QA.
- Agree separate pricing for pilot vs full rollout, no invented budget or delivery guarantee.
- Do not share source code or private client datasets without agreed contract.

**Platform boundary:** Application costs 16 Connects, balance 0; no off-platform Upwork buyer contact or spending to bypass eligibility. Submission requires available Connects and platform-required user confirmations.