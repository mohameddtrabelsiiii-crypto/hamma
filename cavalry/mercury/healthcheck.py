"""MERCURY read-only commercial preflight: no sales or payment actions.
Designed for Hermes local free scheduled model cycle. Python standard library only.
"""
from __future__ import annotations
import json
import time
import urllib.error
import urllib.request
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
    req = urllib.request.Request(url, headers={"User-Agent": "Zenvocloud-Mercury-Readiness/1.0"}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            status = int(resp.status)
            return {"route": name, "http_status": status, "ok": status == 200}
    except urllib.error.HTTPError as exc:
        return {"route": name, "http_status": int(exc.code), "ok": False}
    except Exception as exc:
        return {"route": name, "http_status": None, "ok": False, "error": type(exc).__name__}

def main() -> int:
    seen = [probe(k, url) for k, url in ROUTES.items()]
    state = {
        "run_at_utc": datetime.now(timezone.utc).isoformat(),
        "kind": "read_only_route_probe",
        "company": "Zenvocloud",
        "completed": all(x["ok"] for x in seen),
        "results": seen,
        "claims_excluded": ["live lead storage", "merchant payment", "customer contact", "agent autonomy"],
        "incremental_spend_usd": 0,
    }
    log = ROOT / "runtime"
    log.mkdir(exist_ok=True)
    (log / "latest-health.json").write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print("MERCURY PREFLIGHT " + ("PASS" if state["completed"] else "PARTIAL"))
    for item in seen:
        print("{} http={} ok={}".format(item["route"], item["http_status"], item["ok"]))
    print("No live lead, payment, or outreach tests performed.")
    return 0 if state["completed"] else 2

if __name__ == "__main__":
    raise SystemExit(main())
