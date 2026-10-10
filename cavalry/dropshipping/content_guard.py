"""Deterministic pre-publication safety check for Cavalry's draft-only local agents.

Fail closed on unsupported sales, origin, scarcity and health claims. This module
never publishes content or has network access. False positives require review,
not an automated bypass.
"""
import re

RULES = (
    ("unsupported_verification", r"\b(?:verified\s+(?:shop|store|health|creator|seller|artist)|fully\s+verified)\b"),
    ("unsupported_health_positioning", r"\b(?:health[- ]focused|medical[- ]grade|clinically\s+proven|health\s+benefits?|improves?\s+health|heals?\s+you)\b"),
    ("unverified_scarcity", r"\b(?:limited[- ]edition|only\s+\d+\s+left|selling\s+fast|last\s+chance|almost\s+sold\s+out)\b"),
    ("unverified_artist_origin", r"\b(?:support\s+local\s+artists|handmade\s+by\s+local\s+artists|certified\s+local\s+artists)\b"),
    ("unsupported_reputation", r"\b(?:bestseller|best[- ]seller|5[- ]star\s+reviews?|thousands\s+of\s+(?:happy\s+)?customers)\b"),
    ("unsupported_delivery", r"\b(?:guaranteed\s+delivery|ships?\s+tomorrow|free\s+overnight\s+shipping)\b"),
)
PRELAUNCH_SALES = r"\b(?:shop\s+now|buy\s+now|order\s+now|checkout\s+now|click\s+to\s+buy|available\s+to\s+order|on\s+sale\s+now)\b"


def review_draft(text, site_status="COMING_SOON", payout_status="INACTIVE"):
    if not isinstance(text, str) or not text.strip():
        return ["empty_draft"]
    flags = [label for label, pattern in RULES if re.search(pattern, text, re.I)]
    if str(site_status).upper() != "LIVE" or str(payout_status).upper() != "ACTIVE":
        if re.search(PRELAUNCH_SALES, text, re.I):
            flags.append("prelaunch_sales_call_to_action")
    return flags


def rejection_notice(flags, recipient):
    """No rejected marketing copy is forwarded to another agent."""
    valid=",".join(sorted(set(flags)))[:250]
    return (
        "DRAFT REJECTED BY PRELAUNCH SAFETY GATE: " + valid +
        ". Evidence is missing. Store remains prelaunch and payouts inactive. "
        "Do not publish or reuse rejected claims. Redraft using accurate, "
        "noncommercial art-process language; request verified proof for any claims. "
        "Handoff: " + recipient + "."
    )


if __name__ == "__main__":
    examples = [
        ("Join the art lovers! Shop now, verified health-focused limited edition. Support local artists!", True),
        ("DRAFT: Exploring an original abstract line pattern before our shop opens. Which version do you prefer?", False),
    ]
    for sample, should_reject in examples:
        flags=review_draft(sample)
        assert bool(flags) == should_reject, (sample,flags)
    print("CAVALRY_GUARD_SELFTEST_OK")

[executed on device: DESKTOP-ADP8R8D (c08082c0-0c59-4745-87d9-daa8ea58fccb)]