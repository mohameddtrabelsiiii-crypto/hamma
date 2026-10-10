"""Cavalry Med Art: zero-spend, safe local shift coordinator (Python stdlib only).

This builds internal task queues; it does NOT call an LLM, publish listings,
send messages, handle money, or imply a trained model is online.
"""
import datetime as dt
import json
import os
import pathlib
import tempfile

ROOT=pathlib.Path(__file__).resolve().parent
RUNTIME=ROOT.parent/"runtime"

def read_json(path, default=None):
    try: return json.loads(path.read_text(encoding="utf-8"))
    except (OSError,ValueError): return default if default is not None else {}

def write_json(path, data):
    path.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.NamedTemporaryFile("w",encoding="utf-8",dir=path.parent,delete=False) as f:
        json.dump(data,f,indent=2,ensure_ascii=False)
        f.write("\n")
        tmp=f.name
    try:
        os.replace(tmp,path)
    except PermissionError:
        # Windows may deny replacing a file held open by another process.
        # This is a local, non-critical status snapshot; use a direct write fallback.
        try:
            with path.open("w",encoding="utf-8") as dest:
                json.dump(data,dest,indent=2,ensure_ascii=False)
                dest.write("\n")
        finally:
            pathlib.Path(tmp).unlink(missing_ok=True)

def contribution(price,base,processing,shipping=0,reserve=0,taxes=0,ads=0):
    values=(price,base,processing,shipping,reserve,taxes,ads)
    if any(not isinstance(x,(int,float)) or x<0 for x in values):
        raise ValueError("All cost values must be known nonnegative numbers")
    return round(price-sum(values[1:]),2)

def run():
    team=read_json(ROOT/"team.json")
    policy=team["policy"]
    if policy["spending_limit_usd"]!=0 or policy["external_writes_enabled"] or policy["unapproved_outreach_enabled"]:
        raise RuntimeError("Policy mismatch: fail closed")
    roles=team["agents"]
    if len(roles)!=9 or len({x["id"] for x in roles})!=9:
        raise RuntimeError("Incomplete team")
    now=dt.datetime.now(dt.timezone.utc)
    health=read_json(RUNTIME/"latest-store-health.json")
    try: age=(now-dt.datetime.fromisoformat(health["checked_at_utc"].replace("Z","+00:00"))).total_seconds()/3600
    except (ValueError,KeyError,TypeError,AttributeError): age=999
    fresh=0<=age<=3 and health.get("health")=="ok"
    gates={
      "authenticated_recent_shop_audit":fresh,
      "active_verified_payout":fresh and str(health.get("payout_status","")).upper()=="ACTIVE",
      # Count of offers is NOT evidence they are public, purchasable or stocked.
      # Med Art's three current Fourthwall offers are all HIDDEN and UNAVAILABLE.
      "three_sellable_pod_listings":False,
      "shop_public":fresh and str(health.get("site_status","")).upper() in ("LIVE","PUBLISHED","OPEN"),
      "verified_prices_and_contribution":False,
      "policies_and_checkout_tested":False,
      "appropriate_external_action_authorization":False
    }
    work={
      "atlas":("research_queue","Document ten sourced and dated non-spam art merchandise demand signals"),
      "muse":("design_briefs","Draft three legally original art directions with production-file requirements"),
      "forge":("listing_drafts","Draft shirt/mug/sticker listings without guessed base price or published inventory"),
      "ledger":("margin_review","Verify actual fees and costs before computing verified positive net contribution"),
      "pulse":("organic_content_queue","Create a week of helpful organic posts; do not publish automatically"),
      "beacon":("seo_measurement","Draft titles/meta and track evidence-based traffic, no fake conversion numbers"),
      "harbor":("support_playbook","Use factual shipping/support templates; no personal customer data in logs"),
      "sentinel":("compliance_review","Block unlicensed art, unsupported health claims, KYC gaps and unapproved writes"),
      "relay":("operations_check","Track watcher freshness, API errors, scheduler, uptime and retries")
    }
    jobs=[{"id":a["id"],"agent":a["name"],"title":a["title"],"deliverable":work[a["id"]][0],
           "instruction":work[a["id"]][1], "state":"QUEUED_INTERNAL_ONLY",
           "requires_external_write":False,
           "blocked_by":("store_watcher_unhealthy_or_stale" if not fresh else "needs_evidence_before_execution")}
           for a in roles]
    result={
      "checked_at_utc":now.isoformat(timespec="seconds"),"team_lead":"Cavalry",
      "shop":team["store"],"agents":len(jobs),"mode":"SAFE_PRELAUNCH",
      "ai_model_connected":False,"external_actions":0,"cost_usd":0,
      "store_health":health.get("health","missing"),"audit_is_fresh":fresh,
      "site_status":health.get("site_status","unknown"),
      "payout_status":health.get("payout_status","unknown"),
      "offer_count":health.get("offer_count"),
      "launch_ready":all(gates.values()),"launch_gates":gates,
      "blocked_gates":[k for k,v in gates.items() if not v],"jobs":jobs
    }
    RUNTIME.mkdir(parents=True,exist_ok=True)
    write_json(RUNTIME/"latest-team-cycle.json",result)
    lines=["# Cavalry Med Art daily team brief","",f"UTC: {result['checked_at_utc']}",
           f"Store audit: {result['store_health']}; payout: {result['payout_status']}",
           f"Launch ready: {result['launch_ready']}","",
           "## Blocked gates"]+["- "+x for x in result["blocked_gates"]]+["","## Assigned team work"]
    lines += ["- "+j["agent"]+": "+j["instruction"] for j in jobs]
    lines += ["","Internal planning only. No model inference, public publication, new spending, purchases, refunds or customer outreach."]
    (RUNTIME/("team-brief-"+now.date().isoformat()+".md")).write_text("\n".join(lines)+"\n",encoding="utf-8")
    return result

if __name__=="__main__":
    r=run()
    print(json.dumps({"leader":r["team_lead"],"roles":r["agents"],"audit":r["store_health"],
                      "blocked_gates":len(r["blocked_gates"]),"live":r["launch_ready"]}))

[executed on device: DESKTOP-ADP8R8D (c08082c0-0c59-4745-87d9-daa8ea58fccb)]