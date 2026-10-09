# Cavalry / Med Art — operational launch checkpoint

**Last verified: 2026-10-09 UTC.** Status below is grounded in authenticated connected Fourthwall/Gmail/Cloudflare checks. It is **not** proof of revenue, public checkout, or merchant approval.

## Product catalog: COMPLETED — hidden prelaunch

Authenticated Fourthwall `ecommerce_get-offers` confirmed **3** products. All use Fourthwall fulfillment; all are **HIDDEN**:

| Item | Selling price | Variants | Fourthwall offer ID |
| --- | ---: | ---: | --- |
| Orbit Notes — Minimal Art Sticker | $6.29 USD | 1 | `ca3d2f32-9532-4f06-9de6-4fe0adcd4739` |
| Contour Flow — Original Abstract Art Tee | $22.75 USD | 9 | `fb458dda-5aa8-416a-8978-fc6025dc9490` |
| Night Geometry — Original Abstract Art Mug | $16.95 USD | 1 | `428cedc6-5a50-4ac6-a0db-04c16257fbbd` |

Actual artwork was uploaded through the authenticated Fourthwall product designer; generated tee and mug mockups were visually inspected. The tee editor displayed about **$11 expected margin** for the selected variant before any additional costs; do not extrapolate to shipping, fees, different variants, refunds, or net realized profit. No samples were purchased. No stock was ordered.

The `Original Abstract Art Gifts` collection (ID `col_EuJCdIEUSY-vzJolhmXGIw`) was authenticated and confirmed to contain **all 3** offer IDs, `state: HIDDEN`, `available: false`. **Do not create duplicate offers or collections.**

## Storefront and payment: NOT READY

- Authenticated shop status: `COMING_SOON` as of 2026-10-09.
- Authenticated payout status: `INACTIVE` as of 2026-10-09.
- Verified completed sales and settled payouts: **none established**.
- Fourthwall Support was contacted about a Tunisia-based owner and permitted payout routes. As of last Gmail check on 2026-10-09, only the automatic ticket acknowledgement has been received. Avoid duplicate requests.
- Fourthwall's official article (updated 2026-09-30) describes **bill.com** onboarding for eligible creators whose country/bank is not supported by Stripe Connect; threshold generally $25 and provider-issued invite after the threshold. Tunisia is **not** listed in Fourthwall's published completely-unsupported countries, but **eligibility for this particular owner/shop is not yet approved**. Official source: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/country-not-supported-by-stripe
- Any bank details, legal owner identity, tax requirements and KYC verification must be genuine and completed through authorized official onboarding. Never bypass them, never use someone else's banking/residence, never use Whop as a supposedly integrated Fourthwall checkout.
- **Do not publish the products or switch the site to LIVE** until payout route is confirmed, product cost/variants/shipping/checkout have been reviewed, and a no-spend checkout walkthrough or legitimate test (if available) passes.

## Cloud Cavalry: DEPLOYED, draft-only

- Cloudflare Worker `cavalry-medart-agents` at https://cavalry-medart-agents.mohameddtrabelsiiii.workers.dev/status
- Workers AI binding `AI`, D1 binding `DB` to database `cavalry_medart_agents`.
- Scheduler: `0 */3 * * *` UTC, up to **8 total AI cycles per day** / 2 inference requests per cycle; shared Cloudflare account metered-spend must separately be monitored.
- Nine sequential specialist roles under Cavalry; D1 persists assigned messages, next-role handoff drafts and supervisor reports with `verified=0`.
- **2 manual AI cycles**, **2 role-to-role handoffs** and **6 total stored messages** were verified. The status API now reports messages and handoffs separately. **A cron-triggered cycle has not yet been independently observed** as of this checkpoint. Never claim that nine dedicated agents run simultaneously or that merchant writes occur; Cloudflare Worker is intentionally read-only to outside apps.
- Chrome and Firefox can be used via the authorized Remote Desktop Commander Windows PC when online, but the cloud draft Worker does not require it. Local Ollama has `qwen3.5:0.8b` and `qwen2.5:1.5b`; model availability does not itself prove unattended local inference.

## Immediate operator priorities

1. Monitor the **existing** Fourthwall Support email thread until a substantive payout eligibility answer, then complete only legitimate onboarding steps; sensitive identity/banking submission may require the owner.
2. Verify base prices **per variant**, payment/platform fees, destination-specific shipping, customer-facing taxes/duties notices, fulfillment/refund policy and support contact. No paid sample order under the zero-cost constraint.
3. Finish prelaunch site copy and SEO using only original artwork and verifiable product specifications. Avoid fabricated testimonials, unsupported medical claims, promised delivery dates, or demand metrics.
4. Confirm a checkout journey is available and shipping rates show before any public launch; do not place an actual charge merely as a test.
5. Publish only after merchant payout and checkout safety gates are satisfied and all public copy/links are verified.
6. Promote through genuinely authorized **free** channels; no mass unsolicited outreach, paid Connects, ads, subscriptions or fake UGC.

**Milestone distinction:** 3 real finished, unpublished Fourthwall catalog products = VERIFIED. Fully autonomous live sales with real payouts = NOT YET VERIFIED.
