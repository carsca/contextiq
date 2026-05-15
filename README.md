# ContextIQ

ContextIQ is a Next.js app for logging what you did in a day, seeing a simple summary and charts, and optionally running a pipeline that turns that day into a pattern label and a short AI suggestion.

## Try it live

**[https://contextiq-eta.vercel.app/](https://contextiq-eta.vercel.app/)**

The deployed app is already connected to Supabase and OpenAI. Open it in your browser, log some activities, then use the dashboard to run the full pipeline without installing anything.

---

## How to use the app

1. **Activity log** (`/log`) — Pick category, location, start/end time, optional notes, and submit. Your entries show up in a timeline for today.

2. **Dashboard** (`/dashboard`) — Choose a calendar date. You’ll see totals, time by category and location, and a **Run pipeline for selected date** button. That button runs aggregation, then pattern inference (Python when available), then suggestion generation. After it finishes, you’ll see the latest pattern and suggestion for that date when they exist.

3. **Suggestions** (`/suggestions`) — Browse all generated suggestions and the pattern info they came from.

4. **Home** (`/`) — Short intro and links into the app.

5. **Settings** (`/settings`) — Placeholder for future options.

If **Run pipeline** can’t run the Python inference step on your machine or host, run inference from your machine with:

`python ml/infer_from_supabase.py --date YYYY-MM-DD`

(see **`ml/README.md`** for Python setup), then run the pipeline again from the dashboard or rely on the suggestion step once a finding exists.

---

## Run the code locally

**You need:** Node.js (LTS), npm, and the Supabase + OpenAI credentials the deployed app uses.

1. Clone the repo and open a terminal in the project root.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add a **`.env.local`** file with:

NEXT_PUBLIC_SUPABASE_URL=https://jxpocutuhwsfgmsayloy.supabase.co/rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cG9jdXR1aHdzZmdtc2F5bG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODU3ODgsImV4cCI6MjA5MjM2MTc4OH0.qYkgY_ZKpAMUY6Ttr9FWb4BFDpvqdSYkO196FzaQPR4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4cG9jdXR1aHdzZmdtc2F5bG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4NTc4OCwiZXhwIjoyMDkyMzYxNzg4fQ.PQoMJJalugJW1GNYqPSA2hAXE1ASJdw3ZbpOITJrLmY

   You can optionally set `SUPABASE_URL`; otherwise the server uses `NEXT_PUBLIC_SUPABASE_URL`.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** and use the app the same way as on Vercel.


**ML (training and offline inference):** see **`ml/README.md`**.
---
## Quick reference
| What you want | Where to go |
|---------------|-------------|
| Use the hosted app | [contextiq-eta.vercel.app](https://contextiq-eta.vercel.app/) |
| Hack on the Next.js app | Clone repo → `.env.local` → `npm install` → `npm run dev` |
