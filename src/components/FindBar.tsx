"use client";

import Link from "next/link";
import { useState } from "react";
import type { FindDecision } from "@/lib/types";
import { PromptCard, ScoreBadge } from "@/components/PromptCard";

const EXAMPLES = [
  "Review my Python code for security issues",
  "Summarize a 40-page market report into key takeaways",
  "Turn my meeting notes into action items and follow-up emails",
  "Plan a 4-week study schedule for the AWS exam with quizzes",
];

// Staged understanding indicator (§15) — a sequence, not a neon loader.
const STEPS = [
  { label: "Understanding request", dot: "bg-cyan", delay: "0s" },
  { label: "Searching the library", dot: "bg-coral", delay: "0.45s" },
  { label: "Comparing prompts", dot: "bg-gold", delay: "0.9s" },
  { label: "Finding best match", dot: "bg-turquoise", delay: "1.35s" },
];

// Result color system (§14): strong=turquoise/mint, related=gold,
// workflow=lavender, new/pink=coral-pink. Label always accompanies color.
const VERDICT_STYLE: Record<FindDecision["verdict"], string> = {
  strong: "bg-mint-surface text-turquoise-deep ring-1 ring-turquoise/30",
  related: "bg-gold-surface text-gold-deep ring-1 ring-gold/40",
  compose: "bg-lavender-surface text-violet-deep ring-1 ring-lavender/40",
  generate: "bg-cyan-surface text-cyan-deep ring-1 ring-cyan/30",
};

const VERDICT_LABEL: Record<FindDecision["verdict"], string> = {
  strong: "Strong match found",
  related: "Closely related",
  compose: "Composed for you",
  generate: "No close match — create it",
};

const STEP_BADGES = [
  "bg-gradient-workflow",
  "bg-gradient-find",
  "bg-gradient-generate",
  "bg-gradient-explore",
];

export function FindBar() {
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState<FindDecision | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setDecision((await res.json()) as FindDecision);
    } catch {
      setError("Something went wrong while matching your request. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------- Search deck: cream container + white well + edge strip ---------- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="search-deck text-left"
      >
        <div className="search-well p-4">
          <label
            htmlFor="find-input"
            className="mb-2 block font-mono text-xs font-semibold uppercase tracking-widest text-ink-mute"
          >
            What do you need?
          </label>
          <div className="flex items-end gap-3">
            <input
              id="find-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="describe the job — e.g. review my python code for security issues"
              className="hero-input min-w-0 flex-1 border-0 border-b-2 border-cyan/30 bg-transparent pb-2 font-body text-[17px] text-ink placeholder:text-ink-faint focus:border-cyan focus:outline-none"
              aria-label="Describe what you need"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-find shrink-0 !px-5"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Finding…
                </>
              ) : (
                "Find"
              )}
            </button>
          </div>
        </div>
        {/* The multicolor edge — coral → orange → gold → mint */}
        <div className="edge-strip" aria-hidden />
      </form>

      {/* Example queries */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              run(ex);
            }}
            className="rounded-full bg-white px-3 py-1.5 font-mono text-xs text-ink-soft ring-1 ring-ink/10 transition-colors hover:bg-cyan-soft/60 hover:text-ink"
          >
            {ex.length > 46 ? `${ex.slice(0, 46)}…` : ex}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-coral-surface px-4 py-3 text-sm font-semibold text-coral-deep ring-1 ring-coral/20">
          {error}
        </p>
      )}

      {/* ---------- Staged progress ---------- */}
      {loading && (
        <div className="mt-8 rounded-xl2 bg-white p-5 ring-1 ring-ink/5 shadow-soft">
          <ol className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {STEPS.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span
                  className={`step-dot ${s.dot}`}
                  style={{ animationDelay: s.delay }}
                  aria-hidden
                />
                <span className="text-xs text-ink-soft">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ---------- Results ---------- */}
      {decision && (
        <div className="mt-8 space-y-5 text-left animate-fade-up">
          <div className={`rounded-xl2 px-4 py-3 text-sm font-semibold ${VERDICT_STYLE[decision.verdict]}`}>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span aria-hidden>
                  {decision.verdict === "strong" ? "✓" : decision.verdict === "generate" ? "✦" : "≈"}
                </span>
                <span>{VERDICT_LABEL[decision.verdict]} — {decision.message}</span>
              </span>
              {decision.verdict === "generate" && (
                <Link
                  href={`/generate?ask=${encodeURIComponent(decision.intent.rawQuery)}`}
                  className="underline decoration-dotted underline-offset-2 hover:text-cyan-deep"
                >
                  Generate it with AI →
                </Link>
              )}
            </span>
          </div>

          {/* Detected structure */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-mono lowercase text-ink-mute">understood as</span>
            {decision.intent.tasks.slice(0, 3).map((t) => (
              <span key={t.task + t.phrase} className="chip bg-cyan-soft text-cyan-deep">
                {t.task}
              </span>
            ))}
            {decision.intent.domain && (
              <span className="chip bg-turquoise-soft text-turquoise-deep">
                {decision.intent.domain}
              </span>
            )}
            {decision.intent.inputType && (
              <span className="chip bg-orange-soft text-orange-deep">
                in: {decision.intent.inputType}
              </span>
            )}
            {decision.intent.outputType && (
              <span className="chip bg-mint-soft text-mint-deep">
                out: {decision.intent.outputType}
              </span>
            )}
          </div>

          {/* Composed workflow — violet identity, color-progression nodes (§16) */}
          {decision.suggestionWorkflow && (
            <div className="rounded-xl2 bg-lavender-surface p-5 ring-1 ring-lavender/40 shadow-soft">
              <div className="mb-3 flex items-center gap-2">
                <span className="chip bg-violet text-white">Workflow</span>
                <h3 className="font-headline text-lg">{decision.suggestionWorkflow.name}</h3>
              </div>
              <ol className="space-y-2 border-l-2 border-dashed border-violet/25 pl-4">
                {decision.suggestionWorkflow.steps.map((s, i) => (
                  <li
                    key={`${s.promptId}-${i}`}
                    className="relative flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-lavender/30"
                  >
                    <span
                      className={`absolute -left-[26px] grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                        STEP_BADGES[i % STEP_BADGES.length]
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <Link href={`/prompt/${s.promptId}`} className="text-sm font-bold hover:text-violet-deep">
                        {s.title} →
                      </Link>
                      <p className="text-xs text-ink-soft">{s.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Matches */}
          {decision.matches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decision.matches.map((m) => (
                <PromptCard key={m.prompt.id} prompt={m.prompt} score={m.score} reasons={m.reasons} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              Nothing close yet — try the Generate tab to create one with AI.
            </p>
          )}

          {decision.verdict !== "strong" && decision.matches.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-gold-surface p-4 ring-1 ring-gold/40 shadow-soft">
              <p className="text-sm text-ink-soft">
                Best available: <strong>{decision.matches[0].prompt.title}</strong>{" "}
                <ScoreBadge score={decision.matches[0].score} />
              </p>
              <Link href={`/prompt/${decision.matches[0].prompt.id}`} className="btn-secondary shrink-0">
                Open &amp; customize
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
