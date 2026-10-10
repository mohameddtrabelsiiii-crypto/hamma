# Med Art — Fourthwall Product QA (2026-10-10)
Source: live authenticated Fourthwall MCP `ecommerce_get-offers`, `ecommerce_get-collections`, `ecommerce_get-current-shop`, `ecommerce_get-payout-info`, `ecommerce_get-current-subscription`, `ecommerce_get-shipping-flat-rates`, `ecommerce_get-shipping-profiles`, `ecommerce_get-customization-pricing` and inspected official Fourthwall CDN product mockups.

## Verified storefront controls

- Shop status: **COMING_SOON**; lastLiveAt: null.
- Payout status: **INACTIVE**.
- Subscription: **Free, ACTIVE**, 3 offers currently used of 50 permitted; no paid plan activated.
- Exactly 3 standard POD offers, all **HIDDEN, available=false**, all `fulfilledBy: FOURTHWALL`.
- Collection `Original Abstract Art Gifts` **HIDDEN**, `available=false`, contains all 3 offers.
- Store currency: USD. Other enabled display currencies do not establish payout eligibility or net margin.
- Custom shipping flat-rate setting: `enabled=false`. Custom shipping profiles setting: `enabled=false`. This **does not mean customer delivery costs are zero**; checkout shipping must be verified by country.
- Fourthwall customization-pricing tool returned a cost structure and variant sizes, but **no numeric amount in its text result**. Thus product cost and net profit are **not yet verified**. Avoid fabricating margins.

## Official mockup review

| Product | Current sell price | Variants | Visual findings | Quality gate |
|---|---:|---|---|---|
| [Orbit Notes – Minimal Art Sticker](https://cdn.fourthwall.com/customizations/sh_1caaeeee-39eb-402a-a09f-d59bc96158d5/b748d493-092b-4e59-84f7-a86901003412.webp) | $6.29 | 1; white 3×3 in | Concentric illustration is clear, text appears legible in the high-resolution preview, centered with even border | Verify real die-cut outline, small-format detail, country shipping economics and refund terms |
| [Night Geometry – Original Abstract Art Mug](https://cdn.fourthwall.com/customizations/sh_1caaeeee-39eb-402a-a09f-d59bc96158d5/c7866565-2cc5-4e96-b369-2e3c950546c9.webp) | $16.95 | 1; white 11 oz | Legible paired geometric panels, but a little busy/repeated for the full wrap; small tagline may not reproduce sharply | Inspect full mug wrap placement and sample/print specs; no purchase without budget authorization |
| [Contour Flow – Original Abstract Art Tee](https://cdn.fourthwall.com/customizations/sh_1caaeeee-39eb-402a-a09f-d59bc96158d5/843d287c-1db4-4660-96cf-94465d48c66d.webp) | $22.75–$30.75 | 9 sizes, XS–5XL, black | Abstract wavy composition is clear overall, but several navy strokes and small 'MED ART / CONTOUR FLOW' letters have **low contrast** on black fabric | **Needs correction:** brighter lettering/strokes or test a light-colored garment, then inspect native preview and validate color availability before publishing |

None of these previews replace a physical production sample or genuine buyer review.

## What is not yet verified

- Printed result, wash/dishwasher longevity in a physical sample, detailed shipping routes/ETAs, tax handling, complete merchant-borne variable costs or actual profit.
- Stripe Connect onboarding for the genuine Tunisia-resident account holder and Tunisia bank; Fourthwall support says a Stripe flow should exist, but follow-up for its exact eligibility remains outstanding.
- A checkout that can actually accept and settle a paid transaction, and automatic order handling end-to-end.
- Live marketing channels or genuine web traffic and sales.
- Fully reliable 24/7 autonomous AI running in Hermes.

## Safe next actions, ranked

1. **Payout:** wait for Fourthwall support's precise Tunisia bank/residency confirmation; then open official dashboard Stripe onboarding. Never fabricate foreign residence or bank details. Secure owner identification steps cannot be bypassed.
2. **Quality:** update only the black T-shirt design's dark lettering/lines or legitimately select a lighter product color, preserving licensed original artwork and following Fourthwall managed upload flow; do not publish on the first unverified mockup.
3. **Economics:** use dashboard variant base costs and target-country shipping quotes to calculate real gross contribution and identify whether shipping is customer-paid; include platform/payment fees, buyer-paid taxes and expected refunds before setting final prices.
4. **Store policies:** check provider fulfillment/refunds, shipping windows, privacy and support contact, with accurate wording and links.
5. **Checkout:** test using legitimate provider test/preview method without any real purchase or spending, and confirm revenue settlement only after actual verification.
6. **Marketing:** prepare and queue authentic original-art content, but do not claim products are purchasable yet.

**Launch gate remains CLOSED** until payouts active, quality warnings addressed, true margin viable, terms/support correct, and checkout verified. No public store or product visibility changes were made in this QA task.

## Live dashboard earning estimates (additional 2026-10-10 QA)

While logged into the official Fourthwall billing and product editors, these values were read directly from the store. They are **platform-displayed per-sale earnings**, not realized post-refund/tax income.

| Product | Verified displayed price | Fourthwall displayed earnings per sale | Customer shipping |
|---|---:|---:|---|
| Orbit Notes 3×3 in sticker | $6.29 | $4.00 | Customer pays at checkout |
| Night Geometry 11oz mug | $16.95 | $11.00 | Customer pays at checkout |
| Contour Flow base-size tee | $22.75 | $11.00 | Customer pays at checkout |

These figures imply price-minus-displayed-earnings amounts of $2.29, $5.95, and $11.75, respectively, but **do not establish after-tax, after-return, or fully settled net profit**. Larger apparel variants have different prices and require size-specific validation. Actual buyer country shipping, possible processing fees, tax, return loss and payouts still require verification.

### Payout entry-point validation

The official Fourthwall Billing and payouts page shows **$0.00 profit balance** and a **Set up your payouts** button. Clicking it opens Fourthwall's own email confirmation security check before Stripe onboarding. The confirmation was not completed and no identity/bank fields were entered. No bank or payout account was activated. Follow the proper account-owner security process; do not circumvent that check or claim payout readiness. The existing Fourthwall support follow-up asking for specific Tunisia bank/residency eligibility has not received a newer reply at last check.
