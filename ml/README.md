# ContextIQ ML Pipeline (Demo)

This directory is intentionally isolated from the Next.js app.

## 1) Setup

```bash
cd ml
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

Create `ml/.env` from `.env.example` and add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2) Generate synthetic training data

```bash
python generate_synthetic_data.py
```

This writes `ml/data/synthetic_daily_samples.csv`.

## 3) Train classifier and export artifacts

```bash
python train_model.py
```

Artifacts are written to `ml/artifacts/`:
- `pattern_classifier.joblib`
- `confusion_matrix.png`
- `feature_importances.png`
- `classification_report.txt`

## 4) Run inference on real daily summaries

```bash
python infer_from_supabase.py --date 2026-05-05
```

Or batch latest rows:

```bash
python infer_from_supabase.py --limit 30
```

This writes rows into `pattern_findings` (idempotent by `daily_summary_id + model_version`).

## Important limitation

The model is trained on synthetic, intentionally separable data to create dependable demo output quickly. Evaluation metrics should be presented as synthetic benchmark metrics, not production readiness evidence.
