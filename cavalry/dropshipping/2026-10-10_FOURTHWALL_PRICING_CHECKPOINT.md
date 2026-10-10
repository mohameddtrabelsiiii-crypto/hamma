# Med Art — Fourthwall pricing readiness (10 October 2026, UTC)

**Purpose:** distinguish verified catalog *starting* fees from our specific actual variants and provide honest next pricing action. Not a launch approval or profit report.

## Verified source documentation

- [Fourthwall current plans and catalog pricing](https://fourthwall.com/pricing) — Free store tier, catalog flat production cost taken from product selling price, no requirement to purchase bulk inventory. Exact fulfillment charges depend on configured catalog item.
- [Fourthwall transaction fees, updated 24 March 2026](https://fourthwallcreator.zendesk.com/hc/en-us/articles/13331335648283-Transaction-Fees) — domestic card **2.9% + $0.30**, international card **3.9% + $0.30**, domestic PayPal **3.49% + $0.49**, international PayPal **4.99% + $0.49**. Calculated against the total checkout payment including shipping and tax, less checkout discounts. For accurate SKU quotes: open **product → Selling price → Learn more → Manufacturing costs**, then select **Include estimated payment processing fees**.
- [Fourthwall Allcolor 5493 Kiss Cut Stickers](https://fourthwall.com/products/kiss-cut-stickers-1) — starting catalog cost **$2.29**; formats include 3×3, 4×4 and 5.5×5.5 inch. Exact price for Med Art's selected 3×3 variant is NOT authenticated. Shipping from US/EU/Canada/UK/Japan/Australia. Public reviews include some concerns about cut lines and quality; design alpha/cut-line QA is material.
- [Fourthwall Mugz WGM78 White Glossy Mug](https://fourthwall.com/products/white-glossy-mug-sublimation) — starting **$5.95**, variants 11, 15 and 20 oz. Our Med Art mug is 11 oz but exact backoffice manufacturing fee is UNKNOWN. Reviews report occasional placement and color issues.
- [Fourthwall catalog](https://fourthwall.com/pricing) — Bella+Canvas 3001 supersoft tee starting **$11.75**. Multiple saved garment colors/sizes may differ; price for every active Med Art tee variant remains UNKNOWN.

## Pure arithmetic illustration — NOT a real margin

| Existing item | Last saved retail USD | Public FROM manufacturing USD | Simplified difference after domestic card fee USD | Real profit verified? |
|---|---:|---:|---:|---|
| Orbit Notes, sticker | $6.29 | $2.29 | $3.52 | **NO** |
| Night Geometry, mug | $16.95 | $5.95 | $10.21 | **NO** |
| Contour Flow, starting tee | $22.75 | $11.75 | $10.04 | **NO** |
| Arc Study 01, original art | not set | not verified | **UNKNOWN** | **NO — not listed** |

**Very restrictive illustration assumptions:** price is the old saved retail quote, actual SKU production cost happens to equal the published *minimum* catalog cost, one domestic credit-card order, **zero** shipping/taxes/returns/merchant-funded promotions/FX, no processing on separately charged shipping/tax, and no print or payout exceptions. None of those assumptions are validated for real orders. These figures are **NOT payout estimates, net profit, or guaranteed maximum returns**; actual real economics can be substantially worse. The payment fee uses only product price in this simplified illustration although Fourthwall correctly processes the entire checkout total. For example, shipping or tax on an order will cause the transaction fee to rise.

## Reusable financial engine

- [fourthwall-margin.mjs](./fourthwall-margin.mjs) — self-contained currency-consistent contribution model requiring **all** production, shipping, fee, tax, marketing and reserve inputs before outputting even an ESTIMATE; unknown values return **NEEDS_VERIFICATION**, never positive profit. Includes zero-upfront supplier cash-flow gate and a permanent readyForLaunch=false flag until payout and platform checks are completed.
- [fourthwall-margin.test.mjs](./fourthwall-margin.test.mjs) — Node assertion tests for tax/shipping-inclusive payment processing, absent costs, unaffordable supplier prepayments, impossible discounts, and whether public catalog floors are being mislabeled as profit.
- Local equivalent model was executed with Node 22 and all financial/safety assertions passed. The GitHub source and tests were committed; they require their own post-commit CI run for completely independent verification.

## What blocks a genuinely priceable product?

1. **SKU-specific manufacturer fees**, separately for Orbit Notes exact 3×3, Night Geometry 11oz, and each relevant Contour Flow garment color and size. Read actual authenticated product editor, NOT a public catalog headline.
2. **Target-region shipping**, customer-paid shipping, taxes, product returns / reprints and contribution estimates under domestic-card, international-card and PayPal scenarios.
3. **Live payout eligibility:** Fourthwall Support's general statement about Tunisia/Stripe must be substantiated for lawful Tunisia residency and a genuine Tunisian bank. Shop payout still last verified INACTIVE. Only the user completes provider OTP, identity, tax and bank steps privately.
4. **Arc Study** is original art only; check actual blank print-area/cutline, crop, naming/rights and production costs before creating a uniquely HIDDEN listing. There is no valid published price yet.
5. Shopify trial inventory remains three 0-TND DRAFT placeholder products with no verified third-party supplier, so no Shopify launch, free-product mistake or recurring subscription.

**Priority:** Validate the current mug and sticker first because they require fewer size variations than the tee; compare actual after-fee contribution and customer-visible shipping for US and EU, then choose one organic no-cost marketing test when eligible. Nothing was published, sold, purchased or financially settled in this checkpoint.
