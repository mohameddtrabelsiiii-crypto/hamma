"""No-cost, no-network tests for the local Cavalry draft screening path."""
import io
import json
import pathlib
import sqlite3
import tempfile
import autonomous_team as at
from content_guard import review_draft

class FakeResponse:
    def __init__(self,content): self.content=content
    def read(self): return json.dumps({"message":{"content":self.content}}).encode("utf-8")
    def __enter__(self):return self
    def __exit__(self,*args):return None

def run_case(unsafe):
    replies=(["Shop now at our verified health-focused local artist limited edition shop!",
              "Order now! Buy this limited edition piece from our verified health-focused creators."]
             if unsafe else
             ["Prepare an internal original abstract art process draft for prelaunch.",
              "DRAFT: We are exploring a minimal circular illustration in original art. Which palette do you prefer? Handoff to Beacon."])
    seen=[]
    def requester(req,timeout=10):
        seen.append(req.data.decode("utf-8"))
        return FakeResponse(replies[len(seen)-1])
    with tempfile.TemporaryDirectory(prefix="cavalry_guard_") as folder:
        old_runtime,old_gate=at.RUNTIME,at.health_gate
        at.RUNTIME=pathlib.Path(folder)
        at.health_gate=lambda:({"shop":"Med Art","health":"ok","site_status":"COMING_SOON","payout_status":"INACTIVE","offer_count":3},True)
        try:
            result=at.execute(requester=requester,db_path=pathlib.Path(folder)/"test.sqlite",role_override="pulse")
            conn=sqlite3.connect(pathlib.Path(folder)/"test.sqlite")
            bodies=[x[0] for x in conn.execute("SELECT body FROM messages")]
            categories=[x[0] for x in conn.execute("SELECT category FROM messages")]
            conn.close()
            assert result["messages_sent"]==3 and result["external_actions"]==0
            assert len(seen)==2 and len(bodies)==3
            if unsafe:
                assert result["status"]=="draft_rejected",result
                assert "prelaunch_sales_call_to_action" in result["rejected_flags"]
                assert "rejected_handoff_notice" in categories
                assert not any("Shop now" in b or "Order now" in b for b in bodies)
                assert "verified health-focused local artist" not in seen[1]
            else:
                assert result["status"]=="two_way_ai_communication_passed",result
                assert "handoff_draft" in categories
        finally:
            at.RUNTIME,at.health_gate=old_runtime,old_gate

assert review_draft("Shop now — verified health-focused local artists, limited edition!", "COMING_SOON","INACTIVE")
assert review_draft("Exploring original abstract illustrations before our shop opens.","COMING_SOON","INACTIVE")==[]
run_case(True)
run_case(False)
print("CAVALRY_DRAFT_PIPELINE_TESTS_OK rejected_unsafe_and_accepted_safe")

[executed on device: DESKTOP-ADP8R8D (c08082c0-0c59-4745-87d9-daa8ea58fccb)]