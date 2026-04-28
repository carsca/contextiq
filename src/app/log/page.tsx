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
  created_at: string;
};

export default function LogPage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchActivities() {
    setIsLoading(true);

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      setMessage(`Error loading activities: ${error.message}`);
    } else {
      setActivities(data || []);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    fetchActivities();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!category || !location || !startTime || !endTime) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setMessage("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("activity_logs").insert([
      {
        category,
        location,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Activity logged successfully.");
      setCategory("");
      setLocation("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      await fetchActivities();
    }

    setIsSubmitting(false);
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getDuration(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes === 0
      ? `${hours} hr`
      : `${hours} hr ${remainingMinutes} min`;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Activity Log</h1>
      <p className="text-sm text-gray-600 mb-6">
        Log what you did, where you were, and when it happened.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border mb-8">
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
          <label className="block text-sm font-medium mb-1">Location Name</label>
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
            <label className="block text-sm font-medium mb-1">Start Time</label>
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
          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
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
          disabled={isSubmitting}
          className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Log Activity"}
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>

      <section>
        <h2 className="text-xl font-bold mb-4">Saved Activities</h2>

        {isLoading ? (
          <p className="text-sm text-gray-600">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-600">
            No activities logged yet. Add your first activity above.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold capitalize">{activity.category}</p>
                    <p className="text-sm text-gray-600">{activity.location}</p>
                  </div>

                  <p className="text-sm text-gray-600">
                    {getDuration(activity.start_time, activity.end_time)}
                  </p>
                </div>

                <p className="text-sm mt-2">
                  {formatDateTime(activity.start_time)} - {formatDateTime(activity.end_time)}
                </p>

                {activity.notes && (
                  <p className="text-sm text-gray-700 mt-2">{activity.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}