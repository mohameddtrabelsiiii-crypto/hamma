# Hermes free AI integration pack

This pack prepares **11 optional open-source integrations** for Hermes Agent without adding paid subscriptions or modifying the TaskForge production deployment.

## Prerequisites
Hermes supports native Windows as well as WSL2. Official native Windows instructions: https://hermes-agent.nousresearch.com/docs/user-guide/windows-native . Native Hermes lives under `%LOCALAPPDATA%\\hermes` and is still installing on the inspected machine (2026-10-09); do not overwrite an installer in progress. Native Windows MCP commands must use available Windows executables (e.g., `npx.cmd`) and Windows paths. WSL2 remains an alternative, not a requirement.

1. Finish installing Hermes natively on Windows, using the official installer. Open a new shell and verify `hermes --help`. WSL2 is optional.
2. Clone this GitHub repo with Git once its installer completes, or download the branch archive.
3. On native Windows, check `hermes --help`, `node --version`, `npx.cmd --version`, `git --version`, and `uvx --version`. On Linux/WSL, run `bash hermes/scripts/check-prerequisites.sh`.
4. Install the chosen MCP packages and local backends from their official repos, using pinned verified versions for production.
5. Merge `hermes/config.template.yaml` into the **actual** Hermes config discovered from its native Windows installation; do not assume `~/.hermes` on Windows. Change `PROJECT_DIR` to an authorized absolute path. Do not overwrite existing settings.
6. Enable only services that are actually running, with credentials supplied **only through local environment or a secret manager**.
7. Launch `hermes chat` and test each server's tool discovery and read-only smoke tests.

## Integration inventory

| Integration | Upstream | Integration method | Activation prerequisite |
|---|---|---|---|
| Ollama | https://github.com/ollama/ollama | Hermes model backend, **not MCP** | Ollama installed, local model downloaded, Hermes model setup |
| Filesystem MCP | https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem | stdio MCP | Node/npx; restrict to project directory |
| Memory MCP | https://github.com/modelcontextprotocol/servers/tree/main/src/memory | stdio MCP | Node/npx; local file persistence |
| Sequential Thinking MCP | https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking | stdio MCP | Node/npx |
| Git MCP | https://github.com/modelcontextprotocol/servers/tree/main/src/git | Python stdio MCP | uvx; local Git |
| Playwright MCP | https://github.com/microsoft/playwright-mcp | stdio MCP | Node, browser binaries; authorize browsing |
| GitHub MCP | https://github.com/github/github-mcp-server | stdio MCP | Docker or official binary; scoped GitHub token |
| Qdrant MCP | https://github.com/qdrant/mcp-server-qdrant | stdio MCP | uvx, reachable Qdrant instance and embeddings |
| n8n | https://github.com/n8n-io/n8n | separate workflow service; optional Hermes MCP bridge | self-hosted instance + configured connector |
| GPT Researcher | https://github.com/assafelovic/gpt-researcher | separate Python app; custom adapter required | local LLM/search backends configured |
| Faster Whisper | https://github.com/SYSTRAN/faster-whisper | local transcription library / Hermes audio backend | Python packages, model download |

**Do not activate optional MCP servers before checking supported command syntax and dependencies.** Hermes' MCP server config lives at `~/.hermes/config.yaml`. The file in this repo is a *template*, not an installed configuration.

## Validation gates
- `hermes --help` responds in the selected native Windows or WSL2 environment.
- `hermes mcp catalog` works and configured servers start without errors.
- A sample filesystem listing only sees the explicitly authorized worktree.
- Browser actions are restricted to authorized sites.
- GitHub access is least-privilege and does not expose tokens in YAML or Git history.
- Ollama actually loads a downloaded local model (not a paid cloud model).
- Qdrant, n8n, GPT Researcher, and Faster Whisper require separate functional tests; repo references alone do not make them Hermes tools.
- No production deployment, database, payment or customer data is changed by these files.
