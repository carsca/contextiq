"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SuggestionWithFinding = {
  id: number;
  suggestion_text: string;
  explanation: string;
  limitation: string;
  confidence_score: "low" | "medium" | "high";
  created_at: string;
  pattern_findings: {
    pattern_type: string;
    evidence: Record<string, unknown>;
  } | null;
};

export default function SuggestionsPage() {
  const [rows, setRows] = useState<SuggestionWithFinding[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("suggestions")
      .select("*, pattern_findings(pattern_type, evidence)")
      .order("created_at", { ascending: false });

    setRows((data ?? []) as SuggestionWithFinding[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
          Guidance
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Suggestions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
          Recommendations generated from extracted behavior features and pattern
          detection results.
        </p>
      </header>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h2 className="mb-2 text-lg font-semibold text-white">
          Suggestion engine overview
        </h2>
        <p className="text-sm leading-relaxed text-slate-400">
          ContextIQ uses a two-stage pipeline. First, activity logs are converted
          into behavioral features such as session length, category balance,
          activity switching, and routine consistency. Then, the project&apos;s
          custom pattern model uses those features to identify behavior patterns
          and generate explainable suggestions.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading suggestions...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center backdrop-blur-sm">
          <p className="text-sm text-slate-300">
            No generated suggestions yet. Run the pipeline from the dashboard first.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Pattern · {item.pattern_findings?.pattern_type?.replace("_", " ") ?? "unknown"}
                </p>
                <h2 className="text-xl font-semibold leading-snug text-white">
                  {item.suggestion_text}
                </h2>
              </div>

              <span
                className={`h-fit w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  item.confidence_score === "high"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                    : item.confidence_score === "medium"
                      ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
                      : "border-slate-400/40 bg-slate-500/10 text-slate-200"
                }`}
              >
                {item.confidence_score}
              </span>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-200">Why?</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.explanation}</p>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-200">
                  Evidence used
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {JSON.stringify(item.pattern_findings?.evidence ?? {}, null, 2)}
                </p>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-200">Limitation</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.limitation}</p>
              </div>
            </div>
          </article>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Refine inputs on the{" "}
        <Link href="/log" className="font-medium text-cyan-400 hover:text-cyan-300">
          activity log
        </Link>
        .
      </p>
    </div>
  );
}
