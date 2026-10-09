# TaskForge RFQ-to-catalogue precheck (synthetic demo)

Offline, dependency-free Node.js proof for approved catalogue lookup and quote-draft CSV exports. This is NOT a paid client case study, n8n flow, PDF extractor or XLSX generator. No customer data, external API, email or CRM access is used.

## Quick start

1. Run: node --test rfq.test.mjs
2. Create an output directory: mkdir output
3. Run: node rfq.mjs samples/rfq.csv samples/catalogue.csv output/quote

Outputs two files: output/quote-draft.csv and output/quote-review.csv. Sample RFQ intentionally contains an unmatched SKU and therefore produces no complete quotation total.

## CSV headers

RFQ input: sku,description,quantity,unit
Catalogue input: sku,description,unit,unit_price,currency

Only exact SKU matches using approved catalogue prices are allowed. Unknown SKUs, duplicate rows, missing/invalid prices, incompatible units, invalid quantities, mixed currencies and duplicate catalogue SKU records go to review. A complete total is withheld if there are exceptions. Spreadsheet formula-like fields are escaped in CSV exports.

Limits: up to 1 MB and 2,000 data rows per input. One currency, integer quantities and at most 2 decimal places on prices. No tax/discount handling, scanned-PDF OCR, currency/unit conversion or substitutions. All quotes need human approval. The next separately scoped stage would add a client-approved text PDF template, workflow orchestration, XLSX and acceptance tests.

Commercial status: portfolio code only, no signed contract, commissioned integration, buyer endorsement or revenue claim.