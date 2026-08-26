import { SEED_CATEGORIES } from "../seed/taxonomy";

/**
 * GenerationService — AI prompt authoring via Groq's OpenAI-compatible API.
 *
 * The Groq model catalog rotates (compound, gpt-oss, qwen, allam, …), so the
 * model list is fetched live from /models and filtered to chat-capable
 * entries. Nothing is hardcoded to a specific model id.
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";

export interface GroqModelInfo {
  id: string;
  label: string;
  blurb: string;
  tier: "flagship" | "balanced" | "fast" | "agentic" | "specialist";
}

export interface AiGeneratedPrompt {
  title: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  tasks: string[];
  tags: string[];
  difficulty: string;
  inputType: string;
  outputType: string;
  tone: string;
  bestFor: string[];
  platforms: string[];
  variables: { key: string; label: string; placeholder?: string; suggestions?: string[] }[];
  body: string;
  model: string;
}

/** Non-chat Groq endpoints (STT/TTS/classifiers) that must never be offered. */
const NON_CHAT = /whisper|orpheus|guard|safeguard|embed|tts/i;

const TIER_ORDER: GroqModelInfo["tier"][] = ["flagship", "agentic", "balanced", "fast", "specialist"];

/** Curated presentation metadata; ids missing from here still get defaults. */
const MODEL_META: { match: RegExp; label: string; blurb: string; tier: GroqModelInfo["tier"] }[] = [
  { match: /gpt-oss-120b/i, label: "GPT-OSS 120B", blurb: "Deepest reasoning — best prompt craftsmanship", tier: "flagship" },
  { match: /compound-mini/i, label: "Groq Compound Mini", blurb: "Agentic lite — built-in tools, quick answers", tier: "fast" },
  { match: /groq\/compound/i, label: "Groq Compound", blurb: "Agentic model with built-in tool use", tier: "agentic" },
  { match: /qwen/i, label: "Qwen 3 · 27B", blurb: "Strong multilingual generalist", tier: "balanced" },
  { match: /gpt-oss-20b/i, label: "GPT-OSS 20B", blurb: "Fast reasoning, lighter output", tier: "fast" },
  { match: /allam/i, label: "ALLaM 7B", blurb: "Arabic-focused SDAIA model", tier: "specialist" },
];

let modelCache: { at: number; models: GroqModelInfo[] } | null = null;

export function groqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/** Live chat-capable model list (10-minute cache). Falls back to a minimal set. */
export async function listChatModels(): Promise<GroqModelInfo[]> {
  if (modelCache && Date.now() - modelCache.at < 10 * 60_000) return modelCache.models;
  const key = process.env.GROQ_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(`${GROQ_BASE}/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`models ${res.status}`);
    const json = (await res.json()) as { data?: { id: string }[] };
    const models = (json.data ?? [])
      .filter((m) => !NON_CHAT.test(m.id))
      .map((m): GroqModelInfo => {
        const meta = MODEL_META.find((x) => x.match.test(m.id));
        return meta
          ? { id: m.id, label: meta.label, blurb: meta.blurb, tier: meta.tier }
          : { id: m.id, label: m.id, blurb: "Chat model", tier: "balanced" };
      })
      .sort(
        (a, b) =>
          TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.id.localeCompare(b.id),
      );
    modelCache = { at: Date.now(), models };
    return models;
  } catch {
    // Catalog fetch failed — keep any previous cache rather than nothing.
    if (modelCache) return modelCache.models;
    throw new Error("Could not reach the Groq model catalog. Check GROQ_API_KEY / network.");
  }
}

// ---------- Authoring contract ----------

export type PromptLevel = 1 | 2 | 3;

export const LEVEL_META: Record<PromptLevel, { name: string; hint: string }> = {
  1: { name: "Standard", hint: "~6,000+ characters — full structure with method and constraints" },
  2: { name: "Detailed", hint: "~9,500+ characters — methodology, edge cases, worked example" },
  3: { name: "Expert", hint: "~13,000+ characters — rubric, failure modes, self-check, adaptations" },
};

export function parseLevel(v: unknown): PromptLevel {
  const n = Number(v);
  return n === 1 || n === 2 || n === 3 ? n : 2;
}

function levelRules(level: PromptLevel): string {
  if (level === 1) {
    return `BODY RULES (STANDARD LEVEL — the body MUST reach at least 6,000 characters, roughly 900-1,000 words. Section minimums are hard floors; keep expanding within them until the total is met):
- Second-person expert role line ("You are a …") with specialization (3-4 sentences: experience, mindset, who you serve).
- Sections in order, with HARD minimums:
  1. GOAL — outcome + what success looks like. Minimum 5 sentences.
  2. CONTEXT — background to assume and why the task matters. Minimum 5 sentences.
  3. WHAT I'LL PROVIDE — 2-4 variables as "- KEY: {KEY}" (curly-brace tokens exactly matching variables[].key); each variable gets TWO lines: what good input looks like, and what happens with bad input.
  4. HOW TO WORK — 8-9 numbered steps. Each step is 2-3 sentences: the thinking move, the concrete action, and what to verify before moving on.
  5. OUTPUT — precise deliverable structure (sections, ordering, approximate lengths per section) ending with a "NEXT STEPS" requirement (3 immediate actions with expected payoff). Minimum 10 lines.
  6. CONSTRAINTS — 6-7 explicit do/don't rules (length, style, scope, things to avoid).
  7. QUALITY BAR — 5 checkable criteria, each one sentence.
- Anti-hallucination guard: use only facts present in the provided material; mark anything uncertain as "uncertain".`;
  }
  if (level === 2) {
    return `BODY RULES (DETAILED LEVEL — the body MUST reach at least 9,500 characters, roughly 1,400-1,700 words. Section minimums are hard floors):
- Everything in STANDARD (same 7 sections, at their minimums), plus:
  8. METHODOLOGY upgraded — 10-12 numbered steps; each names the thinking technique to apply (first-principles split, MECE grouping, steel-manning, inversion, premortem) and gives the concrete action PLUS the checkpoint (2-3 sentences per step).
  9. EDGE CASES & ASSUMPTIONS — at least 7 bullets covering incomplete, contradictory and low-quality input; assumptions listed explicitly.
  10. WORKED MICRO-EXAMPLE — inside OUTPUT, a 10-14 line example showing the expected style.
- 4-5 variables, each with a two-line quality note.
- QUALITY BAR upgraded to 6 criteria, each with what a 10/10 looks like.`;
  }
  return `BODY RULES (EXPERT LEVEL — the body MUST reach at least 13,000 characters, roughly 1,900-2,600 words. Section minimums are hard floors):
- Everything in DETAILED (same 10 sections, at their minimums), plus:
  11. QUALITY RUBRIC — 6-7 criteria; EACH criterion states what a 10/10 answer looks like AND what a 5/10 looks like (two to three sentences per criterion).
  12. FAILURE MODES — 7-8 ways an answer to this prompt typically goes wrong; each with a one-sentence prevention rule.
  13. SELF-CHECK — a numbered pre-answer verification list (8+ checks): every rubric criterion, every {VARIABLE} used, no contradictions with provided material; fix gaps silently, then answer.
  14. PLATFORM ADAPTATION — 6-8 sentences on adjusting the output for the target platform's strengths and limits.
  15. SECOND WORKED EXAMPLE — a contrasting example inside OUTPUT showing an edge-case application.
- 5-6 variables, each with quality note and 3+ suggestions.
- ROLE includes years of experience, specialization, who you serve, and the mindset to bring.`;
}

const CANONICAL_TASKS = [
  "summarize", "review", "detect", "recommend", "debug", "explain", "quiz", "extract",
  "convert", "translate", "analyze", "compare", "write", "rewrite", "edit", "plan",
  "brainstorm", "optimize", "refactor", "document", "organize", "design", "outline",
];

const INPUT_TYPES = ["text", "code", "document", "pdf", "data", "url", "image", "email"];
const OUTPUT_TYPES = [
  "text", "summary", "report", "plan", "questions", "table", "code", "copy",
  "explanation", "email", "slides", "ideas", "document",
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

function taxonomyContract(): string {
  return SEED_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.subcategories.join(" | ")}`,
  ).join("\n");
}

function systemPrompt(level: PromptLevel): string {
  return `You are Promptly's prompt engineer. You write reusable, library-quality prompts.

Return STRICT JSON only (no markdown fences, no commentary) shaped exactly like:
{
  "title": "Short product-style name (max 60 chars)",
  "description": "One sentence: what it does + for whom + output shape",
  "category": "<one allowed category id>",
  "subcategory": "<one subcategory of that category>",
  "tasks": ["<1-3 canonical task ids>"],
  "tags": ["3-5 short search tags"],
  "difficulty": "beginner|intermediate|advanced",
  "inputType": "<input type>",
  "outputType": "<output type>",
  "tone": "2-4 word tone description",
  "bestFor": ["2-3 audience/role phrases"],
  "platforms": ["chatgpt","claude","gemini"],
  "variables": [{"key":"TOPIC","label":"Human label","placeholder":"example value","suggestions":["option1","option2"]}],
  "body": "The full prompt text"
}

${levelRules(level)}

ALLOWED category → subcategories:
${taxonomyContract()}

ALLOWED tasks: ${CANONICAL_TASKS.join(", ")}
ALLOWED inputType: ${INPUT_TYPES.join(", ")}
ALLOWED outputType: ${OUTPUT_TYPES.join(", ")}
ALLOWED difficulty: ${DIFFICULTIES.join(", ")}`;
}

// ---------- Generation ----------

interface RawGenerated {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  subcategory?: unknown;
  tasks?: unknown;
  tags?: unknown;
  difficulty?: unknown;
  inputType?: unknown;
  outputType?: unknown;
  tone?: unknown;
  bestFor?: unknown;
  platforms?: unknown;
  variables?: unknown;
  body?: unknown;
}

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  return out.length ? out.slice(0, 8) : fallback;
}

function parseJsonLoose(text: string): RawGenerated {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned) as RawGenerated;
  } catch {
    // Model wrapped prose around the object — grab the outermost braces.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as RawGenerated;
    }
    throw new Error("Model did not return valid JSON.");
  }
}

function normalize(raw: RawGenerated, model: string, platformHint?: string | null): AiGeneratedPrompt {
  const catIds = SEED_CATEGORIES.map((c) => c.id);
  const category =
    typeof raw.category === "string" && catIds.includes(raw.category) ? raw.category : null;
  const catSpec = SEED_CATEGORIES.find((c) => c.id === category);
  const subcategory =
    typeof raw.subcategory === "string" &&
    catSpec?.subcategories.includes(raw.subcategory)
      ? raw.subcategory
      : catSpec?.subcategories[0] ?? null;

  let tasks = asStringArray(raw.tasks, ["write"]).filter((t) => CANONICAL_TASKS.includes(t));
  if (!tasks.length) tasks = ["write"];

  let body = typeof raw.body === "string" && raw.body.trim() ? raw.body.trim() : "";
  if (!body) throw new Error("Model returned an empty prompt body.");

  // Variables must match {KEY} tokens actually present in the body.
  type Var = AiGeneratedPrompt["variables"][number];
  let vars: Var[] = Array.isArray(raw.variables)
    ? (raw.variables as Var[])
        .filter((v) => v && typeof v.key === "string" && /^[A-Z][A-Z0-9_]*$/.test(v.key))
        .map((v) => ({
          key: v.key,
          label: typeof v.label === "string" ? v.label : v.key,
          placeholder: typeof v.placeholder === "string" ? v.placeholder : undefined,
          suggestions: asStringArray(v.suggestions ?? [], []).slice(0, 6),
        }))
    : [];
  const present = vars.filter((v) => body.includes(`{${v.key}}`));
  if (present.length === 0) {
    // Guarantee at least one usable variable.
    body = `WHAT I'LL PROVIDE\n- TOPIC: {TOPIC}\n\n${body}`;
    vars = [{ key: "TOPIC", label: "Topic / subject", placeholder: "describe your input" }];
  } else {
    vars = present;
  }

  const platforms = asStringArray(raw.platforms, ["chatgpt", "claude", "gemini"]).filter((p) =>
    /^(chatgpt|claude|gemini|deepseek|grok|perplexity|copilot|mistral|meta)$/.test(p),
  );

  return {
    title:
      typeof raw.title === "string" && raw.title.trim()
        ? raw.title.trim().slice(0, 80)
        : "Untitled generated prompt",
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description.trim()
        : `AI-generated prompt for: ${(platformHint ?? "your request").slice(0, 120)}`,
    category,
    subcategory,
    tasks: tasks.slice(0, 3),
    tags: asStringArray(raw.tags, []).slice(0, 5),
    difficulty: DIFFICULTIES.includes(String(raw.difficulty)) ? String(raw.difficulty) : "intermediate",
    inputType: INPUT_TYPES.includes(String(raw.inputType)) ? String(raw.inputType) : "text",
    outputType: OUTPUT_TYPES.includes(String(raw.outputType)) ? String(raw.outputType) : "text",
    tone: typeof raw.tone === "string" ? raw.tone : "pragmatic and direct",
    bestFor: asStringArray(raw.bestFor, []),
    platforms: platforms.length ? platforms : ["chatgpt", "claude", "gemini"],
    variables: vars,
    body,
    model,
  };
}

/** Generate one library-ready prompt from a natural-language ask. */
export async function generatePromptWithGroq(input: {
  ask: string;
  model?: string | null;
  platform?: string | null;
  level?: PromptLevel;
}): Promise<AiGeneratedPrompt> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");

  const models = await listChatModels();
  const model =
    input.model && models.some((m) => m.id === input.model)
      ? input.model
      : models[0]?.id;
  if (!model) throw new Error("No chat-capable Groq model available.");

  const level = input.level ?? 2;
  const platformLine = input.platform
    ? `\nTarget AI platform: ${input.platform}. Tailor phrasing and structure to it.`
    : "";

  const buildPayload = (maxCompletion: number): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: systemPrompt(level) },
        {
          role: "user",
          content: `Write a reusable library prompt for this request:\n\n${input.ask.trim()}${platformLine}\n\nDetail level: ${LEVEL_META[level].name}.`,
        },
      ],
      temperature: 0.75,
      max_completion_tokens: maxCompletion,
    };
    if (/gpt-oss/i.test(model)) payload.reasoning_effort = "low";
    return payload;
  };

  // Free-tier TPM caps reject oversized requests outright (413). Budgets are
  // sized for the tightest common tier; on 413 we halve once and retry.
  const baseBudget = level === 1 ? 6000 : level === 2 ? 6600 : 7000;

  const callGroq = async (maxCompletion: number) =>
    fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(maxCompletion)),
    });

  let res = await callGroq(baseBudget);
  if (res.status === 413) {
    res = await callGroq(Math.floor(baseBudget / 2));
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(
      res.status === 413
        ? `Groq rate limit reached for ${model} (free-tier tokens-per-minute cap). Wait a minute and retry, or try a lighter model.`
        : `Groq API error ${res.status}: ${detail}`,
    );
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("Groq returned an empty completion.");

  return normalize(parseJsonLoose(content), model, input.platform);
}
