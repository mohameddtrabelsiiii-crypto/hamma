# MERCURY Offer 001 — RFQ / Supplier Catalogue Exception Review

**Company:** Zenvocloud. **Operator:** MERCURY -> CAVALRY -> FORGE / AEGIS / ATLAS. **Date:** 2026-10-12. **Commercial stage:** tested internal demonstration; not a commissioned customer service, booked order, revenue, or guaranteed demand.

## Buyer problem and outcome
Target independently operating distributors, wholesalers, suppliers and purchasing teams with repetitive CSV-based requests for quotation. Hypothesis: comparing RFQ lines with a supplier catalogue manually risks mismatched SKUs, units or prices. Deliver an auditable **draft of catalogue matches** plus an **exceptions queue** instead of creating a false ready-to-send quote.

**Working demonstration:** `sales/rfq-catalogue-proof/` and public explanation `https://taskforge-ai.pages.dev/services/rfq-catalogue-check`. The offline JavaScript engine passed **15/15** actual Node tests on the authorized PC on 2026-10-12. It is a code demonstration; do not call it a production CRM/ERP integration.

## Starting pilot (scope must be mutually agreed)
- Inputs: one CSV RFQ and one approved CSV catalogue, each **maximum 1 MB / 2,000 data rows**; standardized headers defined in the demo README.
- Matching: exact approved SKU only; no unapproved fuzzy matching, substitutions, tax, discounts or currency/unit conversion.
- Outputs: `quote-draft.csv` (matched approved catalogue entries) and `quote-review.csv` (unknowns, missing/conflicting entries and unit/price errors). Do not issue a finalized customer-facing quote when exceptions remain.
- Includes one jointly agreed exception-resolution pass after clarification; test using non-sensitive/redacted or synthetic inputs first.
- Price hypothesis **$349–$749** depending row count, complexity, manual clarification and QA hours; **not an automatic checkout price**. Proceed only after actual client scoping and payment eligibility check.
- Timelines are agreed individually after preview of an anonymized sample. Never promise a fixed 24h turnaround for unassessed datasets.
- Potential extension only after accepted pilot: controlled export workflow, downloadable approved template, recurring data-quality check. No full integration at pilot rate.

## Source-backed evidence and limitations
- 15/15 Node tests passed locally on 2026-10-12. Tests cover exact approved prices, duplicate SKU/quote lines, unit/quantity problems, missing/invalid prices, mixed currencies, CSV quoting and formula injection.
- Five intended production routes returned HTTP 200 via TLS-validating Windows curl in prior MERCURY check. This does not prove traffic, leads or a usable checkout.
- Supabase public tables read on 2026-10-12: **zero leads**, **zero Whop event rows**, **one rejected/unpaid order**. No collected revenue verified.
- Public seller listings for general CSV cleanup show low advertised pricing; they are **competitor advertisements, not buyer briefs or proof of market demand**. Examples: https://www.reddit.com/r/BigDataJobs/comments/1x3ysg8/ and https://www.reddit.com/r/BigDataJobs/comments/1wtajk7/. Differentiation is clear procurement exceptions and source-preserving auditability, not generic spreadsheet formatting.
- Contra publicly describes free contractor accounts/proposals/payment setup: https://contra.com/commission-free ; however payout eligibility for the operator and available live opportunities must be checked before offering payment there. No profile or bid was created by this document.

## Lead qualification
A legitimate candidate is a buyer with a current RFQ/reconciliation issue, permission to share a redacted CSV sample, sufficient stated business budget, and a permitted way to contact/apply. Record the exact source/date and what was actually said; public seller ads are not leads. Ask only for estimated rows, column headings, target output, number of currencies/units, expected exceptions, turnaround expectation and applicable data sensitivity. Do not request passwords, card data or unredacted customer records.

## Preferred zero-spend acquisition order
1. Make current verified demo easy to discover through the **existing owned** B2B/service/contact pages; check that the inquiry form actually stores entries, confirms delivery and notifies. Do not manufacture new entries.
2. Respond only to explicit, authentic funded buyer requests through the buyer's permitted platform and within its automation rules. No outside-platform contact to bypass Upwork fees/rules.
3. Establish an honest free freelancer listing or portfolio profile on an eligible channel only when actual account permissions are available and provider identity/payout checks are satisfied. No paid Connects or subscriptions.
4. Outreach to known warm B2B contacts only if genuine prior correspondence permits it; protect opt-outs and the two-new-cold-emails/rolling-day cap across all workers.

## Draft *not yet sent* for authentic buyer conversations
> We can check a CSV request for quotation against an approved supplier catalogue and return two auditable files: matched draft line items and a separate list of missing SKUs, mismatched units, duplicates or unclear prices. We will not invent prices or finalize a quote while exceptions remain. If useful, share only a redacted sample with column headers and approximate row counts; we'll confirm fit, scope and a fixed proposal before processing your real data.

## Internal deliverable to CAVALRY (first execution order)
Owner CAVALRY/FORGE. Inspect `sales/rfq-catalogue-proof/README.md`, source, tests and the public service page. Verify 15/15 regression tests again after any proposed code change; build a *small safe fictional walkthrough* showing where matched rows and exceptions go. PULSE verifies clear CTA and a staging-only synthetic lead end-to-end test, then deletes it. AEGIS checks formula-injection, sample licensing, safe uploads and no leaked PII. ATLAS checks quote economics and confirms zero payments unless externally verified. Never modify merchant gates or send outreach for this task.

## Acceptance evidence
- Real run logs and test exit status.
- One public truthful offer reachable in existing service route, correct contact CTA, and lead-intake test with cleanup.
- One **real**, not imaginary, permitted buyer opportunity recorded with source, budget clue and a legal reply path; otherwise clearly report zero.
- Merchant/contract signing only after payment/provider eligibility and authority verified.
