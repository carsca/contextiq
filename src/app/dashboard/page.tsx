"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PatternFinding, Suggestion } from "@/types/pipeline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const tickStyle = { fill: "#94a3b8", fontSize: 12 };
const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.96)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "12px",
  color: "#f1f5f9",
};

type ActivityLog = {
  id: number;
  category: string;
  location: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [latestFinding, setLatestFinding] = useState<PatternFinding | null>(null);
  const [latestSuggestion, setLatestSuggestion] = useState<Suggestion | null>(null);
  const [pipelineMessage, setPipelineMessage] = useState("");
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const getActivitiesForDate = useCallback(async () => {
    const [year, month, day] = selectedDate.split("-").map(Number);

    const start = new Date(year, month - 1, day, 0, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59, 999);

    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString())
      .order("start_time", { ascending: true });

    setActivities(data || []);
  }, [selectedDate]);

  const getPipelineOutputsForDate = useCallback(async () => {
    setLatestFinding(null);
    setLatestSuggestion(null);

    const { data: summary } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("activity_date", selectedDate)
      .maybeSingle();

    if (!summary) return;

    const { data: finding } = await supabase
      .from("pattern_findings")
      .select("*")
      .eq("daily_summary_id", summary.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!finding) return;
    setLatestFinding(finding as PatternFinding);

    const { data: suggestion } = await supabase
      .from("suggestions")
      .select("*")
      .eq("pattern_finding_id", finding.id)
      .maybeSingle();

    if (suggestion) {
      setLatestSuggestion(suggestion as Suggestion);
    }
  }, [selectedDate]);

  useEffect(() => {
    getActivitiesForDate();
    getPipelineOutputsForDate();
  }, [getActivitiesForDate, getPipelineOutputsForDate]);

  async function runPipeline() {
    setIsRunningPipeline(true);
    setPipelineMessage("");

    try {
      const aggregateRes = await fetch("/api/pipeline/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityDate: selectedDate }),
      });

      const aggregateJson = await aggregateRes.json();
      if (!aggregateRes.ok) {
        setPipelineMessage(aggregateJson.error || "Failed to aggregate logs.");
        return;
      }

      const inferRes = await fetch("/api/pipeline/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityDate: selectedDate }),
      });
      const inferJson = await inferRes.json();
      if (!inferRes.ok) {
        setPipelineMessage(
          `${inferJson.error || "Inference did not run."} Aggregation succeeded.`
        );
      }

      await getPipelineOutputsForDate();

      const { data: summary } = await supabase
        .from("daily_summaries")
        .select("id")
        .eq("activity_date", selectedDate)
        .maybeSingle();
      if (!summary) {
        setPipelineMessage("No summary row found after aggregation.");
        return;
      }

      const { data: finding } = await supabase
        .from("pattern_findings")
        .select("id")
        .eq("daily_summary_id", summary.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!finding) {
        setPipelineMessage(
          "Aggregation succeeded, but no pattern finding exists yet. Run `python ml/infer_from_supabase.py --date YYYY-MM-DD` if needed."
        );
        return;
      }

      const suggestionRes = await fetch("/api/suggestions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patternFindingId: finding.id }),
      });
      const suggestionJson = await suggestionRes.json();
      if (!suggestionRes.ok) {
        setPipelineMessage(
          suggestionJson.error || "Pattern detected, but suggestion generation failed."
        );
        return;
      }

      await getPipelineOutputsForDate();
      setPipelineMessage(
        `Pipeline completed for ${selectedDate}. ${
          suggestionJson.cached ? "Used cached suggestion." : "Generated new suggestion."
        }`
      );
    } catch {
      setPipelineMessage("Unexpected pipeline failure.");
    } finally {
      setIsRunningPipeline(false);
    }
  }

  function getMinutes(start: string, end: string) {
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );
  }

  const totalMinutes = activities.reduce((sum, activity) => {
    return sum + getMinutes(activity.start_time, activity.end_time);
  }, 0);

  const categoryTotals: Record<string, number> = {};
  const locationTotals: Record<string, number> = {};

  activities.forEach((activity) => {
    const minutes = getMinutes(activity.start_time, activity.end_time);

    categoryTotals[activity.category] =
      (categoryTotals[activity.category] || 0) + minutes;

    locationTotals[activity.location] =
      (locationTotals[activity.location] || 0) + minutes;
  });

  const categoryChartData = Object.entries(categoryTotals).map(
    ([category, minutes]) => ({
      name: category,
      hours: Number((minutes / 60).toFixed(2)),
    })
  );

  const locationChartData = Object.entries(locationTotals).map(
    ([location, minutes]) => ({
      name: location,
      hours: Number((minutes / 60).toFixed(2)),
    })
  );

  const switchCount = activities.length > 0 ? activities.length - 1 : 0;

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No data yet";

  return (
    <div>
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
          Overview
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Daily summary view based on logged activity data.
        </p>
      </header>

      <div className="mb-8">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
          Select date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/25"
        />
        <button
          onClick={runPipeline}
          disabled={isRunningPipeline}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunningPipeline ? "Running pipeline..." : "Run pipeline for selected date"}
        </button>
        {pipelineMessage && (
          <p className="mt-3 text-sm text-slate-300">{pipelineMessage}</p>
        )}
      </div>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
        <h2 className="mb-6 text-lg font-semibold text-white">Daily summary</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Activities
            </p>
            <p className="mt-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent tabular-nums">
              {activities.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total time
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {(totalMinutes / 60).toFixed(1)}
              </span>{" "}
              <span className="text-lg font-semibold text-slate-400">hrs</span>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Switch count
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-white">
              {switchCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Top category
            </p>
            <p className="mt-2 text-2xl font-bold capitalize leading-snug text-white">
              {topCategory}
            </p>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">No data for this day</h2>
          <p className="mt-2 text-sm text-slate-400">
            Log an activity for this date to generate a daily summary.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Category breakdown
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillCategory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="hours"
                    fill="url(#fillCategory)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-white">Location time</h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillLocation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="hours"
                    fill="url(#fillLocation)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Latest suggestion</h2>
            {!latestFinding ? (
              <p className="mt-2 text-sm text-slate-400">
                Run the pipeline to create a finding and suggestion for this date.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-slate-300">
                  Pattern:{" "}
                  <span className="font-semibold capitalize text-white">
                    {latestFinding.pattern_type.replace("_", " ")}
                  </span>{" "}
                  · Confidence:{" "}
                  <span className="font-semibold text-cyan-300">
                    {latestFinding.confidence_score}
                  </span>
                </p>
                {latestSuggestion ? (
                  <>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {latestSuggestion.suggestion_text}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {latestSuggestion.limitation}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Finding exists but no suggestion is generated yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}