# Hermes free AI integration pack

This pack prepares **11 optional open-source integrations** for Hermes Agent without adding paid subscriptions or modifying the TaskForge production deployment.

## Prerequisites
Hermes runs reliably on Windows through **WSL2 (Ubuntu)**. Follow the [official Windows quickstart](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/windows-wsl-quickstart.md). Install Node.js and Python/uv **inside WSL**. Ollama can run on Windows with its localhost endpoint reachable from WSL depending on network configuration. Do not automatically install WSL or expose network services.

1. Install WSL2 and Hermes using official instructions (verify sources before running installers).
2. Clone this GitHub repo inside WSL with Git.
3. Run `bash hermes/scripts/check-prerequisites.sh`. Fix missing dependencies.
4. Install the chosen MCP packages and local backends from their official repos, using pinned verified versions for production.
5. Copy `hermes/config.template.yaml` to `~/.hermes/config.yaml` **after editing the absolute project directory** and merge with existing settings instead of overwriting them.
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
- `hermes --help` responds inside WSL.
- `hermes mcp catalog` works and configured servers start without errors.
- A sample filesystem listing only sees the explicitly authorized worktree.
- Browser actions are restricted to authorized sites.
- GitHub access is least-privilege and does not expose tokens in YAML or Git history.
- Ollama actually loads a downloaded local model (not a paid cloud model).
- Qdrant, n8n, GPT Researcher, and Faster Whisper require separate functional tests; repo references alone do not make them Hermes tools.
- No production deployment, database, payment or customer data is changed by these files.
