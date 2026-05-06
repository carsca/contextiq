import { NextResponse } from "next/server";
import { aggregateDailySummary } from "@/lib/pipeline/aggregate";
import type { AggregatePipelineRequest } from "@/types/pipeline";

function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AggregatePipelineRequest;
    const activityDate = body?.activityDate;

    if (!activityDate || !isDateString(activityDate)) {
      return NextResponse.json(
        { error: "activityDate is required in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const summary = await aggregateDailySummary(activityDate);
    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected aggregation error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
