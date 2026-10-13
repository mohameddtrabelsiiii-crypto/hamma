# Cavalry Med Art — Launch-gate evidence and product QA
Checked: 2026-10-13 10:08 UTC (official Fourthwall OAuth read-only tools on DESKTOP-ADP8R8D)
Scope: Med Art / Fourthwall, not TaskForge services or ANGELS.co.
Business mandate: zero spend, original/licensed designs, no launch until payout, safety, unit economics, policies and checkout verified.

## Sources and confidence
- **Current authenticated** read-only Fourthwall requests: `ecommerce_get-current-shop`, `ecommerce_get-payout-info`, `ecommerce_get-offers`. Completed without errors at 2026-10-13T10:08:12Z. Response filters excluded private account details.
- **Current** shop: Med Art, USD, COMING_SOON. Payout: INACTIVE. **Three total offers**, all HIDDEN, `available=false`, fulfilledBy FOURTHWALL. No offers published. Current fetch did not validate prices.
- **Historical** October 10 authenticated SKU pricing and preliminary earnings: `cavalry/commerce/store-state.json`. Values must be reconfirmed against provider dashboard before live launch. Fourthwall-displayed earnings are NOT verified net proceeds.
- **Current** Cavalry internal `run_team.cmd`: 9 roles, audit ok, 6 gates blocked, live false; exit code 0 on 2026-10-13. This queues internal tasks only.

## Product-by-product release sheet (no duplicate product creation)
| Product | October 10 price snapshot | Verified current read-only status | Specific blockers |
|---|---:|---|---|
| Night Geometry original art mug | $16.95; platform displayed earnings $11 | HIDDEN, available=false | Inspect actual on-product print orientation and color, source art rights, shipping/fees/tax/returns and per-unit profit |
| Contour Flow original art tee | $22.75 to $30.75 variants; platform displayed base earnings $11 | HIDDEN, available=false | **Known dark-text contrast problem on black shirt**; white-color alternative preview was not saved. Test contrast/design, every offered size price/cost, fabric print area, safe margins and returns |
| Orbit Notes original art sticker | $6.29; platform displayed earnings $4 | HIDDEN, available=false | Validate 3-inch print legibility, actual per-item net margin after transaction charges, shipping and returns |
| Original Abstract Art Gifts collection | 3 offers | Historically HIDDEN; current collection status not independently re-queried in this run | Make visible only after all launch gates clear |

## Strict blocking logic
- Payout **INACTIVE**: do not enable checkout, publish listings, route payments elsewhere or claim live sales.
- No verified positive net contribution per variant: do not assert profitability. Estimate = collected item price + seller-absorbed shipping revenue - production/print charges - seller-paid shipping - processing/platform fees - refunds/return reserve - seller taxes/other charges. Verify each input; unknowns stay UNKNOWN.
- Copyright: check all source files and license/original creator provenance; do not make artwork with protected logos, fictional characters, celebrities or copied artist compositions.
- Black tee contrast: design should be legible in official print preview or use validated color/ink alternatives. Previewed is not the same as saved.
- Shipping and returns: no invented fast delivery or geographic eligibility. Fourthwall's Sept 22, 2026 help article says on-demand production 2–5 business days plus destination-specific transit; present customer estimates from checkout, not blanket promises.
- Site policies/contact, mobile accessibility, destination/shipping support and real checkout/order routing still unverified. No fake purchase to demonstrate readiness.
- Data handling: keep bearer tokens, OTPs, bank details and buyer records out of GitHub.

## Earliest legal route to first sale
1. **Secure owner-only action**: in the genuine logged-in [Fourthwall dashboard](https://admin.fourthwall.com/store/med-art/), navigate Settings → Billing and payouts → Set up your payouts. Choose Tunisia truthfully, then complete the Stripe Connect identity/bank authorization yourself as prompted. Fourthwall Support (2026-10-12) explicitly confirmed the country-level route, **not** that this store's payout is activated. Never substitute fabricated identity/bank.
2. **Parallel internal work**: Ledger verifies all variant prices & costs in authenticated dashboard; Forge/Muse check copyright, print mockups and tee contrast; Harbor verifies factual policies and allowed shipping markets; Sentinel requires documentary evidence before approving release.
3. **Pre-launch growth**: prepare Pinterest/Reels/Shorts original content about designs and inspiration only. Do not suggest unavailable hidden products are purchasable. No unsolicited bulk marketing.
4. Once payout ACTIVE plus all other gates are independently confirmed, perform real storefront/checkout verification through permitted platform workflow, publish only approved SKUs and use source-tagged organic links; record genuine paid orders and contribution profits.
5. If genuine payout onboarding fails, capture only sanitized stage/error details and reply to existing Fourthwall Support conversation; avoid storing sensitive bank/ID details.

## Execution and evidence status
- Current read-only checks: PASS.
- Nine-agent internal coordination: PASS (exit 0, safe-prelaunch).
- New verified revenue/customers: NONE established in this cycle.
- Public publication: ZERO.
- Expenses: $0.
- Checkout and payout activation: BLOCKED.
- Next high-leverage external action: actual Stripe Connect setup by rightful owner.
- Parent issue: https://github.com/mohameddtrabelsiiii-crypto/hamma/issues/17
