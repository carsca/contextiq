import { NextResponse } from "next/server";
import { spawnSync } from "node:child_process";

export const runtime = "nodejs";

function runCommand(cmd: string, args: string[]) {
  return spawnSync(cmd, args, {
    cwd: process.cwd(),
    encoding: "utf-8",
    env: process.env,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { activityDate?: string };
    const activityDate = body?.activityDate;
    if (!activityDate || !/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) {
      return NextResponse.json(
        { error: "activityDate is required in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    const commands: Array<[string, string[]]> = [
      ["python", ["ml/infer_from_supabase.py", "--date", activityDate]],
      ["python3", ["ml/infer_from_supabase.py", "--date", activityDate]],
      ["py", ["ml/infer_from_supabase.py", "--date", activityDate]],
    ];

    let lastResult: ReturnType<typeof runCommand> | null = null;
    for (const [cmd, args] of commands) {
      const result = runCommand(cmd, args);
      lastResult = result;
      if (result.status === 0) {
        return NextResponse.json({
          ok: true,
          command: `${cmd} ${args.join(" ")}`,
          stdout: result.stdout,
        });
      }
    }

    return NextResponse.json(
      {
        error:
          "Unable to run Python inference from API. Run `python ml/infer_from_supabase.py --date YYYY-MM-DD` manually.",
        stdout: lastResult?.stdout ?? "",
        stderr: lastResult?.stderr ?? "",
      },
      { status: 500 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected inference route error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
