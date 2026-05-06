from __future__ import annotations

from math import log2
from typing import Dict, Iterable, List

PRODUCTIVE_CATEGORIES = {"study", "productivity"}
FEATURE_COLUMNS = [
    "total_minutes",
    "switch_count",
    "longest_session_minutes",
    "productive_minutes",
    "productive_ratio",
    "tod_morning_minutes",
    "tod_afternoon_minutes",
    "tod_evening_minutes",
    "tod_night_minutes",
    "study_minutes",
    "social_minutes",
    "entertainment_minutes",
    "productivity_minutes",
    "travel_minutes",
    "category_count",
    "category_entropy",
]


def category_entropy(category_minutes: Dict[str, float]) -> float:
    total = sum(max(v, 0) for v in category_minutes.values())
    if total <= 0:
        return 0.0
    entropy = 0.0
    for value in category_minutes.values():
        if value <= 0:
            continue
        p = value / total
        entropy -= p * log2(p)
    return round(entropy, 6)


def feature_row_from_daily_summary(summary: Dict) -> Dict[str, float]:
    category_minutes = summary.get("category_minutes") or {}
    if isinstance(category_minutes, str):
        category_minutes = {}

    row = {
        "total_minutes": float(summary.get("total_minutes", 0) or 0),
        "switch_count": float(summary.get("switch_count", 0) or 0),
        "longest_session_minutes": float(summary.get("longest_session_minutes", 0) or 0),
        "productive_minutes": float(summary.get("productive_minutes", 0) or 0),
        "productive_ratio": float(summary.get("productive_ratio", 0) or 0),
        "tod_morning_minutes": float(summary.get("tod_morning_minutes", 0) or 0),
        "tod_afternoon_minutes": float(summary.get("tod_afternoon_minutes", 0) or 0),
        "tod_evening_minutes": float(summary.get("tod_evening_minutes", 0) or 0),
        "tod_night_minutes": float(summary.get("tod_night_minutes", 0) or 0),
        "study_minutes": float(category_minutes.get("study", 0) or 0),
        "social_minutes": float(category_minutes.get("social", 0) or 0),
        "entertainment_minutes": float(category_minutes.get("entertainment", 0) or 0),
        "productivity_minutes": float(category_minutes.get("productivity", 0) or 0),
        "travel_minutes": float(category_minutes.get("travel", 0) or 0),
        "category_count": float(len([k for k, v in category_minutes.items() if (v or 0) > 0])),
        "category_entropy": category_entropy(category_minutes),
    }
    return row


def rows_from_daily_summaries(summaries: Iterable[Dict]) -> List[Dict[str, float]]:
    return [feature_row_from_daily_summary(summary) for summary in summaries]
