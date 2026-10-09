"""Cavalry Shopify API monitor. Read-only, zero dependencies, fail-closed."""
from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path
import re
import tempfile
import urllib.error
import urllib.request

RUNTIME = Path(__file__).resolve().parents[1] / "runtime"
HEALTH_FILE = RUNTIME / "latest-shopify-health.json"
API_VERSION = "2026-07"
DOMAIN_PATTERN = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,59}[a-z0-9])?\.myshopify\.com$")
QUERY = "query CavalryReadOnly { shop { name myshopifyDomain } productsCount { count } }"


def validated_domain(raw: str) -> str:
    """Prevent forwarding the credential to non-Shopify URLs or subdomains."""
    host = raw.strip().lower()
    if len(host) > 100 or not DOMAIN_PATTERN.fullmatch(host):
        raise ValueError("invalid_shopify_domain")
    return host


def fetch_shop_snapshot(domain: str, token: str, opener=None) -> dict:
    """Makes only a GraphQL query (no mutations); returns aggregates, never customers."""
    host = validated_domain(domain)
    if not token or len(token) > 1000 or any(c.isspace() for c in token):
        raise ValueError("invalid_shopify_token")
    if opener is None:
        opener = urllib.request.urlopen
    request = urllib.request.Request(
        f"https://{host}/admin/api/{API_VERSION}/graphql.json",
        data=json.dumps({"query": QUERY}).encode("utf-8"),
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": token},
        method="POST",
    )
    with opener(request, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, dict) or payload.get("errors"):
        raise ValueError("shopify_api_or_scope_error")
    data = payload.get("data")
    if not isinstance(data, dict):
        raise ValueError("shopify_incomplete_data")
    shop = data.get("shop")
    products = data.get("productsCount")
    if not isinstance(shop, dict) or not isinstance(products, dict):
        raise ValueError("shopify_incomplete_data")
    canonical = validated_domain(str(shop.get("myshopifyDomain") or ""))
    count = products.get("count")
    if canonical != host or type(count) is not int or count < 0:
        raise ValueError("shopify_inconsistent_response")
    name = shop.get("name")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("shopify_incomplete_data")
    return {"shop_name": name[:100], "shop_domain": canonical, "product_count": count}


def _write_atomic(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as temp:
        json.dump(payload, temp, ensure_ascii=False, indent=2)
        temp.write("\n")
        name = temp.name
    os.replace(name, path)


def audit(environ=None, opener=None, output_file: Path = HEALTH_FILE) -> dict:
    """No financial or fulfillment writes, no token persistence, no fake success on failure."""
    if environ is None:
        environ = os.environ
    result = {
        "checked_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "channel": "shopify",
        "leader": "Cavalry",
        "status": "blocked_store_connection",
        "authorized_api_read": False,
        "external_writes": 0,
        "spend_usd": 0,
        "launch_ready": False,
        "ai_staff_running": False,
    }
    domain = environ.get("SHOPIFY_SHOP_DOMAIN", "")
    token = environ.get("SHOPIFY_ADMIN_ACCESS_TOKEN", "")
    if domain and token:
        try:
            snapshot = fetch_shop_snapshot(domain, token, opener=opener)
        except (ValueError, OSError, urllib.error.URLError, UnicodeError, json.JSONDecodeError, KeyError, TypeError):
            result["status"] = "blocked_shopify_api_validation"
        else:
            result.update(snapshot)
            result["status"] = "connected_read_only"
            result["authorized_api_read"] = True
    _write_atomic(output_file, result)
    return result


if __name__ == "__main__":
    status = audit()
    print(json.dumps({key: status[key] for key in
                      ("channel", "status", "authorized_api_read", "launch_ready", "external_writes")}))
    raise SystemExit(0 if status["authorized_api_read"] else 2)
