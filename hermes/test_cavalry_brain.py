"""Offline tests for Cavalry's strictly bounded action selector."""
import io
import json
import unittest
from unittest.mock import patch
import cavalry_brain as brain

class TestCavalryBrain(unittest.TestCase):
    def response(self, value):
        return io.BytesIO(json.dumps({"response": value}).encode("utf-8"))

    def test_model_selects_single_allowed_action(self):
        with patch("urllib.request.urlopen", return_value=self.response("SITE")):
            self.assertEqual(brain.select_action({"blocked": 5}), ("SITE", "local_ollama"))

    def test_model_extra_text_with_one_action(self):
        with patch("urllib.request.urlopen", return_value=self.response("I select QA for this check.")):
            self.assertEqual(brain.select_action({}), ("QA", "local_ollama"))

    def test_model_ambiguous_fails_closed(self):
        with patch("urllib.request.urlopen", return_value=self.response("Maybe QA or SITE")):
            action, origin = brain.select_action({})
            self.assertEqual(action, "QA")
            self.assertEqual(origin, "invalid_model_output_fallback")

    def test_network_failure_fails_closed(self):
        with patch("urllib.request.urlopen", side_effect=TimeoutError()):
            action, origin = brain.select_action({})
            self.assertEqual(action, "QA")
            self.assertTrue(origin.startswith("model_unavailable_fallback_"))

    def test_unknown_action_rejected(self):
        with self.assertRaises(ValueError):
            brain.perform("SEND_EMAIL")

    def test_queue_read_only(self):
        result = brain.perform("QUEUE")
        self.assertEqual(result["action"], "QUEUE")
        self.assertFalse(result["customer_orders_verified"])
        self.assertIsInstance(result["pending_manifests"], int)

if __name__ == "__main__":
    unittest.main()
