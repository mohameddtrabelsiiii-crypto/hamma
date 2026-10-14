"""Zenvocloud Cavalry Brain v1: bounded local AI planning with verified execution.
Does not send mail, alter checkout, purchase services, or touch customer data.
"""
from __future__ import annotations
import json, os, re, subprocess, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from mercury_lite_worker import kb, kbc

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent / "TaskForge"
OUT = ROOT / "runtime" / "cavalry-brain"
OUT.mkdir(parents=True, exist_ok=True)
NODE = Path("C:/Program Files/nodejs/node.exe")
BOARD = "zenvocloud-revenue"
MODEL = "qwen3.5:0.8b"

def select_action(counts: dict) -> tuple[str, str]:
    safe = {k: int(counts.get(k, 0)) for k in ("done", "failed", "blocked", "queued", "in_progress")}
    prompt = (
        "You are Cavalry, a cautious Zenvocloud business reliability planner. "
        "Choose exactly one token: QA, SITE, or QUEUE. "
        "QA tests local code; SITE checks public homepage HTTP; QUEUE inspects local approved-work inbox. "
        "Prioritize failures and missing evidence. Never claim a sale, and never propose spending or contacting people. "
        "Board task counts: " + json.dumps(safe, sort_keys=True) + "\nAnswer:"
    )
    payload = {"model": MODEL, "prompt": prompt, "stream": False, "think": False,
               "options": {"temperature": 0, "num_ctx": 1024, "num_predict": 12}}
    try:
        request = urllib.request.Request(
            "http://127.0.0.1:11434/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(request, timeout=42) as response:
            answer = str(json.load(response).get("response", "")).strip().upper()
        tokens = re.findall(r"\b(?:QA|SITE|QUEUE)\b", answer)
        if len(set(tokens)) == 1:
            return tokens[0], "local_ollama"
        return "QA", "invalid_model_output_fallback"
    except Exception as error:
        return "QA", "model_unavailable_fallback_" + type(error).__name__

def perform(action: str) -> dict:
    if action == "QA":
        result = subprocess.run(
            [str(NODE), "--test", "worker.test.mjs"],
            cwd=str(PROJECT), capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=80)
        transcript = (result.stdout or "") + "\n" + (result.stderr or "")
        (OUT / "latest-qa.log").write_text(transcript[-16000:], encoding="utf-8")
        found = [re.search(r"(?:#|ℹ)\s*" + key + r"\s+(\d+)", transcript)
                 for key in ("tests", "pass", "fail")]
        if any(x is None for x in found):
            raise RuntimeError("QA missing authoritative result counts")
        tests, passed, failed = (int(x.group(1)) for x in found)
        if result.returncode or not tests or passed != tests or failed:
            raise RuntimeError("QA failed or did not finish cleanly")
        return {"action": action, "tests": tests, "passed": passed, "failed": failed}
    if action == "SITE":
        with urllib.request.urlopen(
            urllib.request.Request("https://taskforge-ai.pages.dev/",
                                   headers={"User-Agent": "Zenvocloud-CavalryHealth/1.0"}),
            timeout=18) as response:
            status, sample = response.status, response.read(2048)
        if status != 200 or len(sample) < 50:
            raise RuntimeError("Public site response did not pass")
        return {"action": action, "http_status": status, "sample_bytes": len(sample),
                "site": "taskforge-ai.pages.dev", "checkout_verified": False}
    if action == "QUEUE":
        inbox = ROOT / "ZenvocloudQueue" / "inbox"
        pending = list(inbox.glob("*.job.json"))[:100]
        return {"action": action, "pending_manifests": len(pending),
                "customer_orders_verified": False}
    raise ValueError("Disallowed action")

def main() -> int:
    now = datetime.now(timezone.utc)
    bucket = now.strftime("%Y%m%d") + "-" + str(now.hour // 4)
    task_id = None
    evidence = {"service": "zenvocloud-cavalry-brain", "started_at_utc": now.isoformat(),
                "model": MODEL, "customer_contact": False, "money_spent_usd": 0,
                "checkout_modified": False, "scope": "read_only_internal"}
    try:
        with kbc.connect_closing(board=BOARD) as conn:
            counts = {row[0]: row[1] for row in conn.execute(
                "SELECT status,COUNT(*) FROM tasks GROUP BY status")}
            action, selected_by = select_action(counts)
            evidence.update({"action": action, "selected_by": selected_by, "board_counts": counts})
            task_id = kb.create_task(
                conn, board=BOARD,
                title="CAVALRY Brain: execute verified " + action + " inspection",
                body="Internal, read-only, evidence-backed work only. No outreach, billing, production mutations or customer data.",
                assignee="cavalry", created_by="cavalry-brain-v1",
                workspace_kind="scratch", project_id="", skills=[],
                idempotency_key="zenvocloud-cavalry-brain-v1-" + bucket,
                max_runtime_seconds=150, max_retries=1)
            existing = kb.get_task(conn, task_id)
            if existing.status == "done":
                evidence.update({"task_id": task_id, "status": "previously_verified"})
            else:
                claimed = kb.claim_task(conn, task_id, ttl_seconds=150,
                                        claimer="cavalry-brain:" + str(os.getpid()))
                if not claimed or not claimed.current_run_id:
                    raise RuntimeError("Native Hermes task claim unavailable")
                run_id = int(claimed.current_run_id)
                try:
                    result = perform(action)
                    summary = "Cavalry inspected " + action + "; verified local evidence only."
                    if not kb.complete_task(conn, task_id, result=json.dumps(result),
                                            summary=summary, expected_run_id=run_id,
                                            metadata={"source": "cavalry-brain-v1",
                                                      "selected_by": selected_by, **result}):
                        raise RuntimeError("Native Hermes rejected completion")
                except Exception as error:
                    kb.block_task(conn, task_id, kind="needs_input",
                                  reason=type(error).__name__, expected_run_id=run_id)
                    raise
            row = conn.execute("SELECT status FROM tasks WHERE id=?", (task_id,)).fetchone()
            run = conn.execute(
                "SELECT outcome FROM task_runs WHERE task_id=? ORDER BY id DESC LIMIT 1",
                (task_id,)).fetchone()
            verified = bool(row and row["status"] == "done" and
                            run and run["outcome"] == "completed")
            evidence.update({"task_id": task_id, "status": "verified" if verified else "unverified",
                             "native_hermes_completed": verified})
        (OUT / "latest-proof.json").write_text(json.dumps(evidence, indent=2) + "\n",
                                                encoding="utf-8")
        print(json.dumps(evidence))
        return 0 if verified else 3
    except Exception as error:
        evidence.update({"task_id": task_id, "status": "failed",
                         "error_type": type(error).__name__, "error": str(error)[:200]})
        (OUT / "latest-proof.json").write_text(json.dumps(evidence, indent=2) + "\n",
                                                encoding="utf-8")
        print(json.dumps(evidence))
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
