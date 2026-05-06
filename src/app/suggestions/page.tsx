import Link from "next/link";

export default function SuggestionsPage() {
  const suggestions = [
    {
      id: 1,
      patternType: "Study Block",
      suggestion: "Schedule a short recovery break after long study sessions.",
      confidence: "High",
      explanation:
        "The system detected an extended study block with limited activity switching. This pattern may indicate strong focus, but it can also lead to fatigue if repeated without breaks.",
      evidence:
        "Feature signals: long session duration, study-heavy category distribution, low activity switching.",
      limitation:
        "This suggestion is based on logged activity data only. It does not know your actual energy level or assignment deadlines.",
    },
    {
      id: 2,
      patternType: "Routine Imbalance",
      suggestion: "Add a social or non-study activity to balance your day.",
      confidence: "Medium",
      explanation:
        "The pattern model found that most of today’s activity was concentrated in study and productivity categories, with little social or entertainment time logged.",
      evidence:
        "Feature signals: high productivity ratio, low social activity frequency, narrow category spread.",
      limitation:
        "The system may miss activities that were not manually logged.",
    },
  ];

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

      <div className="space-y-6">
        {suggestions.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Pattern · {item.patternType}
                </p>
                <h2 className="text-xl font-semibold leading-snug text-white">
                  {item.suggestion}
                </h2>
              </div>

              <span
                className={`h-fit w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  item.confidence === "High"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                    : "border-amber-400/40 bg-amber-500/10 text-amber-200"
                }`}
              >
                {item.confidence}
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
                <p className="text-sm leading-relaxed text-slate-400">{item.evidence}</p>
              </div>

              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-200">Limitation</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.limitation}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

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
