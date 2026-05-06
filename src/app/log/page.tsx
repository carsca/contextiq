"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ActivityLog = {
  id: number;
  category: string;
  location: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/25";

export default function LogPage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTodayActivities();
  }, []);

  async function getTodayActivities() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .order("start_time", { ascending: true });

    setActivities(data || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!category || !location || !startTime || !endTime) {
      setMessage("Please fill in all required fields.");
      return;
    }

    await supabase.from("activity_logs").insert([
      {
        category,
        location,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
      },
    ]);

    setCategory("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    setMessage("Activity logged successfully.");

    getTodayActivities();
  }

  function getMinutes(start: string, end: string) {
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );
  }

  function getDuration(start: string, end: string) {
    const minutes = getMinutes(start, end);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${remainingMinutes} min`;
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getCategoryColor(category: string) {
    if (category === "study") return "border-l-cyan-400";
    if (category === "social") return "border-l-fuchsia-400";
    if (category === "entertainment") return "border-l-violet-400";
    if (category === "productivity") return "border-l-emerald-400";
    if (category === "travel") return "border-l-amber-400";
    return "border-l-slate-400";
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
          Capture
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
          Activity log
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
          Log what you did, where you were, and when it happened.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-5 rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/25 backdrop-blur-sm"
      >
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Category
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
            <option value="">Select a category</option>
            <option value="study">Study</option>
            <option value="social">Social</option>
            <option value="entertainment">Entertainment</option>
            <option value="productivity">Productivity</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Location name
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Library, dorm, gym, etc."
            className={fieldClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Start time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              End time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details here"
            rows={4}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Log activity
        </button>

        {message && (
          <p
            className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-amber-300"}`}
          >
            {message}
          </p>
        )}
      </form>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Today&apos;s activity timeline
        </h2>

        {activities.length === 0 ? (
          <p className="text-sm text-slate-400">No activities logged today yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`rounded-2xl border border-white/10 border-l-4 bg-white/[0.05] p-4 shadow-lg shadow-black/20 backdrop-blur-sm ${getCategoryColor(
                  activity.category
                )}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize text-white">
                      {activity.category}
                    </p>
                    <p className="text-sm text-slate-400">{activity.location}</p>
                  </div>

                  <p className="shrink-0 text-sm font-medium tabular-nums text-cyan-300/90">
                    {getDuration(activity.start_time, activity.end_time)}
                  </p>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {formatTime(activity.start_time)} – {formatTime(activity.end_time)}
                </p>

                {activity.notes && (
                  <p className="mt-2 text-sm text-slate-300">{activity.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
