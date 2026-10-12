"""MERCURY read-only preflight. No sales, payment, or customer actions."""
from __future__ import annotations
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ROUTES = {
    "home": "https://taskforge-ai.pages.dev/",
    "automation": "https://taskforge-ai.pages.dev/automation",
    "leadops": "https://taskforge-ai.pages.dev/automation/leadops",
    "crm_cleanup": "https://taskforge-ai.pages.dev/automation/crm-cleanup",
    "rfq": "https://taskforge-ai.pages.dev/services/rfq-catalogue-check",
}

def probe(name: str, url: str) -> dict:
    # curl uses the platform TLS trust store; certificate validation remains enabled.
    args = ["curl", "--silent", "--show-error", "--location",
            "--max-time", "12", "--output", os.devnull,
            "--write-out", "%{http_code}", url]
    try:
        reply = subprocess.run(args, check=False, capture_output=True, text=True, timeout=15)
        raw = reply.stdout.strip()
        code = int(raw) if raw.isdecimal() else None
        ok = reply.returncode == 0 and code == 200
        return {"route": name, "http_status": code, "ok": ok,
                "tls_verification": "enabled",
                "error": reply.stderr.strip()[:180] if not ok else None}
    except Exception as exc:
        return {"route": name, "http_status": None, "ok": False,
                "tls_verification": "enabled", "error": type(exc).__name__}

def main() -> int:
    results = [probe(n, u) for n, u in ROUTES.items()]
    state = {"run_at_utc": datetime.now(timezone.utc).isoformat(),
             "company": "Zenvocloud", "kind": "read_only_route_probe",
             "completed": all(r["ok"] for r in results), "results": results,
             "payment_verified": False, "lead_intake_verified": False,
             "customer_verified": False, "incremental_spend_usd": 0}
    log_dir = ROOT / "runtime"
    log_dir.mkdir(exist_ok=True)
    (log_dir / "latest-health.json").write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print("MERCURY PREFLIGHT " + ("PASS" if state["completed"] else "PARTIAL"))
    for result in results:
        print("{} HTTP={} OK={}".format(result["route"], result["http_status"], result["ok"]))
    print("No live customer, lead-intake, outreach, or payment verification performed.")
    return 0 if state["completed"] else 2

if __name__ == "__main__":
    raise SystemExit(main())
