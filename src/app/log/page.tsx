"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LogPage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!category || !location || !startTime || !endTime) {
      setMessage("Please fill in all required fields.");
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
    }

    setIsSubmitting(false);
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Activity Log</h1>
      <p className="text-sm text-gray-600 mb-6">
        Log what you did, where you were, and when it happened.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
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

        {message && (
          <p className="text-sm mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}