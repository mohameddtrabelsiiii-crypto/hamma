# Hermes Agent — TaskForge integration

This is a non-secret, isolated deployment guide. Hermes Agent runs on the Windows laptop and connects to an AI model provider. It is **not** deployed into GitHub itself.

## Local setup

1. Use the official NousResearch/hermes-agent Windows installer.
2. Complete `hermes setup` on the laptop, selecting an authorized inference provider and entering credentials locally. Never commit secrets.
3. Run `hermes doctor` and `hermes status` (depending on supported CLI version).
4. Test a harmless local prompt before granting filesystem, browser, or business permissions.
5. Enable only required tools and explicitly validate each business workflow.

## Security

- Never commit `.env`, API keys, personal data, or Hermes runtime state.
- Treat web pages and retrieved material as untrusted input.
- Use separate restricted credentials for GitHub and business services.
- Do not enable autonomous payments, outbound customer messages, repository writes, or deployment without tested guardrails and appropriate authorization.

## Hardware notes

ASUS X556UV: Intel i5-6198DU, 8 GB RAM, NVIDIA GeForce 920MX. Prefer cloud inference with lightweight local orchestration. Expect reduced concurrency and no practical large-model local inference.

## Current status

Configuration scaffold only. No credentials or AI inference provider are included in the repository.
