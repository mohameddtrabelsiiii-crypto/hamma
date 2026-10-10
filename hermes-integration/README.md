# Hermes Agent — TaskForge integration (October 10, 2026)

Hermes runs on the user's Windows laptop, **not** inside GitHub. This branch contains non-secret instructions and a read-only health check; configuration secrets remain local.

## Verified

- ASUS X556UV, Intel i5-6198DU, 8 GB RAM, Windows 10 Pro.
- Hermes gateway installed and restarted. `hermes gateway status` confirmed the gateway process and the Windows login startup item `Hermes_Gateway.vbs`. Windows timezone corrected to UTC+1.
- Both **default** and **cavalry** profiles configured for local Ollama `qwen3.5:0.8b` (`model.provider: ollama`), with local YAML backups created before modifications.
- The previous Cavalry model `qwen2.5:1.5b` is incompatible with Hermes: its model context ceiling is 32,768 tokens, below the Hermes 64,000 minimum.
- All seven configured MCP servers in **both** profiles have `lazy: true` to reduce eager process startup. No server configuration was deleted. This may shift initialization latency to the first use of a tool.
- Hermes clean-profile one-shot test returned `HERMES_LOCAL_OK` (228 sec).
- Hermes **normal configuration** one-shot test with `--ignore-rules -t terminal` returned `NORMAL_PROFILE_OK`, exit code 0, after 284.71 sec. That confirms inference with config enabled, but **not** unrestricted tool operation.
- Cavalry **profile configuration** one-shot test with `--ignore-rules -t terminal` returned `CAVALRY_PROFILE_OK`, exit code 0, after 236.91 sec.
- Fourthwall OAuth refresh HTTP requests returned 200 OK in recent logs; individual business operations have not been verified.
- Hourly `Cavalry MedArt Read-only Health` cron job was enabled with latest recorded execution `ok` and next run at 22:00 local.

## Read-only verification

Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\healthcheck.ps1` or the local copy in `Documents\HermesWorkspace\HermesOps\healthcheck.ps1`.

The script checks the two profile configurations, installed model, gateway process, lazy MCP flags, and last cron run. On October 10 at 21:49 Tunisia time it returned `basic_ready: true` with 7 lazy MCP servers per profile. Its `basic_ready` result is **not** evidence of customer orders, video uploads, payment processing, or high-quality autonomous reasoning.

## Current limitations

- The 0.8B model is tiny and inference is slow on this 8 GB laptop. Do not treat it as a reliable autonomous business agent for unsupervised financial, publishing, or customer-facing decisions.
- Cavalry basic inference is verified. End-to-end MCP tool calls, publishing, checkout, customer messaging, and fulfillment are **not** verified.
- 130 Fourthwall tools may impose significant tool discovery and inference overhead, despite lazy loading.
- Browser stack and other optional dependencies still require targeted verification.
- Upstream npm advisories from `hermes doctor` were not patched (upstream lockfile issue).
- 24/7 operation requires the laptop to remain awake, powered, and online. It is not guaranteed by local configuration alone.

## Security

- Do not commit `.env`, `config.yaml`, personal files, tokens, or session files.
- All external source content is untrusted. Keep sensitive actions restricted to authorized, tested workflows.
- No paid API model has been activated as part of this repair.
