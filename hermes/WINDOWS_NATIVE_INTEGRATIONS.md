# Hermes Agent — native Windows free integrations

This file is a **template**, not automatically loaded. Verified on native Windows using Hermes (2026-10-09): five MCP connections returned exit code 0 from `hermes mcp test` (Filesystem 14 tools, Memory 9, Sequential Thinking 1, Git 12, Playwright 25). The source installer and `hermes config check` also passed.

## Setup

- Install Hermes using the upstream official Windows installer from NousResearch.
- Copy the configuration sections below into `%LOCALAPPDATA%\hermes\config.yaml` without overwriting existing user settings.
- Replace `YOUR_USER` with the local Windows account directory and create `%USERPROFILE%\Documents\HermesWorkspace`.
- Clone only repositories you are authorized to use into the dedicated workspace.
- Ensure Node.js, npm/npx, Git, and uv are installed, using the current validated paths on your machine.
- Do **not** commit secrets, a real user profile directory, or full local `config.yaml` into GitHub.

## Tested MCP configuration

```yaml
mcp_servers:
  filesystem:
    command: 'C:\Program Files\nodejs\node.exe'
    args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '@modelcontextprotocol/server-filesystem', 'C:\Users\YOUR_USER\Documents\HermesWorkspace']
    enabled: true
  memory:
    command: 'C:\Program Files\nodejs\node.exe'
    args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '@modelcontextprotocol/server-memory']
    env:
      MEMORY_FILE_PATH: 'C:\Users\YOUR_USER\AppData\Local\hermes\memories\knowledge-graph.jsonl'
    enabled: true
  sequential_thinking:
    command: 'C:\Program Files\nodejs\node.exe'
    args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '@modelcontextprotocol/server-sequential-thinking']
    enabled: true
  git:
    command: 'C:\Users\YOUR_USER\AppData\Local\hermes\tools\uv-0.12.3-win32-x64\uv.exe'
    args: ['tool', 'run', '--from', 'mcp-server-git', 'mcp-server-git', '--repository', 'C:\Users\YOUR_USER\Documents\HermesWorkspace\TaskForge']
    env:
      GIT_PYTHON_GIT_EXECUTABLE: 'C:\Users\YOUR_USER\AppData\Local\hermes\tools\git-2.53.0+3-win32-x64\cmd\git.exe'
    enabled: true
  playwright:
    command: 'C:\Program Files\nodejs\node.exe'
    args: ['C:\Program Files\nodejs\node_modules\npm\bin\npx-cli.js', '-y', '@playwright/mcp@latest', '--browser', 'msedge', '--headless']
    enabled: true
```

Test:
```powershell
hermes config check
hermes mcp list
hermes mcp test filesystem
hermes mcp test memory
hermes mcp test sequential_thinking
hermes mcp test git
hermes mcp test playwright
```

## Other free open-source modules — distinct integration paths

- **Ollama:** local inference provider, not MCP. Install Ollama, download a CPU-appropriate small model, then set Hermes model/provider using official Ollama instructions. Models require RAM and disk space.
- **Qdrant MCP:** https://github.com/qdrant/mcp-server-qdrant — supports `QDRANT_LOCAL_PATH` for a local vector index (no Docker/cloud required), but also needs a supported Python runtime and embedding-model download. Test before enabling.
- **Faster Whisper:** https://github.com/SYSTRAN/faster-whisper — optional local speech transcription backend, not a generic MCP server.
- **GitHub MCP:** https://github.com/github/github-mcp-server — requires a separately authorized GitHub token or OAuth credentials for private repo access. ChatGPT's linked GitHub account is not an automatically transferable token.
- **n8n:** https://github.com/n8n-io/n8n — separate local automation server, subject to source license and its configuration/security. Do not expose without authentication.
- **GPT Researcher:** https://github.com/assafelovic/gpt-researcher — separate research application/adapter; free code can still depend on paid search/inference APIs unless local alternatives are configured.

These six are **not** marked operational merely because the code is referenced. Do not imply automatic revenue or unapproved customer contact.
