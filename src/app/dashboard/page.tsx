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
} from "recharts";

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
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Daily summary view based on logged activity data.
      </p>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-md p-2 bg-white"
        />
      </div>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Daily Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-5">
            <p className="text-sm text-gray-600">Activities</p>
            <p className="text-3xl font-bold">{activities.length}</p>
          </div>

          <div className="border rounded-lg p-5">
            <p className="text-sm text-gray-600">Total Time</p>
            <p className="text-3xl font-bold">
              {(totalMinutes / 60).toFixed(1)} hrs
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <p className="text-sm text-gray-600">Switch Count</p>
            <p className="text-3xl font-bold">{switchCount}</p>
          </div>

          <div className="border rounded-lg p-5">
            <p className="text-sm text-gray-600">Top Category</p>
            <p className="text-2xl font-bold capitalize">{topCategory}</p>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">No data for this day</h2>
          <p className="text-sm text-gray-600">
            Log an activity for this date to generate a daily summary.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Location Time</h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Latest Suggestion</h2>
            <p className="text-sm text-gray-600">
              Suggestions will appear here after the pattern detection system is
              connected.
            </p>
          </div>
        </>
      )}
    </div>
  );
}