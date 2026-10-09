# Med Art — $0-spend product margin stress test

**Draft financial QA, 2026-10-09; not an accounting report, sale forecast, or payout claim.** Fourthwall confirmed three HIDDEN Fourthwall-fulfilled offers; this is a mathematical stress test of their currently observed minimum/base product manufacturing costs, not a real settled transaction. Fees are from Fourthwall's official public documentation, not an individual merchant quote.

## Known starting values

| Product | Retail (selected/base variant) | Observed starting production cost | Difference before fees | Saved variants |
|---|---:|---:|---:|---|
| Orbit Notes sticker | $6.29 | $2.29 | $4.00 | 1 |
| Contour Flow tee | $22.75 | $11.75 | $11.00 | 9 (base variant scenario; higher sizes have higher retail prices) |
| Night Geometry mug | $16.95 | $5.95 | $11.00 | 1 |

The retail and observed manufacturing values were sourced from Med Art's Fourthwall designer/listing checks on 2026-10-09. **Do not assume other tee sizes cost the same**; the tee has nine saved variants and pricing increases for larger sizes. Sticker dimensions and variants must match the product detail before public marketing.

## Checkout total processing fee scenarios

Fourthwall's processing fee is applied to **product + shipping + tax actually paid**. For stress-testing, add a hypothetical $12 combined shipping/tax to the product price, and assume it passes through with **no shipping subsidy or creator-paid duties**. Values below are indicative profit *after the processing fee only*, not after returns, chargebacks, conversions, merchant-specific fees, or taxes paid by seller. Rounded cents. Negative outcomes block product launch.

| Product | Domestic card, no shipping/tax | International card, +$12 checkout | International PayPal, +$12 checkout |
|---|---:|---:|---:|
| Orbit Notes sticker | $3.52 | $2.99 | $2.60 |
| Contour Flow tee | $10.04 | $9.34 | $8.78 |
| Night Geometry mug | $10.21 | $9.57 | $9.07 |

**Formula:** creator contribution = product retail − actual Fourthwall manufacturing cost − transaction-rate × total checkout payment − fixed processing fee − any other seller-paid costs. If shipping/tax costs are not perfectly passed through, adjust for the difference.

## Operational zero-cost gates

- Do not add a debit card, credit card or PayPal as a creator charge source; Fourthwall says orders that would create an uncovered negative balance can be blocked. Avoid coupons, giveaways, paid samples, discounts near production cost, and any offer with an unverified margin.
- No inventory purchases or recurring monthly fee on Fourthwall's free physical POD products. **Transaction fees still apply** to each successful order; a business can still face disputes, refunds and tax/legal obligations. Thus "zero upfront" is different from a legal guarantee of zero business risk.
- Do not assume the payout account is active. Official help says selling is possible while a new shop's **first payout is held**, but the shop's Tunisia-based owner still needs to confirm a lawful withdrawable method (bill.com or eligible Stripe Connect) with Fourthwall Support.
- Before publication, inspect all nine tee variant prices/costs in Fourthwall, final mug/sticker previews, shipping rates to target countries, privacy/contact/return notices, and checkout without submitting a real payment.
- Recompute the worksheet from **actual** current saved variant and checkout fee data rather than using the hypothetical +$12 scenario. If the site can't provide real values, do not label net revenue verified.

## Official source documentation

- https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/transaction-fees
- https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/why-credit-card-is-needed
- https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/country-not-supported-by-stripe
- https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/site-verification-before-first-payout
