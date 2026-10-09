#!/usr/bin/env bash
set -u
echo 'Hermes integration prerequisites (read-only check)'
missing=0
for cmd in hermes git node npm npx python3 uvx docker ollama; do
  if command -v "$cmd" >/dev/null 2>&1; then
    printf '[OK] %s: %s\n' "$cmd" "$(command -v "$cmd")"
  else
    printf '[MISSING/OPTIONAL] %s\n' "$cmd"
    case "$cmd" in hermes|git|node|npm|npx|python3) missing=1;; esac
  fi
done
if grep -qi microsoft /proc/version 2>/dev/null; then
  echo '[INFO] WSL detected'
fi
if [ -f "$HOME/.hermes/config.yaml" ]; then
  echo '[OK] Existing Hermes configuration present; DO NOT overwrite without merging.'
else
  echo '[INFO] Hermes config.yaml is not installed yet.'
fi
if [ "$missing" -eq 1 ]; then
  echo '[ACTION] Install missing required prerequisites before configuring integrations.'
  exit 1
fi
echo '[OK] Required command prerequisites present. Individual MCP/backends still need checks.'
