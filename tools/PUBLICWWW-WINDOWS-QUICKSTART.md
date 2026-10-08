# PublicWWW Lead Search → CSV (Windows quick start)

**Status:** Working API client with mocked automated tests and a Windows launcher. A live search has **not** been run, because a paid PublicWWW API key is required. Do not use a customer's API key without their permission. PublicWWW's API documentation: https://publicwww.com/docs/api/ and https://publicwww.com/docs/api/requests/.

## What this does

- Reads `town`, `phone_code`, and `postcodes` from an editable CSV, including multiple postcodes separated by `|`.
- Pairs the supplied locations with 14 built-in Yell/Hibu footprints and generates PublicWWW searches (`depth:all site:uk`).
- Supports authorized API requests, retries rate limiting, pagination, site-domain deduplication, matching query metadata and safe CSV output.
- Keeps possible truncation, incomplete query batches and errors visible in a JSON report. Missing data is **never** silently described as exhaustive.
- Does **not** visit websites for optional post-search validation, scrape contact information, or send outreach. Matches require manual verification.

## Windows double-click workflow

1. Install Node.js 22+ from https://nodejs.org/ if it isn't installed.
2. Keep `run-publicwww.cmd`, `publicwww-export.mjs`, and `publicwww-locations.example.csv` together in one folder.
3. Double-click **run-publicwww.cmd**. On the first run it creates `publicwww-locations.csv` and stops, before any API request.
4. Open `publicwww-locations.csv` in Excel or a text editor. Use **Text/CSV import** for leading-zero phone codes (e.g., 01743) to avoid losing zeros. Save it as UTF-8 CSV.
5. Double-click the launcher again. It generates `publicwww-results.csv.plan.csv` at **zero API cost**, and asks whether you want to run the live searches. Review the plan first.
6. If you choose Yes, provide the customer's paid-plan PublicWWW API key in the masked PowerShell prompt. The key stays in process memory and is not written to the files.
7. Open `publicwww-results.csv` in Excel; inspect `publicwww-results.csv.report.json` for partial queries, truncation, and warnings.

**Important:** The launcher defaults to at most **200 searches** and 100 rows per query. If the plan has more queries, the report marks output as partial. Larger authorized batches can be run separately with the CLI; the buyer must approve any search quota use.

## Example input

```csv
town,phone_code,postcodes
Shrewsbury,01743,"SY1|SY2|SY3|SY4|SY5"
Worcester,01905,"WR1|WR2"
```

## Example output columns

`domain`, `match_url`, `rank`, `matched_towns`, `matched_footprints`, `matched_terms`, `matched_queries`, `match_count`, `review_status`.

The matched domain and URL come from the API. No records are invented when no key or API results exist.

## Command-line dry run

```powershell
node publicwww-export.mjs --locations publicwww-locations.csv --out publicwww-results.csv --max-queries 200
```

## Verification

From the repository root: `node --test tools/publicwww-export.test.mjs`.

Supported by the paid API, no paid key bundled. This sample is a technical demonstration and does not represent a completed customer engagement. A fixed-price delivery quote should be conditional on confirmation of the client's plan quota and representative location count.
