"""Discoverable regression tests for Cavalry's draft-only safety gate."""
import pathlib
import subprocess
import sys
import unittest

from content_guard import review_draft

HERE = pathlib.Path(__file__).resolve().parent


class CavalryGuardRegressionTests(unittest.TestCase):
    def test_prelaunch_purchase_ctas_are_rejected(self):
        for phrase in ("Shop now", "Buy today", "Add to cart", "Ready to order"):
            with self.subTest(phrase=phrase):
                self.assertIn("prelaunch_sales_call_to_action", review_draft(phrase))

    def test_unsupported_claims_are_rejected(self):
        cases = {
            "verified shop": "unsupported_verification",
            "clinically proven": "unsupported_health_positioning",
            "limited edition": "unverified_scarcity",
            "support local artists": "unverified_artist_origin",
            "thousands of happy customers": "unsupported_reputation",
            "guaranteed delivery": "unsupported_delivery",
        }
        for phrase, flag in cases.items():
            with self.subTest(phrase=phrase):
                self.assertIn(flag, review_draft(phrase))

    def test_safe_prelaunch_copy_is_accepted(self):
        self.assertEqual([], review_draft(
            "DRAFT: Exploring a geometric abstract artwork. Which palette do you prefer?"
        ))

    def test_existing_pipeline_integration_suite_passes(self):
        completed = subprocess.run(
            [sys.executable, str(HERE / "test_content_guard.py")],
            cwd=str(HERE), capture_output=True, text=True, timeout=90,
            check=False,
        )
        self.assertEqual(0, completed.returncode,
                         completed.stdout + completed.stderr)
        self.assertIn("CAVALRY_DRAFT_PIPELINE_TESTS_OK", completed.stdout)


if __name__ == "__main__":
    unittest.main()
