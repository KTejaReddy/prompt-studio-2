import type { FindDecision, ScoredPrompt } from "@/lib/types";
import { MATCH_CONFIG } from "@/lib/config/thresholds";
import { searchPrompts } from "./searchService";
import { contentTokens } from "./textUtils";
import { promptRepo } from "@/lib/db/repositories";

/**
 * MatchService — the product brain.
 *
 * Implements the core rule: REUSE before CUSTOMIZE before COMBINE before
 * GENERATE. A new prompt is only generated when the library cannot satisfy
 * the request.
 */

export function decideVerdict(matches: ScoredPrompt[]): "strong" | "related" | "generate" {
  const best = matches[0]?.score ?? 0;
  if (best >= MATCH_CONFIG.strongThreshold) return "strong";
  if (best >= MATCH_CONFIG.relatedThreshold) return "related";
  return "generate";
}

interface ComposeCandidate {
  promptId: string;
  title: string;
  score: number;
  coveredTasks: string[];
}

function taskCoverage(p: ScoredPrompt, intentTasks: string[]): number {
  if (intentTasks.length === 0) return 0;
  const set = new Set(p.prompt.tasks);
  const hits = intentTasks.filter((t) => set.has(t)).length;
  return hits / intentTasks.length;
}

/**
 * Detect multi-step requests where several distinct prompts together cover
 * more of the intent than any single prompt — suggest a composed workflow.
 */
export function detectComposition(
  intent: FindDecision["intent"],
  matches: ScoredPrompt[],
): FindDecision["suggestionWorkflow"] {
  const cfg = MATCH_CONFIG.compose;
  const intentTasks = intent.tasks.map((t) => t.task);
  if (intentTasks.length < cfg.minTasks || intent.complexity < cfg.minComplexity) {
    return null;
  }

  const eligible = matches.filter((m) => m.score >= cfg.memberScore);
  if (eligible.length < cfg.minDistinctPrompts) return null;

  const chosen: ComposeCandidate[] = [];
  const used = new Set<string>();

  for (const task of intentTasks) {
    if (chosen.length >= cfg.maxSteps) break;
    const bestForTask = eligible.find(
      (m) => !used.has(m.prompt.id) && m.prompt.tasks.includes(task),
    );
    if (!bestForTask) continue;
    used.add(bestForTask.prompt.id);
    chosen.push({
      promptId: bestForTask.prompt.id,
      title: bestForTask.prompt.title,
      score: bestForTask.score,
      coveredTasks: [task],
    });
  }

  if (chosen.length < cfg.minDistinctPrompts) return null;

  const bestSingle = matches[0] ? taskCoverage(matches[0], intentTasks) : 0;
  const combined = new Set(chosen.flatMap((c) => c.coveredTasks)).size / Math.max(intentTasks.length, 1);
  if (bestSingle > cfg.maxSingleCoverage || combined <= bestSingle) return null;

  return {
    name: `${intent.domain ?? "Multi-step"} workflow`,
    steps: chosen.map((c, i) => ({
      order: i + 1,
      title: c.title,
      promptId: c.promptId,
      instruction: `Handles: ${c.coveredTasks.join(", ")}`,
    })),
  };
}

/** Full find-decision pipeline for a natural-language request. */
export async function findMatch(query: string): Promise<FindDecision> {
  const { results, intent } = await searchPrompts(query);

  let verdict: FindDecision["verdict"] = decideVerdict(results);
  const suggestionWorkflow = detectComposition(intent, results);

  if (suggestionWorkflow && verdict !== "strong") verdict = "compose";

  let message: string;
  switch (verdict) {
    case "strong":
      message = `Found a strong match${results[0] ? `: "${results[0].prompt.title}"` : ""}.`;
      break;
    case "compose":
      message = "This is a multi-step request. Several prompts cover it together — combine them into a workflow.";
      break;
    case "related":
      message = "Found related prompts. Customize one to fit exactly?";
      break;
    default:
      message = "No close match in the library yet. Let's create one.";
  }

  return { verdict, intent, matches: results.slice(0, 6), message, suggestionWorkflow };
}

/**
 * Related prompts for the "customize existing" path.
 */
export async function relatedTo(promptId: string, limit = 4): Promise<ScoredPrompt[]> {
  const anchor = await promptRepo.byId(promptId);
  if (!anchor) return [];
  const anchorTokens = contentTokens(
    `${anchor.title} ${anchor.tags.join(" ")} ${anchor.subcategory ?? ""}`,
  );
  let pool = (await promptRepo.candidatesFor({
    tokens: anchorTokens,
    filters: { categories: [anchor.category] },
    limit: 60,
  })).filter((p) => p.id !== promptId);
  if (pool.length === 0) {
    pool = (await promptRepo.candidatesFor({
      filters: { categories: [anchor.category] },
      limit: 40,
    })).filter((p) => p.id !== promptId);
  }
  return pool
    .map((p) => {
      const sharedTasks = p.tasks.filter((t) => anchor.tasks.includes(t));
      const sharedTags = p.tags.filter((t) => anchor.tags.includes(t));
      let score = 0;
      score += sharedTasks.length * 0.22;
      score += sharedTags.length * 0.14;
      if (p.category === anchor.category) score += 0.3;
      if (p.inputType === anchor.inputType) score += 0.1;
      if (p.outputType === anchor.outputType) score += 0.08;
      return { p, s: score };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ p }) => ({
      prompt: p,
      score: Math.min(0.95, 0.4 + p.qualityScore * 0.3),
      semantic: 0,
      keyword: 0,
      structured: 0,
      reasons: [
        ...(p.category === anchor.category ? [{ label: "Same domain", detail: p.category }] : []),
        ...(p.tasks.filter((t) => anchor.tasks.includes(t)).length
          ? [{ label: "Overlapping tasks", detail: p.tasks.filter((t) => anchor.tasks.includes(t)).join(", ") }]
          : []),
      ],
    }));
}
