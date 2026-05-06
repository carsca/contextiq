import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
        Behavior intelligence
      </p>
      <h1 className="mt-4 max-w-lg bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
        ContextIQ
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
        Smart activity insights and pattern-aware suggestions — built to stand out and stay readable.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f]"
        >
          Open dashboard
        </Link>
        <Link
          href="/log"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080f]"
        >
          Log activity
        </Link>
      </div>
    </div>
  );
}
