# ContextIQ

ContextIQ is a Next.js + Supabase demo app for logging daily activity and generating behavior suggestions with a simple ML + LLM pipeline.

## Stack

- Frontend/API: Next.js + TypeScript
- Data store: Supabase (`activity_logs`, `daily_summaries`, `pattern_findings`, `suggestions`)
- ML scripts: Python + scikit-learn in `ml/`

## Setup

1. Install app dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for server aggregation/suggestions pipeline routes)
- `OPENAI_API_KEY` (required for LLM suggestion generation)

3. Run SQL migration in Supabase dashboard:
- `supabase/migrations/20260505_contextiq_pipeline.sql`

4. Start app:

```bash
npm run dev
```

## End-to-End Pipeline

1. Users log events to `activity_logs` on `/log`.
2. Dashboard trigger calls `/api/pipeline/aggregate` to upsert `daily_summaries`.
3. Dashboard trigger calls `/api/pipeline/infer` (runs Python inference script when available) to write `pattern_findings`.
4. Dashboard trigger calls `/api/suggestions/generate` to create/cached `suggestions` via `gpt-4o-mini`.
5. `/suggestions` renders database-backed suggestions.

## Pilot Evaluation Flow (Tonight)

1. Three users log real activities during the day in `/log`.
2. Run ML setup and training once:
   - Follow `ml/README.md` setup
   - `python ml/generate_synthetic_data.py`
   - `python ml/train_model.py`
3. For each day to evaluate:
   - Click **Run pipeline for selected date** on `/dashboard`
   - If Python cannot be run from API route, run manually:
     - `python ml/infer_from_supabase.py --date YYYY-MM-DD`
   - Re-run dashboard pipeline button (or generate suggestion route) to create suggestions
4. Capture screenshots from `/dashboard` and `/suggestions`.
5. Compare predicted pattern labels with each participant’s subjective daily self-label.

## Presentation Artifacts

- `ml/artifacts/pattern_classifier.joblib`
- `ml/artifacts/confusion_matrix.png`
- `ml/artifacts/feature_importances.png`
- `ml/artifacts/classification_report.txt`

## Important Limitation

The current classifier is trained on synthetic, intentionally separable data to make the demo pipeline dependable by deadline. Accuracy metrics are valid for synthetic evaluation only and should be presented transparently as such.
