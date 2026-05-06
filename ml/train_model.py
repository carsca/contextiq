from __future__ import annotations

from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split

from features import FEATURE_COLUMNS

DATA_PATH = Path(__file__).parent / "data" / "synthetic_daily_samples.csv"
ARTIFACT_DIR = Path(__file__).parent / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "pattern_classifier.joblib"
CM_PATH = ARTIFACT_DIR / "confusion_matrix.png"
FEATURE_IMPORTANCE_PATH = ARTIFACT_DIR / "feature_importances.png"
REPORT_PATH = ARTIFACT_DIR / "classification_report.txt"
MODEL_VERSION = "rf_v1_synth"


def main() -> None:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Missing synthetic data at {DATA_PATH}. Run generate_synthetic_data.py first."
        )

    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLUMNS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    labels = sorted(df["label"].unique())
    report = classification_report(y_test, preds, digits=3)
    cm = confusion_matrix(y_test, preds, labels=labels)

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {"model": model, "feature_columns": FEATURE_COLUMNS, "model_version": MODEL_VERSION},
        MODEL_PATH,
    )

    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=labels,
        yticklabels=labels,
    )
    plt.title("ContextIQ Synthetic Confusion Matrix")
    plt.ylabel("True label")
    plt.xlabel("Predicted label")
    plt.tight_layout()
    plt.savefig(CM_PATH, dpi=180)
    plt.close()

    importance_df = pd.DataFrame(
        {"feature": FEATURE_COLUMNS, "importance": model.feature_importances_}
    ).sort_values("importance", ascending=False)

    plt.figure(figsize=(10, 6))
    sns.barplot(data=importance_df, x="importance", y="feature")
    plt.title("ContextIQ Feature Importances (RandomForest)")
    plt.tight_layout()
    plt.savefig(FEATURE_IMPORTANCE_PATH, dpi=180)
    plt.close()

    REPORT_PATH.write_text(
        "WARNING: Metrics are from synthetic, intentionally separable data.\n\n"
        + report
        + "\n",
        encoding="utf-8",
    )

    print("Model artifact:", MODEL_PATH)
    print("Confusion matrix:", CM_PATH)
    print("Feature importances:", FEATURE_IMPORTANCE_PATH)
    print("Classification report:", REPORT_PATH)
    print("\n" + report)


if __name__ == "__main__":
    main()
