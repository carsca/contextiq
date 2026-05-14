import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ConfidenceScore, GenerateSuggestionRequest } from "@/types/pipeline";

const MODEL = "gpt-4o-mini";
const PROMPT_VERSION = "v1";

type SuggestionResponse = {
  suggestionText: string;
  explanation: string;
  limitation: string;
  confidenceLabel: ConfidenceScore;
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    suggestionText: { type: "string" },
    explanation: { type: "string" },
    limitation: { type: "string" },
    confidenceLabel: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["suggestionText", "explanation", "limitation", "confidenceLabel"],
} as const;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function parseModelJson(content: string): SuggestionResponse {
  const parsed = JSON.parse(content) as SuggestionResponse;
  if (
    !parsed.suggestionText ||
    !parsed.explanation ||
    !parsed.limitation ||
    !["low", "medium", "high"].includes(parsed.confidenceLabel)
  ) {
    throw new Error("Model output did not match expected schema.");
  }
  return parsed;
}

export async function POST(request: Request) {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI is not configured (missing OPENAI_API_KEY)." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as GenerateSuggestionRequest;
    const patternFindingId = Number(body?.patternFindingId);
    if (!patternFindingId) {
      return NextResponse.json(
        { error: "patternFindingId is required." },
        { status: 400 }
      );
    }

    const { data: existingSuggestion } = await supabaseAdmin
      .from("suggestions")
      .select("*")
      .eq("pattern_finding_id", patternFindingId)
      .maybeSingle();

    if (existingSuggestion) {
      return NextResponse.json({
        suggestion: existingSuggestion,
        cached: true,
      });
    }

    const { data: finding, error: findingError } = await supabaseAdmin
      .from("pattern_findings")
      .select("*, daily_summaries(*)")
      .eq("id", patternFindingId)
      .maybeSingle();

    if (findingError) {
      throw new Error(`Failed to load pattern finding: ${findingError.message}`);
    }
    if (!finding) {
      return NextResponse.json(
        { error: "Pattern finding not found." },
        { status: 404 }
      );
    }

    const prompt = [
      "You are the ContextIQ suggestion engine for student productivity.",
      "Return practical and concise feedback using only the provided finding.",
      "Acknowledge that this system uses logged activity only and can miss context.",
      "",
      `pattern_type: ${finding.pattern_type}`,
      `confidence_score: ${finding.confidence_score}`,
      `prediction_probability: ${finding.prediction_probability}`,
      `evidence_json: ${JSON.stringify(finding.evidence ?? {})}`,
      `daily_summary: ${JSON.stringify(finding.daily_summaries ?? {})}`,
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You generate behavior suggestions as strict JSON. Be supportive, concrete, and honest about limitations.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contextiq_suggestion",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    const structured = parseModelJson(content);
    const confidenceScore =
      finding.confidence_score ?? structured.confidenceLabel ?? "medium";

    const insertPayload = {
      pattern_finding_id: patternFindingId,
      suggestion_text: structured.suggestionText,
      explanation: structured.explanation,
      limitation: structured.limitation,
      confidence_score: confidenceScore,
      llm_model: MODEL,
      prompt_version: PROMPT_VERSION,
      raw_response: {
        structured,
        usage: completion.usage ?? null,
      },
    };

    const { data: saved, error: saveError } = await supabaseAdmin
      .from("suggestions")
      .insert(insertPayload)
      .select("*")
      .single();

    if (saveError) {
      throw new Error(`Failed to save suggestion: ${saveError.message}`);
    }

    return NextResponse.json({ suggestion: saved, cached: false });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected suggestion error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
