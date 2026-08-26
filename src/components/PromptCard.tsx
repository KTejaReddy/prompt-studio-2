import Link from "next/link";
import type { Difficulty, MatchReason, PromptRecord } from "@/lib/types";
import { SEED_CATEGORIES } from "@/lib/seed/taxonomy";
import { compactNumber, scorePercent } from "@/lib/ui/format";
import { familyForCategory } from "@/lib/ui/categoryTheme";

// Difficulty is semantic: mint = beginner, gold = intermediate, coral = advanced.
const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  beginner: "bg-mint-soft text-mint-deep",
  intermediate: "bg-gold-soft text-gold-deep",
  advanced: "bg-coral-soft text-coral-deep",
};

const CATEGORY_META: Record<
  string,
  { name: string; icon: string }
> = Object.fromEntries(
  SEED_CATEGORIES.map((c) => [c.id, { name: c.name, icon: c.icon }]),
);

/**
 * Refined match indicator (§14) — soft pill, never a neon bar.
 * Mint/turquoise = strong, gold = related, coral = low. Always with % text.
 */
export function ScoreBadge({ score }: { score: number }) {
  const pct = scorePercent(score);
  const style =
    score >= 0.9
      ? "bg-mint-soft text-mint-deep ring-1 ring-mint/30"
      : score >= 0.75
        ? "bg-gold-soft text-gold-deep ring-1 ring-gold/40"
        : "bg-coral-soft text-coral-deep ring-1 ring-coral/30";
  const dot =
    score >= 0.9 ? "bg-mint" : score >= 0.75 ? "bg-gold" : "bg-coral";
  return (
    <span className={`chip ${style}`} title="Calibrated match score">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {pct}% match
    </span>
  );
}

export function PromptCard({
  prompt,
  score,
  reasons,
  tinted = true,
}: {
  prompt: PromptRecord;
  score?: number;
  reasons?: MatchReason[];
  /** false → white card (for slots already wrapped in a tinted frame). */
  tinted?: boolean;
}) {
  const fam = familyForCategory(prompt.category);
  const meta = CATEGORY_META[prompt.category];

  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="card group flex flex-col gap-2 p-4 animate-fade-up"
      style={tinted ? { backgroundColor: fam.surface } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: fam.soft, color: fam.deep }}
        >
          <span aria-hidden className="text-[13px] leading-none">{meta?.icon}</span>
          {meta?.name ?? prompt.category}
        </span>
        {score != null && <ScoreBadge score={score} />}
      </div>

      <h3 className="font-headline text-lg leading-snug text-ink decoration-dashed underline-offset-4 group-hover:underline" style={{ textDecorationColor: fam.accent }}>
        {prompt.title}
      </h3>
      <p className="line-clamp-2 text-sm text-ink-soft">{prompt.description}</p>

      {reasons && reasons.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {reasons.slice(0, 2).map((r) => (
            <li key={r.label} className="truncate text-xs text-ink-mute">
              <span className="font-semibold text-ink-soft">{r.label}:</span>{" "}
              {r.detail}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-ink-mute">
        <span className={`chip ${DIFFICULTY_STYLE[prompt.difficulty]}`}>
          {prompt.difficulty}
        </span>
        <span>★ {prompt.rating.toFixed(1)}</span>
        <span aria-hidden>·</span>
        <span>{compactNumber(prompt.usageCount)} uses</span>
        {prompt.isFeatured && (
          <>
            <span aria-hidden>·</span>
            <span className="font-mono font-medium" style={{ color: fam.deep }}>
              featured
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
