"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    getActivitiesForDate();
  }, [selectedDate]);

  async function getActivitiesForDate() {
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
            <p className="mt-2 text-sm text-slate-400">
              Suggestions will appear here after the pattern detection system is
              connected.
            </p>
          </div>
        </>
      )}
    </div>
  );
}