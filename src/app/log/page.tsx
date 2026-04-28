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
    if (category === "study") return "border-l-blue-500";
    if (category === "social") return "border-l-pink-500";
    if (category === "entertainment") return "border-l-purple-500";
    if (category === "productivity") return "border-l-green-500";
    if (category === "travel") return "border-l-yellow-500";
    return "border-l-gray-500";
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Activity Log</h1>
      <p className="text-sm text-gray-600 mb-6">
        Log what you did, where you were, and when it happened.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg border mb-8"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select a category</option>
            <option value="study">Study</option>
            <option value="social">Social</option>
            <option value="entertainment">Entertainment</option>
            <option value="productivity">Productivity</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location Name
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Library, dorm, gym, etc."
            className="w-full border rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details here"
            rows={4}
            className="w-full border rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Log Activity
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>

      <section>
        <h2 className="text-xl font-bold mb-4">Today&apos;s Activity Timeline</h2>

        {activities.length === 0 ? (
          <p className="text-sm text-gray-600">
            No activities logged today yet.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`bg-white border border-l-4 rounded-lg p-4 ${getCategoryColor(
                  activity.category
                )}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize">
                      {activity.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.location}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {getDuration(activity.start_time, activity.end_time)}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {formatTime(activity.start_time)} -{" "}
                  {formatTime(activity.end_time)}
                </p>

                {activity.notes && (
                  <p className="text-sm text-gray-700 mt-2">
                    {activity.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}