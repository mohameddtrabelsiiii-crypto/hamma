# TaskForge AI — Financial Foundation & Fair Introductory Pricing

Prepared October 11, 2026. Owner instruction: build the foundation step-by-step, validate all assumptions, and **price reasonably for a new company**. Prices below are **internal test ranges**, not published automatic checkout rates, contracted prices, confirmed market demand, revenue projections, or a commitment to deliver unsupported integrations.

## What is verified today
- Site: https://taskforge-ai.pages.dev/ and browser-based demonstrations are live, but no production customer system has been demonstrated.
- Supabase check Oct 11: **0 public.leads records; 1 public.orders record (not verified paid); 0 public.whop_events records**.
- Confirmed paid clients, confirmed payments and realized revenue: **none verified**.
- Live checkout, settlement and refund handling: not verified end-to-end. Keep gated.
- Fully loaded cost per delivered project, founder labor hours, actual buyer budgets, real close rates, and customer retention: **unknown**.
- Zero additional owner spend is a constraint; transaction fees, support work and the value of labor must still be reflected in economic pricing.

## Why these starter prices make sense
Public Upwork category guides observed Oct 2026 show broad and often much higher project ranges (for example, a basic workflow setup around $300–$800; a multistep workflow around $1,000–$3,000; and data cleanup/data entry services covering a wide range). These are vendor-published **category benchmarks, not accepted TaskForge bids**. References:
- https://www.upwork.com/hire/workflow-freelancers/
- https://www.upwork.com/hire/data-entry-specialists/
- https://www.upwork.com/hire/data-cleansing-freelancers/
- https://www.upwork.com/resources/upwork-hourly-rates/

Our price should start below complex-service benchmarks because trust and paid delivery proof are missing, **but not below the time and review cost required to produce a safe result**.

## Introductory offer ladder — for discussion, not automated checkout

| Offer | Indicative introductory buyer budget | Strictly bounded proof / deliverable | Explicit exclusions |
|---|---:|---|---|
| Quick CSV cleanup | **from $89 to $149** | Small structured input, e.g. up to 500 rows; specified normalization; cleaned output + brief QA report; 1 agreed review | No invented missing data; no complex PDF OCR, scraping, third-party data acquisition or system access |
| CRM deduplication review | **$249–$499** | Two CSV exports, clearly documented exact-match rules and flagged exceptions, output suitable for human approval; up to an agreed row cap | No automatic CRM write-back; no fuzzy identity guarantees; buyer must resolve ambiguous merges |
| RFQ / supplier catalogue precheck | **$349–$749** | Small bounded buyer/product/supplier CSV comparison; missing fields and candidate SKU mismatches flagged with a reviewer report | No binding price quotes, supplier communications, availability promises or purchases |
| LeadOps workflow prototype | **$599–$1,200** | One input, agreed routing/transformation logic, one review/export output, controlled test cases; limited proof on sanitized/synthetic data | Not a production CRM/API integration, autonomous outbound sales agent or guaranteed time savings |
| Production integrations & ongoing support | **Custom quote only**, after written discovery, test plan and feasibility | A separately scoped build, authorization, error/retry review, tests and handover; support quoted when actual obligations understood | No blanket $5k project promise; no customer production changes before permission and appropriate controls |

**Important**: An $89 CSV job must be extremely simple. If it requires multiple hours of manual intervention, explain a revised estimate rather than lose money or silently reduce quality. All final quotes depend on actual sample quality, volume, turnaround, reviews, localization, security and feasibility.

## Price floor and contribution margin
Track:
- `estimated_work_hours` = actual preparation + processing + human QA + client communication + one agreed revision.
- `labor_cost` = `hours * chosen internal hourly economic cost` (choose actual local rate after measuring; do not claim unpaid founder time is free).
- `direct_cost` = labor + third-party processing/API fees + expected payment/refund cost + platform charges + per-project delivery expense.
- `contribution` = actual collected price minus direct cost.
- `operating_profit` = contribution from all paid projects plus recurring contribution minus business overhead.
- If using a hypothetical **$20 per hour internal economic labor cost**, 2 hours of work cost $40 before payment/overhead; 8 hours cost $160. $20/hour is only a model assumption, not an incurred wage.
- Before committing to the price, calculate the actual time budget and required profit. Aim for **at least 40% contribution margin** on standard work **after time-valued labor and transaction costs**, subject to realistic data and customer value; never hide quality/safety costs to reach a target.
- Never automatically launch or charge these prices while verified payment settlement remains closed.

## Example monthly scenarios (hypotheses, not forecasts)

| Scenario | Buyer/project mix **per month** | Collected revenue | Assumed direct+business costs | Illustrative operating profit |
|---|---|---:|---:|---:|
| First sale milestone | 1 quick CSV at $99 | $99 | $59 | **$40** |
| Early traction | 4 small jobs at $149 + 2 CRM reviews at $349 + 1 LeadOps prototype at $799 | **$2,093** | 55% = $1,151.15 | **$941.85** |
| Growing repeat business | 5 CRM jobs at $399 + 4 prototypes at $999 + 3 eligible recurring support agreements at $400 | **$7,191** | 52% = $3,739.32 | **$3,451.68** |
| Six-month stretch case | New higher-scope integrations and recurring contracts summing to $20,000 | **$20,000** | 50% = $10,000 | **$10,000** |

Higher-scope and recurring work only belongs in the model after successful delivery, permissioned customer integration, actual support capacity and verified payment. Do not call the final row likely or a minimum: no evidence currently supports that sales velocity.

## Growth measurement: change prices on evidence, not imagination
1. **Now → first paid work**: offer reasonable limited-scope buyer quotes; collect verified lead, actual hours, QA failures, client questions, payment fee data and positive/rejected quote reasons. Do not promise 24h turnaround or fully autonomous client integrations.
2. **First 3–5 genuine completed projects**: compare each contracted budget to actual economic cost and time, take truthful optional feedback, check repeatability, and correct any unprofitable offer.
3. **After repeatable paid delivery**: raise pricing only for visibly higher-scope automation implementations, measurable buyer value and real support duties. Keep a low-risk entry offer alongside higher-end work.
4. **Month 3 and Month 6**: forecast using real inquiry → qualified → quote → paid rates and realistic capacity. Forecast `revenue = pipeline_at_each_stage * measured_stage_conversion * actual_collected_ticket`, using ranges and a zero-revenue downside. Do not infer viewership/website visits equals leads.
5. **Owner goals**: $10,000 monthly operating profit by April 2027 is a difficult six-month **stretch**, not a baseline forecast. $1M *annualized revenue run rate* in twelve months is an even more distant moonshot. Reassess only with cash and delivery evidence.

## Cavalry implementation instructions
- This is a **pricing/financial operating policy**, not a direct proof of agent execution.
- Prioritize first genuine funded opportunity and buyer trust. Choose the least risky bounded offer that meets the buyer's expressed requirements; do not push a custom high-ticket sale merely to reach a target.
- For each prospect, prepare private quote worksheet with buyer-supplied scope, estimated total hours, expected economic cost, fees, margin, acceptance conditions, legal payment method and delivery timetable. No PII/credentials in public GitHub.
- Keep in-bound inquiry free. Price after a sample review. Be transparent about unavailable features and distinguish polished demos from operational integrations.
- Enforce existing cap of two new direct outreach emails across all watches in any rolling 24h, after checking SENT; no unsolicited bulk mail, bought Connects, misleading claims or identity/payment rule workarounds.
