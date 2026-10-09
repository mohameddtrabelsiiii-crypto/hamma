"""Offline tests for a Shopify connector that never writes to merchant resources."""
import json
from pathlib import Path
import tempfile
import unittest

import shopify_audit as mod


class Reply:
    def __init__(self, body):
        self.body = json.dumps(body).encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.body


class ShopifyAuditTests(unittest.TestCase):
    def test_domain_is_not_a_general_http_target(self):
        for bad in [
            "https://sample.myshopify.com",
            "sample.myshopify.com.evil.com",
            "sample.myshopify.com:443",
            "sample.myshopify.com/path",
            "sample..myshopify.com",
            "sample.myshopify.com@other.example",
            "127.0.0.1",
        ]:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                mod.validated_domain(bad)

    def test_missing_credentials_stays_blocked(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "health.json"
            report = mod.audit(environ={}, output_file=file)
            self.assertEqual(report["status"], "blocked_store_connection")
            self.assertFalse(report["launch_ready"])
            self.assertEqual(report["external_writes"], 0)
            self.assertNotIn("token", file.read_text())

    def test_verified_api_read_never_implies_live_launch(self):
        calls = []

        def opener(req, timeout):
            calls.append(req)
            self.assertEqual(timeout, 15)
            self.assertEqual(req.get_method(), "POST")
            self.assertEqual(req.full_url, "https://sample.myshopify.com/admin/api/2026-07/graphql.json")
            self.assertNotIn("mutation", req.data.decode("utf-8").lower())
            return Reply({"data": {"shop": {"name": "Demo", "myshopifyDomain": "sample.myshopify.com"},
                                    "productsCount": {"count": 3}}})

        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "health.json"
            result = mod.audit(
                environ={"SHOPIFY_SHOP_DOMAIN": "sample.myshopify.com",
                         "SHOPIFY_ADMIN_ACCESS_TOKEN": "test-only-credential"},
                opener=opener, output_file=file)
            self.assertEqual(result["status"], "connected_read_only")
            self.assertEqual(result["product_count"], 3)
            self.assertFalse(result["launch_ready"])
            self.assertEqual(result["external_writes"], 0)
            self.assertEqual(len(calls), 1)
            self.assertNotIn("test-only-credential", file.read_text())

    def test_graphql_error_is_not_logged_or_treated_as_success(self):
        def opener(req, timeout):
            return Reply({"errors": [{"message": "secret: must not leak"}]})
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "health.json"
            result = mod.audit(
                environ={"SHOPIFY_SHOP_DOMAIN": "sample.myshopify.com",
                         "SHOPIFY_ADMIN_ACCESS_TOKEN": "test-only-credential"},
                opener=opener, output_file=file)
            self.assertEqual(result["status"], "blocked_shopify_api_validation")
            self.assertNotIn("secret", file.read_text())


if __name__ == "__main__":
    unittest.main()
