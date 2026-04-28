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

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function getActivities() {
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

    getActivities();
  }, []);

  function getMinutes(start: string, end: string) {
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );
  }

  const totalMinutes = activities.reduce((sum, activity) => {
    return sum + getMinutes(activity.start_time, activity.end_time);
  }, 0);

  const categoryTotals: Record<string, number> = {};

  activities.forEach((activity) => {
    categoryTotals[activity.category] =
      (categoryTotals[activity.category] || 0) +
      getMinutes(activity.start_time, activity.end_time);
  });

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No data yet";

  const today = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 mb-6">
        Today is {today}. Here is your activity summary.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-5">
          <p className="text-sm text-gray-600">Total Activities</p>
          <p className="text-3xl font-bold">
            {activities.length > 0 ? activities.length : 0}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <p className="text-sm text-gray-600">Total Time</p>
          <p className="text-3xl font-bold">
            {activities.length > 0
              ? `${(totalMinutes / 60).toFixed(1)} hrs`
              : "0 hrs"}
          </p>
        </div>

        <div className="bg-white border rounded-lg p-5">
          <p className="text-sm text-gray-600">Top Category</p>
          <p className="text-2xl font-bold capitalize">{topCategory}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>

        {activities.length === 0 ? (
          <p className="text-sm text-gray-600">
            No activities logged today yet.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, minutes]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{category}</span>
                  <span>{(minutes / 60).toFixed(1)} hrs</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-black h-3 rounded-full"
                    style={{ width: `${(minutes / totalMinutes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Suggestion */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-2">Latest Suggestion</h2>

        {activities.length === 0 ? (
          <p className="text-sm text-gray-600">
            Suggestions will appear after enough activity data is logged.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Suggestions will appear here after the pattern detection system is connected.
          </p>
        )}
      </div>
    </div>
  );
}