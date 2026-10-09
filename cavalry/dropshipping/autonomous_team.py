"""Cavalry real local LLM multi-agent mailbox. Zero incremental spend, draft-only.
Pure Python stdlib. Talks only to local Ollama 127.0.0.1, never sends or publishes.
Windows scheduler runs one delegated role per cycle to keep 8GB PC responsive.
"""
import datetime as dt
import json
import os
import pathlib
import re
import sqlite3
import sys
import urllib.error
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
RUNTIME = HERE.parent / "runtime"
DATABASE = RUNTIME / "commerce_agents.sqlite3"
MODEL = os.environ.get("CAVALRY_OLLAMA_MODEL", "qwen3.5:0.8b")
URL = "http://127.0.0.1:11434/api/chat"
NEXT = {
    "atlas": "muse", "muse": "forge", "forge": "ledger",
    "ledger": "sentinel", "sentinel": "pulse", "pulse": "beacon",
    "beacon": "harbor", "harbor": "relay", "relay": "atlas"
}
DELIVERABLES = {
    "atlas": "Gather verifiable research hypotheses; no invented market statistics or links. Output a research plan and label claims UNSOURCED.",
    "muse": "Prepare an ORIGINAL abstract-art product design brief for licensed artwork and print specs; no copyrighted imagery.",
    "forge": "Draft Fourthwall POD product title and description for a non-existing draft; no SKU, price, material or fulfillment guarantee not verified.",
    "ledger": "Explain exact input fields needed for reliable net contribution; no fictitious costs. Formula P-B-processing-subsidy-reserve-tax-acquisition.",
    "sentinel": "Audit the last draft for copyright, merchant payout status, unsupported claims and privacy; reply BLOCK if proof is absent.",
    "pulse": "Prepare one truthful, permission-based, organic social post draft; never actually post or DM anyone.",
    "beacon": "Prepare accurate SEO keyword and click measurement plan; actual conversion and sales metrics are unknown until reported.",
    "harbor": "Draft an accurate Fourthwall support response without identifying a buyer and no guaranteed delivery dates.",
    "relay": "Analyze only observed local watcher uptime/staleness and propose fixes without changing infrastructure."
}
BLOCKED = ("publish", "send", "refund", "purchase", "checkout", "price_update", "payout_update")

def utcnow():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")

def load_json(path, default=None):
    try: return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError): return default if default is not None else {}

def db_open(path=DATABASE):
    path.parent.mkdir(parents=True, exist_ok=True)
    conn=sqlite3.connect(path, timeout=20)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("""CREATE TABLE IF NOT EXISTS messages(
       id INTEGER PRIMARY KEY, created_utc TEXT NOT NULL, cycle INTEGER,
       sender TEXT NOT NULL, recipient TEXT NOT NULL, category TEXT NOT NULL,
       body TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0
       )""")
    conn.execute("""CREATE TABLE IF NOT EXISTS cycles(
       id INTEGER PRIMARY KEY, created_utc TEXT NOT NULL, role TEXT NOT NULL,
       model TEXT NOT NULL, outcome TEXT NOT NULL, details TEXT NOT NULL
       )""")
    conn.commit()
    return conn

def talk(messages, requester=None):
    """Real inference on local Ollama. Return content, no invented fallback."""
    if requester is None:
        requester = urllib.request.urlopen
    payload={"model":MODEL,"messages":messages,"stream":False,
             "options":{"num_ctx":4096,"num_predict":240,"temperature":0.25},
             "think":False, "keep_alive":"3m"}
    raw=json.dumps(payload,ensure_ascii=False).encode("utf-8")
    req=urllib.request.Request(URL,data=raw,headers={"Content-Type":"application/json"},method="POST")
    with requester(req,timeout=200) as res:
        answer=json.loads(res.read().decode("utf-8"))
    s=answer.get("message",{}).get("content","").strip()
    if not s: raise RuntimeError("empty_model_response")
    if len(s)>2500: s=s[:2500]+" [truncated]"
    return s

def safe_text(text):
    """Internal outputs never become verified claims or executable store commands."""
    # Do not retain obvious secrets; these guardrails complement secure workspace access.
    text=re.sub(r"(?i)(bearer\s+)[^\s]+",r"\1[REDACTED]",text)
    text=re.sub(r"(?i)(sk-[a-z0-9_-]{15,})","[REDACTED]",text)
    return text

def record(conn,cycle,sender,recipient,category,body):
    conn.execute("INSERT INTO messages(created_utc,cycle,sender,recipient,category,body,verified) VALUES (?,?,?,?,?,?,0)",
                 (utcnow(),cycle,sender,recipient,category,safe_text(body)))
    conn.commit()

def health_gate():
    health=load_json(RUNTIME/"latest-store-health.json")
    now=dt.datetime.now(dt.timezone.utc)
    try:
        t=dt.datetime.fromisoformat(health["checked_at_utc"].replace("Z","+00:00"))
        age=(now-t).total_seconds()
    except (TypeError,ValueError,KeyError,AttributeError): age=999999
    ok=0<=age<10800 and health.get("health")=="ok" and health.get("shop")=="Med Art"
    return health,ok

def execute(requester=None,db_path=DATABASE,role_override=None):
    team=load_json(HERE/"team.json")
    assert len(team.get("agents",[]))==9
    policy=team.get("policy",{})
    assert policy.get("spending_limit_usd")==0 and policy.get("external_writes_enabled")==False
    conn=db_open(db_path)
    last=conn.execute("SELECT COALESCE(MAX(id),0) FROM cycles").fetchone()[0]
    role=role_override or team["agents"][last%9]["id"]
    if role not in NEXT: raise RuntimeError("unknown_agent")
    health,fresh=health_gate()
    stamp=utcnow()
    result={"timestamp_utc":stamp,"role":role,"model":MODEL,"store_health":health.get("health","unknown"),
            "audit_recent":fresh,"external_actions":0,"spend_usd":0,
            "status":"model_pending","messages_sent":0}
    conn.execute("INSERT INTO cycles(created_utc,role,model,outcome,details) VALUES (?,?,?,?,?)",
                 (stamp,role,MODEL,"started",""))
    conn.commit()
    cycle=conn.execute("SELECT MAX(id) FROM cycles").fetchone()[0]
    # Never expose bank/customer identity. No API/MCP write tools are present in this runner.
    recent=conn.execute("SELECT sender,body FROM messages WHERE recipient IN (?, 'Cavalry') AND id < ? ORDER BY id DESC LIMIT 4",
                        (role,10**15)).fetchall()
    note="\n".join((r[0]+": "+r[1][:350]) for r in reversed(recent))
    state=("VERIFIED recent read-only Med Art shop health; "+str(health.get("site_status"))+
           "; payout "+str(health.get("payout_status"))+
           "; offers "+str(health.get("offer_count"))) if fresh else "SHOP AUDIT STALE/UNHEALTHY: no current claims allowed"
    sup_prompt=("You are Cavalry, the coordinator of a zero-budget Fourthwall POD concept store. "
                "Assign a SHORT, specific, internal-only draft task to specialist "+role+". "
                "No customer contact, publication, sales, ads, spend, banking or pricing without verified facts. "
                "Store: "+state+". Current role task: "+DELIVERABLES[role]+
                ". Say one sentence for assignment only.")
    try:
        assignment=talk([{"role":"system","content":"Cavalry is a coordinating AI, not an authorized buyer or merchant."},
                         {"role":"user","content":sup_prompt}],requester=requester)
        record(conn,cycle,"Cavalry",role,"assignment",assignment)
        context=("You are "+role.upper()+", an independent specialist in the Med Art POD team reporting to Cavalry. "
                 "Task: "+DELIVERABLES[role]+". Store status: "+state+". "
                 "Use previous agent handoffs only as unverified drafts. "
                 "No real-world effects: do not publish, send emails, claim sales, spend, collect customer data, or invent verified facts. "
                 "Write one short useful DRAFT (max 150 words), tagged DRAFT and with 1 handoff instruction to "+NEXT[role]+".")
        reply=talk([{"role":"system","content":context},
                    {"role":"user","content":"Cavalry assignment: "+assignment+"\nPrevious agent messages:\n"+note}],requester=requester)
        next_role=NEXT[role]
        record(conn,cycle,role,next_role,"handoff_draft",reply)
        record(conn,cycle,role,"Cavalry","report_draft",reply)
        result.update(status="two_way_ai_communication_passed",messages_sent=3,
                      supervisor_assignment=assignment,agent_draft=reply,handed_to=next_role)
    except (Exception) as exc:
        # Do not fake agent completions after Ollama errors.
        result.update(status="blocked_inference",error=type(exc).__name__+":"+str(exc)[:180])
        record(conn,cycle,"system","Cavalry","failure",result["error"])
    conn.execute("UPDATE cycles SET outcome=?, details=? WHERE id=?",
                 (result["status"],json.dumps({k:v for k,v in result.items() if k!="agent_draft"}),cycle))
    conn.commit()
    RUNTIME.mkdir(parents=True,exist_ok=True)
    (RUNTIME/"latest-agent-communication.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    conn.close()
    return result

if __name__=="__main__":
    r=execute(role_override=sys.argv[1] if len(sys.argv)>1 else None)
    print(json.dumps({"role":r["role"],"status":r["status"],"sent":r["messages_sent"],
                      "handoff":r.get("handed_to"),"model":r["model"]}))
    sys.exit(0 if r["status"]=="two_way_ai_communication_passed" else 1)
