import datetime as dt
import json
import pathlib
import sys
import tempfile
import unittest
sys.path.insert(0,str(pathlib.Path(__file__).parent))
import team_runner as t

class TeamTests(unittest.TestCase):
    def test_team(self):
        x=t.read_json(t.ROOT/"team.json")
        self.assertEqual(x["leader"],"Cavalry")
        self.assertEqual(len(x["agents"]),9)
        self.assertEqual(len(set(a["id"] for a in x["agents"])),9)
        self.assertEqual(x["policy"]["spending_limit_usd"],0)
        self.assertFalse(x["policy"]["external_writes_enabled"])
    def test_margin(self):
        self.assertEqual(t.contribution(20,10,1,2,1),6)
        self.assertEqual(t.contribution(10,11,1),-2)
        with self.assertRaises(ValueError): t.contribution(-1,1,0)
    def test_fail_closed(self):
        orig=t.RUNTIME
        with tempfile.TemporaryDirectory() as tmp:
            t.RUNTIME=pathlib.Path(tmp)
            try:
                data=t.run()
                self.assertFalse(data["launch_ready"])
                self.assertEqual(len(data["jobs"]),9)
                self.assertEqual(data["external_actions"],0)
                self.assertFalse(data["ai_model_connected"])
                self.assertTrue((t.RUNTIME/"latest-team-cycle.json").exists())
            finally:t.RUNTIME=orig

if __name__=="__main__":unittest.main()
