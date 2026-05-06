export default function SettingsPage() {
  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
          System
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Admin tools, system visibility, and future developer controls.
        </p>
      </header>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Development tools</h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <h3 className="font-semibold text-slate-100">Database status</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Activity logs are connected through Supabase and currently being
              used for dashboard summaries and activity tracking.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <h3 className="font-semibold text-slate-100">Pattern detection pipeline</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Behavioral pattern detection will process activity logs and create
              findings such as overworking, isolation, low social activity, or
              unhealthy routines.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Pattern findings debug view
        </h2>

        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          This section will display generated behavioral findings from the
          backend pipeline.
        </p>

        <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-4">
          <p className="font-medium text-slate-200">No pattern findings yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Once the pattern detection system is connected, records will appear
            here with:
          </p>

          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-400">
            <li>Pattern type</li>
            <li>Confidence score</li>
            <li>Evidence JSON</li>
            <li>Created date</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Future controls</h2>

        <p className="text-sm leading-relaxed text-slate-400">
          Additional controls like notification preferences, user profile
          settings, and suggestion feedback will be added in later phases.
        </p>
      </div>
    </div>
  );
}
