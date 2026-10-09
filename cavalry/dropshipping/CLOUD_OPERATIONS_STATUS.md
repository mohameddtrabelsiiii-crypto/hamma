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

## Payout and launch legal/operational interpretation (updated 2026-10-09)

Official Fourthwall documentation confirms:
- **There are no fixed monthly charges for the Free plan's physical POD products**, but processing fees apply per sale (domestic cards 2.9% + $0.30, international cards 3.9% + $0.30; PayPal and BNPL are higher). These fees are computed on the checkout total including shipping and tax where applicable. Source: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/transaction-fees
- Fourthwall does **not require a credit card** if product pricing leaves a nonnegative balance, and orders with negative balances can be blocked instead. No discount or giveaway below break-even under the owner's $0 policy. Source: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/why-credit-card-is-needed
- Fourthwall's **first-payout site verification** permits stores to sell and fulfill orders while the first payout transfer is held. This is not the same as having a verified destination for the funds. Source: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/site-verification-before-first-payout
- Fourthwall states unsupported-Stripe creators can use **bill.com**, with onboarding generally after a $25 balance, but Fourthwall's explicit hard-blocked-country list does not include Tunisia. Still, this **does not guarantee** Med Art's particular legal owner/bank eligibility. Support reply remains pending. Source: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/country-not-supported-by-stripe
- **Business decision:** technically a brand-new shop *may* accept paid orders before first payout is verified, with earnings held by Fourthwall; nevertheless retain Med Art's unpublished state until the owner can lawfully and reliably recover funds, customer-facing checkout and shipping are verified, and no negative-balance risk is introduced. Avoid the misleading blanket statement that Fourthwall *forbids* sales before first payout approval.

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
- Scheduler: **`0 * * * *` UTC (hourly)**, verified updated through Cloudflare API on 2026-10-09 at 18:15 UTC; up to **8 AI cycles per UTC day** / two inference requests per successful cycle. The worker_run heartbeat records attempts, completed cycles and error classes in D1. The first unattended scheduled completion was **NOT YET VERIFIED** immediately after the configuration change. Cloudflare trigger changes may need propagation time. Shared-account usage/billing limits remain separate from the app's own cap.
- Nine sequential specialist roles under Cavalry; D1 persists assigned messages, next-role handoff drafts and supervisor reports with `verified=0`.
- **2 manual AI cycles**, **2 role-to-role handoffs** and **6 total stored messages** were verified. The status API now reports messages and handoffs separately and contains a `last_scheduler_event` field backed by the new D1 `worker_runs` table. As of 2026-10-09 18:15 UTC, `worker_runs` had no events, and **a cron-triggered cycle had not yet been independently observed**. Cron has been shortened to hourly; inspect again after 19:00 UTC plus a propagation grace interval. Never claim that nine dedicated agents run simultaneously or that merchant writes occur; Cloudflare Worker is intentionally read-only to outside apps.
- Chrome and Firefox can be used via the authorized Remote Desktop Commander Windows PC when online, but the cloud draft Worker does not require it. Local Ollama has `qwen3.5:0.8b` and `qwen2.5:1.5b`; model availability does not itself prove unattended local inference.

## Local Cavalry unattended inference: VERIFIED 2026-10-09 18:22 UTC

The authorized Windows PC `DESKTOP-ADP8R8D` has two installed local Ollama models. Its `Cavalry_MedArt_LocalAI` scheduled task previously failed with `LastTaskResult: 1` due to an unreliable nested `cmd.exe /c` launcher. The task action was changed **in Windows Task Scheduler itself** to execute Python directly with `autonomous_team.py` as its argument, keeping its existing recurring trigger. The runner's default local model was changed to previously successful `qwen2.5:1.5b` and GitHub source synchronized.

**Real scheduled task test:** Launched `Start-ScheduledTask` after fixing the registered task, not a direct manual call to the Python program. The resulting run completed with **LastTaskResult = 0**, state `Ready`, and an actual SQLite cycle #2 at **2026-10-09T18:22:29Z**: specialist **Muse**, status `two_way_ai_communication_passed`, model `qwen2.5:1.5b`, stored three messages including **Muse → Forge** handoff. Prior cycle #1 was Atlas → Muse at 17:20:16Z. Two persisted cycles and six local messages now observed. The local cycle recorded `external_actions: 0`, `spend_usd: 0`; these are draft-only and do not prove revenue. The registered task's next scheduled time is 2026-10-09 **09:37:37 in the PC timezone (UTC−11)**, equivalent to **20:37:37 UTC**; the trigger's future unattended execution remains to be confirmed separately. This automation needs the Windows PC powered on, signed into the appropriate environment and Ollama accessible.

## Local Cavalry hourly scheduler: verified run on 2026-10-09

- The Windows registered task `Cavalry_MedArt_LocalAI` was changed from 3-hour repetition `PT3H` to **hourly `PT1H`**, preserving battery protection and overlapping-run policy `IgnoreNew`. The scheduled task was also set to start once available after a missed window and stop after 15 minutes, preventing hung processes. The PC's battery telemetry reported AC power on the day of testing.
- Windows Task Scheduler observed **LastRunTime 2026-10-09 07:37:37 PC local (UTC-11)**, `LastTaskResult=0`, `State=Ready`, next at 08:37:37 PC local. No `Start-ScheduledTask` manual invocation occurred in this verification turn.
- Separate local SQLite verification found cycle #3 (`2026-10-09T18:37:06Z`) with role **Forge**, outcome `two_way_ai_communication_passed`, next handoff recipient **Ledger**, and **three more unverified draft messages**. The timestamp is within approximately a minute of the scheduled run, though the runner records the cycle start before the task's reported `LastRunTime`; avoid stronger event correlation without independent task logs. The `latest-agent-communication.json` updated at 18:37:50Z.
- There are now **3 persisted real Ollama local AI cycles and 9 internal messages**. No proof of orders, public posting or transferable earnings. Next expected local hourly run: 19:37:37 UTC, subject to PC and model availability.
- Cloudflare AI Worker separately runs on an hourly cron `0 * * * *` UTC and has a `worker_runs` heartbeat. As of 18:34:10Z no cloud cron run was recorded. The first scheduled Cloudflare trigger is expected at 19:00 UTC with a reasonable propagation grace. Cloud and local runners should not be conflated.

## Immediate operator priorities

1. Monitor the **existing** Fourthwall Support email thread until a substantive payout eligibility answer, then complete only legitimate onboarding steps; sensitive identity/banking submission may require the owner.
2. Verify base prices **per variant**, payment/platform fees, destination-specific shipping, customer-facing taxes/duties notices, fulfillment/refund policy and support contact. No paid sample order under the zero-cost constraint.
3. Finish prelaunch site copy and SEO using only original artwork and verifiable product specifications. Avoid fabricated testimonials, unsupported medical claims, promised delivery dates, or demand metrics.
4. Confirm a checkout journey is available and shipping rates show before any public launch; do not place an actual charge merely as a test.
5. Publish only after merchant payout and checkout safety gates are satisfied and all public copy/links are verified.
6. Promote through genuinely authorized **free** channels; no mass unsolicited outreach, paid Connects, ads, subscriptions or fake UGC.

**Milestone distinction:** 3 real finished, unpublished Fourthwall catalog products = VERIFIED. Fully autonomous live sales with real payouts = NOT YET VERIFIED.


## 2026-10-09 additional execution / validation

**Authenticated Fourthwall check:** All 3 offers and their complete 11 saved variants are still `HIDDEN` / variant `UNAVAILABLE`, `fulfilledBy: FOURTHWALL`. The hidden collection has exactly 3 confirmed offer IDs and `available: false`. The collection description was updated **in the real Fourthwall account** to correctly describe the tee, mug and sticker, and subsequently re-read and verified without changing visibility.

**Variant-by-variant retail price audit:**

| Saved offer | Variant | USD retail price |
|---|---|---:|
| Contour Flow tee (black) | XS, S, M, L, XL | $22.75 each |
| Contour Flow tee (black) | 2XL | $24.75 |
| Contour Flow tee (black) | 3XL | $26.75 |
| Contour Flow tee (black) | 4XL | $28.75 |
| Contour Flow tee (black) | 5XL | $30.75 |
| Night Geometry white glossy mug | White / 11 oz | $16.95 |
| Orbit Notes kiss-cut sticker | White / 3 in × 3 in | $6.29 |

These are verified *retail prices*, **not** net profits. All require shipping and destination checkout review before making a global sales promise.

**Shipping settings check:** `ecommerce_get-shipping-profiles` returned `enabled: false`, and `ecommerce_get-shipping-flat-rates` returned `enabled: false`. Do **not** automatically switch on merchant-managed fixed-rate shipping merely because these are disabled: the saved items are Fourthwall-produced POD, while the carrier/flat-rate settings in Fourthwall's documentation describe self-fulfilled/custom merchandise. No live destination-specific shipping checkout has been verified. Fourthwall's help guidance states typical POD production 2–5 business days before transit, with international routes potentially much longer and customs dependent on route and destination. Official: https://help.fourthwall.com/frequently-asked-questions/shipping-and-orders/shipping-and-delivery-expectations

**Payout correspondence:** The existing support email asking Fourthwall about a Tunisia-based shop's supported payout routes still only has the initial acknowledgment; no substantive eligibility approval yet. Live payout remains `INACTIVE`, shop remains `COMING_SOON`. Fourthwall's published bill.com path for Stripe-unsupported but Fourthwall-supported countries starts onboarding after at least $25 accrued; a provider-supported path and actual eligibility must be established, not assumed. Consequently, do not treat a pre-revenue inactive payout status *alone* as definitive permanent rejection, and do not claim bill.com settlement is already configured. Official: https://help.fourthwall.com/frequently-asked-questions/payments-and-pricing/country-not-supported-by-stripe

**Cloud AI reliability:** The Cloudflare Worker has been redeployed with the updated factual catalog and distinct metrics `total_messages` vs `total_handoffs`, plus durable D1 table `worker_runs` for cron start/success/error recording. The read-only status endpoint now includes `last_scheduler_event`. Actual historical proof remains **2 manual draft cycles, 6 stored messages, 2 handoffs**. At the deployment/checkpoint, `last_scheduler_event: null`; first successful automatic cron event has NOT yet been independently observed. Cron `0 */3 * * *` is configured. No secure webhook for outside merchant writes is installed. Continue hourly reliability monitoring and investigate missing/failed cron events, distinguishing API health fetches from successful scheduled AI runs.

**Safety boundary:** No ad buys, samples, purchased inventory, merchant identity forgery, public publication or paid checkout execution.


## 2026-10-09 19:00 UTC — live prelaunch copy and website design

- Authenticated Fourthwall `ecommerce_get-offers-by-ids` found the Orbit Notes sticker description was terse, while the other two listings already had substantive copy. The **existing HIDDEN** sticker's HTML description was changed in-place, adding the verified 3-inch × 3-inch size, original artwork, made-to-order fulfillment, and modest shipping/color guidance. The updated description was independently re-read through Fourthwall; offer remained `status: HIDDEN`, `available: false` and `fulfilledBy: FOURTHWALL`. No duplicate listing created.
- Authenticated site designer `https://admin.fourthwall.com/store/med-art/store-design/layout/index` was opened on the connected Windows PC. Selected Fourthwall's clean, minimal starting theme (no external fee). Replaced generic text banner headline with **Original Art for Everyday Life**. The edited headline was **saved, the editor navigated away from, re-opened, and independently verified to persist**.
- Removed the default **Become a member** homepage button, which linked to `/supporters` but no membership is configured. Removed through Fourthwall's Delete confirmation and **saved**. Re-opening the text banner showed only `Shop now` and no membership block. This avoids misleading shoppers about an unavailable subscription offer.
- Site designer continued to display `Coming soon`; the three products and collection should remain HIDDEN pending verified merchant payout and checkout. No site launch, paid order, or advertisement occurred.
- **Still to fix:** authenticated shop profile has an uncustomized generic creator-template description and no logo (`logoUrl: null`). No confirmed save route for the shop profile description; don't claim this completed. The banner's optional description field edit was not persisted and is not counted as complete. Website preview is a draft and cannot be treated as a live purchase experience.
- As of the last Cloudflare D1 check at 19:03 UTC the cloud Worker had **0 recorded cron events**, with hourly schedule `0 * * * *` verified; next re-check after a propagation grace period. Successful local scheduled Ollama handoffs are independently verified and are not cloud cron proof.
