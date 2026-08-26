import { NextRequest, NextResponse } from "next/server";
import type { FindDecision, IntentAnalysis } from "@/lib/types";
import {
  decideVerdict,
  detectComposition,
} from "@/lib/services/matchService";
import { searchPrompts } from "@/lib/services/searchService";
import { parseIntent } from "@/lib/services/intentService";
import { listCommands, eventRepo } from "@/lib/db/repositories";

export const runtime = "nodejs";

/**
 * Merge a slash-command's intentPatch onto the natural-language intent.
 * Arrays concatenate; scalars overwrite only when the patch defines them.
 */
function applyPatch(intent: IntentAnalysis, patch: Partial<IntentAnalysis>): IntentAnalysis {
  return {
    ...intent,
    ...Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    ),
    tasks:
      patch.tasks && patch.tasks.length > 0
        ? [...intent.tasks, ...patch.tasks]
        : intent.tasks,
    keywords: [...new Set([...intent.keywords, ...(patch.keywords ?? [])])],
    constraints: [
      ...new Set([...intent.constraints, ...(patch.constraints ?? [])]),
    ],
  };
}

/** Same decision pipeline as matchService.findMatch, for a pre-built intent. */
function decideFromIntent(intent: IntentAnalysis): FindDecision {
  const { results } = searchPrompts(intent);
  let verdict: FindDecision["verdict"] = decideVerdict(results);
  const suggestionWorkflow = detectComposition(intent, results);
  if (suggestionWorkflow && verdict !== "strong") verdict = "compose";

  let message: string;
  switch (verdict) {
    case "strong":
      message = `Found a strong match${results[0] ? `: “${results[0].prompt.title}”` : ""}.`;
      break;
    case "compose":
      message =
        "This is a multi-step request. Several prompts cover it together — combine them into a workflow.";
      break;
    case "related":
      message = "Found related prompts. Customize one to fit exactly?";
      break;
    default:
      message = "No close match in the library yet. Try exploring related prompts below.";
  }

  return { verdict, intent, matches: results.slice(0, 6), message, suggestionWorkflow };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    query?: string;
    command?: string;
  };
  const query = (body.query ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  let intent = parseIntent(query);
  if (body.command) {
    const cmd = listCommands().find((c) => c.cmd === body.command);
    if (cmd) intent = applyPatch(intent, cmd.intentPatch);
  }

  const decision = decideFromIntent(intent);

  try {
    eventRepo.log({
      type: "search",
      outcome: decision.verdict,
      meta: {
        query,
        command: body.command ?? null,
        topScore: decision.matches[0]?.score ?? null,
      },
    });
  } catch {
    /* analytics is best-effort */
  }

  return NextResponse.json(decision);
}
