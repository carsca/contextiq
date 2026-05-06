export type PatternType =
  | "routine"
  | "study_block"
  | "distraction"
  | "drop_off"
  | "none";

export type ConfidenceScore = "low" | "medium" | "high";

export interface DailySummary {
  id: number;
  activity_date: string;
  source_window_start: string;
  source_window_end: string;
  total_minutes: number;
  category_minutes: Record<string, number>;
  location_minutes: Record<string, number>;
  switch_count: number;
  longest_session_minutes: number;
  tod_morning_minutes: number;
  tod_afternoon_minutes: number;
  tod_evening_minutes: number;
  tod_night_minutes: number;
  productive_minutes: number;
  productive_ratio: number;
  source_log_count: number;
  created_at: string;
}

export interface PatternFinding {
  id: number;
  daily_summary_id: number;
  pattern_type: PatternType;
  prediction_probability: number;
  confidence_score: ConfidenceScore;
  model_version: string;
  evidence: Record<string, unknown>;
  created_at: string;
}

export interface Suggestion {
  id: number;
  pattern_finding_id: number;
  suggestion_text: string;
  explanation: string;
  limitation: string;
  confidence_score: ConfidenceScore;
  llm_model: string;
  prompt_version: string;
  raw_response: Record<string, unknown>;
  created_at: string;
}

export interface AggregatePipelineRequest {
  activityDate: string;
}

export interface GenerateSuggestionRequest {
  patternFindingId: number;
}
