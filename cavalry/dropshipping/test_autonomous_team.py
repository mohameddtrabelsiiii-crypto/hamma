"""Regression test: genuine role dispatch plumbing, zero-spend and persistent handoffs."""
import json
import pathlib
import sqlite3
import sys
import tempfile
import unittest
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import autonomous_team as a

class FakeResponse:
    def __init__(self,data): self.payload=json.dumps({"message":{"content":data}}).encode()
    def __enter__(self): return self
    def __exit__(self,*args): return False
    def read(self): return self.payload

class CommerceTests(unittest.TestCase):
    def test_real_inference_request_pattern_and_mailbox(self):
        calls=[]
        def fake(req,timeout):
            calls.append(json.loads(req.data.decode()))
            return FakeResponse("DRAFT: A safe original design research checklist, handoff to the next worker.")
        with tempfile.TemporaryDirectory() as tmp:
            r=a.execute(requester=fake,db_path=pathlib.Path(tmp)/"test.sqlite3",role_override="atlas")
            self.assertEqual(r["status"],"two_way_ai_communication_passed")
            self.assertEqual(r["messages_sent"],3)
            self.assertEqual(len(calls),2)
            self.assertTrue(all(c["model"]==a.MODEL for c in calls))
            self.assertTrue(all("tools" not in c for c in calls))
            conn=sqlite3.connect(pathlib.Path(tmp)/"test.sqlite3")
            out=conn.execute("SELECT sender,recipient,verified FROM messages ORDER BY id").fetchall()
            self.assertEqual(out,[("Cavalry","atlas",0),("atlas","muse",0),("atlas","Cavalry",0)])
            self.assertEqual(r["external_actions"],0)
            self.assertEqual(r["spend_usd"],0)
            conn.close()

    def test_fail_closed_on_inference_problem(self):
        def dead(req,timeout): raise ConnectionError("offline")
        with tempfile.TemporaryDirectory() as tmp:
            r=a.execute(requester=dead,db_path=pathlib.Path(tmp)/"test.sqlite3",role_override="muse")
            self.assertEqual(r["status"],"blocked_inference")
            self.assertEqual(r["external_actions"],0)
            self.assertEqual(r["messages_sent"],0)

if __name__=="__main__": unittest.main()
