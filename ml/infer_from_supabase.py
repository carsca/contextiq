from __future__ import annotations

import argparse
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

import joblib
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client

from features import FEATURE_COLUMNS, rows_from_daily_summaries

MODEL_PATH = Path(__file__).parent / "artifacts" / "pattern_classifier.joblib"


def confidence_from_probability(probability: float) -> str:
    if probability < 0.55:
        return "low"
    if probability < 0.75:
        return "medium"
    return "high"


def top_evidence(feature_importances, feature_row: Dict[str, float], top_n: int = 4):
    # Heuristic evidence approximation: importance * observed magnitude.
    weighted = []
    for feature, importance in zip(FEATURE_COLUMNS, feature_importances):
        value = float(feature_row.get(feature, 0) or 0)
        weighted.append((feature, float(importance) * abs(value), value))
    weighted.sort(key=lambda x: x[1], reverse=True)
    top = weighted[:top_n]
    return [
        {"feature": name, "value": round(value, 3), "score": round(score, 6)}
        for name, score, value in top
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", dest="activity_date", default=None)
    parser.add_argument("--limit", type=int, default=30)
    args = parser.parse_args()

    load_dotenv()
    load_dotenv(Path(__file__).parent / ".env", override=False)
    load_dotenv(Path(__file__).resolve().parents[1] / ".env.local", override=False)

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_key:
        raise RuntimeError(
            "Missing SUPABASE URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
        )

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model artifact missing: {MODEL_PATH}")

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    model_version = artifact.get("model_version", "rf_v1_synth")

    supabase = create_client(supabase_url, service_key)
    query = supabase.table("daily_summaries").select("*").order("activity_date", desc=True)
    if args.activity_date:
        datetime.strptime(args.activity_date, "%Y-%m-%d")
        query = query.eq("activity_date", args.activity_date)
    else:
        query = query.limit(args.limit)

    summary_rows = query.execute().data or []
    if not summary_rows:
        print("No daily summaries found for inference.")
        return

    features = rows_from_daily_summaries(summary_rows)
    X = pd.DataFrame(features)[FEATURE_COLUMNS]
    proba = model.predict_proba(X)
    pred_labels = model.predict(X)
    class_names = list(model.classes_)

    writes = 0
    for idx, summary in enumerate(summary_rows):
        summary_id = summary["id"]

        existing = (
            supabase.table("pattern_findings")
            .select("id")
            .eq("daily_summary_id", summary_id)
            .eq("model_version", model_version)
            .limit(1)
            .execute()
            .data
            or []
        )
        if existing:
            continue

        row_proba = proba[idx]
        pred = pred_labels[idx]
        pred_prob = float(row_proba[class_names.index(pred)])
        confidence = confidence_from_probability(pred_prob)
        evidence = {
            "method": "importance_times_value_heuristic",
            "top_features": top_evidence(model.feature_importances_, features[idx]),
            "synthetic_model_warning": "Model trained on synthetic data only.",
        }

        payload = {
            "daily_summary_id": summary_id,
            "pattern_type": pred,
            "prediction_probability": round(pred_prob, 4),
            "confidence_score": confidence,
            "model_version": model_version,
            "evidence": evidence,
        }
        supabase.table("pattern_findings").insert(payload).execute()
        writes += 1

    print(f"Processed {len(summary_rows)} summaries.")
    print(f"Inserted {writes} new pattern findings.")


if __name__ == "__main__":
    main()
