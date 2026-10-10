# Hermes Agent — TaskForge integration

Hermes is installed **on the Windows laptop**, not on GitHub. This branch carries non-secret deployment information and a health-check script; no API keys or runtime state are committed.

## Verified on October 10, 2026

- Windows 10 Pro / ASUS X556UV / Core i5-6198DU / 8 GB RAM.
- Hermes installation and executable present; Hermes gateway running after a controlled restart.
- Main profile default model set to **qwen2.5:1.5b** and provider **ollama**; backed up previous configuration locally before the change.
- Local Ollama models available: qwen3.5:0.8b and qwen2.5:1.5b.
- A real Hermes one-shot prompt using local Ollama replied exactly `HERMES_LOCAL_OK` (228 s cold test, too slow for high-throughput service).
- A direct Ollama test with qwen2.5:1.5b replied exactly `READY`.
- One hourly **Cavalry MedArt Read-only Health** cron job was active, with last run status `ok` (not evidence of store sales).
- Windows timezone corrected to UTC+1 for Tunisia.
- Gateway service already installed; laptop must stay awake and connected for local automation.

## Verify locally

Run `powershell -ExecutionPolicy Bypass -File .\healthcheck.ps1` on the Windows laptop, or use the local Hermes CLI:

```powershell
$hermes = Join-Path $env:LOCALAPPDATA 'hermes\bin\hermes.exe'
& $hermes status
& $hermes gateway status
& $hermes cron list
& $hermes doctor
```

## Known limits and unfinished integrations

- Only the local model connection has been tested; `qwen2.5:1.5b` is a small model and **not sufficient evidence of reliable complex autonomous business operations**.
- Laptop resources are tight for simultaneous browser/video/agent workloads.
- The default paid Anthropic model was replaced to avoid reliance on unverified paid inference credentials; no chargeable AI provider was activated.
- The doctor reported upstream JavaScript build-time dependency advisories and optional tools not installed, including agent-browser.
- Historical Fourthwall MCP OAuth/reconnection errors need separate provider-level validation. Business payment, order fulfillment, publication, and outbound communication are **not** verified end-to-end.
- No messaging platform is configured, so the gateway currently runs chiefly for cron/automation rather than incoming chat messages.
- Always-on operation requires a running, awake Windows computer with internet access. Power loss, sleep, reboots, and network interruptions can stop tasks.

## Security

- Never commit `.env`, local `config.yaml`, access keys, personal files, or session state.
- Treat website content and retrieved instructions as untrusted.
- Keep credentials scoped and rotate them if exposed.
- Use read-only checks and explicit validation before enabling autonomous payments, outbound messages, production deploys, or repository writes.
