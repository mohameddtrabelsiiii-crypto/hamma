# Restaurant stock and supplier balances — TaskForge AI fictional proof

**Demonstration only.** All quantities, suppliers, dates and costs are fictional. This is **not a paid customer delivery**, a live inventory system, or evidence of restaurant-industry client references.

Public quote page (after Cloudflare release): https://taskforge-ai.pages.dev/services/restaurant-stock-dashboard

## Workbook produced
The verified Excel workbook `TaskForge_Restaurant_Inventory_Demo.xlsx` is a six-workflow-sheet template plus a Read Me, generated for a portfolio exercise. It covers:
- **Stock Items** — opening quantity, unit cost, purchased quantity, issued quantity, current stock, stock value, reorder threshold and status.
- **Purchases** — date, supplier, item, quantity, unit, unit rate, calculated purchase value, reference.
- **Stock Issues** — separate consumption/sales/use register to avoid overstating on-hand stock.
- **Supplier Payments** — payments kept separate from purchases, with references.
- **Supplier Ledger** — per-supplier purchases, payments and outstanding balances.
- **Dashboard** — purchase value, supplier outstanding due, on-hand stock valuation, negative and low-stock warnings.

## Sample formula logic
For each item:
- `PurchasedQty = SUMIF(Purchases.Item, Item, Purchases.Qty)`
- `IssuedQty = SUMIF(StockIssues.Item, Item, StockIssues.QtyIssued)`
- `OnHand = OpeningQty + PurchasedQty - IssuedQty`
- `StockValue = OnHand * EnteredUnitCost`
- `Status = NEGATIVE_STOCK if OnHand < 0; REORDER if OnHand <= Threshold; else OK`

For each supplier:
- `Purchases = SUMIF(Purchases.Supplier, Supplier, Purchases.Total)`
- `Payments = SUMIF(SupplierPayments.Supplier, Supplier, SupplierPayments.Amount)`
- `OutstandingDue = Purchases - Payments`

## Scope and limits
- Units must match per SKU (cartons to pieces requires an explicit conversion rule).
- Unit prices are examples, not a verified costing or accounting method.
- Returns, spoilage, recipes/BOM, taxes, multi-branch transfers and expiration lots require a custom build.
- Workbook formulas cover finite prepared input ranges and can be expanded after agreeing volume.
- No buyer's personal data, private files, credentials or financial records are in this demo.

## What a paid project must confirm
Number of stock items and suppliers, unit and currency rules, opening balances, purchase and usage data sources, cost method, required low-stock alerts, target Excel version, role permissions, and acceptance tests. Quote after representative *redacted* samples. Do not claim automated ERP integration or payment until live validated.
