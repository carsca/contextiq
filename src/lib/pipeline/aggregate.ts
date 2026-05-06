import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ActivityLog = {
  id: number;
  category: string;
  location: string;
  start_time: string;
  end_time: string;
  notes: string | null;
};

const PRODUCTIVE_CATEGORIES = new Set(["study", "productivity"]);

function dateWindow(activityDate: string) {
  const [year, month, day] = activityDate.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return { start, end };
}

function getMinutes(startIso: string, endIso: string) {
  const duration = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000
  );
  return Math.max(duration, 0);
}

function getTimeOfDayBucket(date: Date) {
  const hour = date.getUTCHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export async function aggregateDailySummary(activityDate: string) {
  const { start, end } = dateWindow(activityDate);
  const { data, error } = await supabaseAdmin
    .from("activity_logs")
    .select("id, category, location, start_time, end_time, notes")
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activity logs: ${error.message}`);
  }

  const logs = (data ?? []) as ActivityLog[];
  const categoryMinutes: Record<string, number> = {};
  const locationMinutes: Record<string, number> = {};
  const timeOfDay = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  let totalMinutes = 0;
  let longestSessionMinutes = 0;
  let productiveMinutes = 0;

  for (const log of logs) {
    const minutes = getMinutes(log.start_time, log.end_time);
    totalMinutes += minutes;
    longestSessionMinutes = Math.max(longestSessionMinutes, minutes);

    categoryMinutes[log.category] = (categoryMinutes[log.category] ?? 0) + minutes;
    locationMinutes[log.location] = (locationMinutes[log.location] ?? 0) + minutes;

    if (PRODUCTIVE_CATEGORIES.has(log.category)) {
      productiveMinutes += minutes;
    }

    const bucket = getTimeOfDayBucket(new Date(log.start_time));
    timeOfDay[bucket] += minutes;
  }

  const switchCount = logs.length > 0 ? logs.length - 1 : 0;
  const productiveRatio =
    totalMinutes > 0 ? Number((productiveMinutes / totalMinutes).toFixed(4)) : 0;

  const upsertPayload = {
    activity_date: activityDate,
    source_window_start: start.toISOString(),
    source_window_end: end.toISOString(),
    total_minutes: totalMinutes,
    category_minutes: categoryMinutes,
    location_minutes: locationMinutes,
    switch_count: switchCount,
    longest_session_minutes: longestSessionMinutes,
    tod_morning_minutes: timeOfDay.morning,
    tod_afternoon_minutes: timeOfDay.afternoon,
    tod_evening_minutes: timeOfDay.evening,
    tod_night_minutes: timeOfDay.night,
    productive_minutes: productiveMinutes,
    productive_ratio: productiveRatio,
    source_log_count: logs.length,
  };

  const { data: saved, error: upsertError } = await supabaseAdmin
    .from("daily_summaries")
    .upsert(upsertPayload, { onConflict: "activity_date" })
    .select("*")
    .single();

  if (upsertError) {
    throw new Error(`Failed to upsert daily summary: ${upsertError.message}`);
  }

  return saved;
}
