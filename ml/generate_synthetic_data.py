"""
Generate synthetic daily behavior samples for ContextIQ demo.

WARNING:
This data is intentionally synthetic and pattern-separable so a simple model can
learn clearly for presentation purposes. It is not representative of real-world
behavior complexity and should not be treated as production validity evidence.
"""

from __future__ import annotations

import math
from pathlib import Path
from random import Random
from typing import Dict, List

import pandas as pd

OUTPUT_PATH = Path(__file__).parent / "data" / "synthetic_daily_samples.csv"
LABELS = ["routine", "study_block", "distraction", "drop_off", "none"]


def jitter(rng: Random, value: float, width: float) -> float:
    return max(0, value + rng.uniform(-width, width))


def make_row(rng: Random, label: str) -> Dict[str, float | str]:
    if label == "routine":
        total = jitter(rng, 780, 60)
        study = jitter(rng, 260, 35)
        productivity = jitter(rng, 240, 35)
        social = jitter(rng, 120, 30)
        entertainment = jitter(rng, 110, 30)
        travel = jitter(rng, 50, 20)
        switches = jitter(rng, 8, 2)
        longest = jitter(rng, 120, 20)
        morning, afternoon, evening, night = (
            jitter(rng, 210, 25),
            jitter(rng, 250, 25),
            jitter(rng, 230, 25),
            jitter(rng, 90, 20),
        )
    elif label == "study_block":
        total = jitter(rng, 720, 70)
        study = jitter(rng, 430, 40)
        productivity = jitter(rng, 180, 30)
        social = jitter(rng, 45, 18)
        entertainment = jitter(rng, 40, 16)
        travel = jitter(rng, 25, 12)
        switches = jitter(rng, 4, 1.5)
        longest = jitter(rng, 250, 30)
        morning, afternoon, evening, night = (
            jitter(rng, 130, 22),
            jitter(rng, 300, 30),
            jitter(rng, 230, 25),
            jitter(rng, 60, 15),
        )
    elif label == "distraction":
        total = jitter(rng, 680, 90)
        study = jitter(rng, 70, 25)
        productivity = jitter(rng, 110, 35)
        social = jitter(rng, 150, 35)
        entertainment = jitter(rng, 280, 45)
        travel = jitter(rng, 70, 20)
        switches = jitter(rng, 16, 3)
        longest = jitter(rng, 70, 20)
        morning, afternoon, evening, night = (
            jitter(rng, 100, 20),
            jitter(rng, 180, 25),
            jitter(rng, 220, 35),
            jitter(rng, 180, 35),
        )
    elif label == "drop_off":
        total = jitter(rng, 290, 70)
        study = jitter(rng, 50, 25)
        productivity = jitter(rng, 45, 20)
        social = jitter(rng, 65, 25)
        entertainment = jitter(rng, 95, 35)
        travel = jitter(rng, 25, 10)
        switches = jitter(rng, 3, 1.5)
        longest = jitter(rng, 80, 20)
        morning, afternoon, evening, night = (
            jitter(rng, 40, 16),
            jitter(rng, 70, 20),
            jitter(rng, 85, 25),
            jitter(rng, 95, 25),
        )
    else:
        total = jitter(rng, 560, 130)
        study = jitter(rng, 150, 60)
        productivity = jitter(rng, 130, 60)
        social = jitter(rng, 120, 60)
        entertainment = jitter(rng, 120, 70)
        travel = jitter(rng, 40, 25)
        switches = jitter(rng, 9, 5)
        longest = jitter(rng, 140, 60)
        morning, afternoon, evening, night = (
            jitter(rng, 120, 50),
            jitter(rng, 170, 60),
            jitter(rng, 170, 60),
            jitter(rng, 100, 50),
        )

    productive = study + productivity
    productive_ratio = productive / total if total > 0 else 0

    row = {
        "label": label,
        "total_minutes": round(total, 2),
        "switch_count": round(switches, 2),
        "longest_session_minutes": round(longest, 2),
        "productive_minutes": round(productive, 2),
        "productive_ratio": round(productive_ratio, 4),
        "tod_morning_minutes": round(morning, 2),
        "tod_afternoon_minutes": round(afternoon, 2),
        "tod_evening_minutes": round(evening, 2),
        "tod_night_minutes": round(night, 2),
        "study_minutes": round(study, 2),
        "social_minutes": round(social, 2),
        "entertainment_minutes": round(entertainment, 2),
        "productivity_minutes": round(productivity, 2),
        "travel_minutes": round(travel, 2),
    }

    active_categories = [
        row["study_minutes"],
        row["social_minutes"],
        row["entertainment_minutes"],
        row["productivity_minutes"],
        row["travel_minutes"],
    ]
    row["category_count"] = sum(1 for x in active_categories if x > 20)
    probs = [x / sum(active_categories) for x in active_categories if x > 0]
    entropy = -sum(p * math.log2(p) for p in probs if p > 0)
    row["category_entropy"] = round(entropy, 6)
    return row


def main() -> None:
    rng = Random(42)
    rows: List[Dict[str, float | str]] = []
    per_label_count = 320

    for label in LABELS:
        for _ in range(per_label_count):
            rows.append(make_row(rng, label))

    df = pd.DataFrame(rows)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote synthetic dataset: {OUTPUT_PATH} ({len(df)} rows)")


if __name__ == "__main__":
    main()
