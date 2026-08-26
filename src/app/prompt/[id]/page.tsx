import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { promptRepo } from "@/lib/db/repositories";
import { relatedTo } from "@/lib/services/matchService";
import { SEED_CATEGORIES } from "@/lib/seed/taxonomy";
import { compactNumber, timeAgo } from "@/lib/ui/format";
import { PromptCard } from "@/components/PromptCard";
import { PromptBody } from "@/components/PromptBody";
import { familyForCategory } from "@/lib/ui/categoryTheme";

export const dynamic = "force-dynamic";

const CATS: Record<string, { name: string; color: string }> = Object.fromEntries(
  SEED_CATEGORIES.map((c) => [c.id, { name: c.name, color: c.color }]),
);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const prompt = promptRepo.byId(params.id);
  return { title: prompt?.title ?? "Prompt" };
}

// Difficulty is semantic color + label (never color alone).
const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: "bg-mint-soft text-mint-deep",
  intermediate: "bg-gold-soft text-gold-deep",
  advanced: "bg-coral-soft text-coral-deep",
};

export default function PromptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const prompt = promptRepo.byId(params.id);
  if (!prompt) notFound();

  const related = relatedTo(params.id, 4);
  const cat = CATS[prompt.category] ?? { name: prompt.category, color: "#FF8A3D" };
  const fam = familyForCategory(prompt.category);

  return (
    <div className="space-y-10">
      <Link href="/explore" className="inline-block text-sm font-semibold text-ink-mute hover:text-cyan-deep">
        ← Back to library
      </Link>

      {/* ---------- Header: the category's color world (§19) ---------- */}
      <header
        className="animate-fade-up rounded-xl2 p-6 ring-1 ring-ink/5"
        style={{ backgroundColor: fam.surface }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: fam.soft, color: fam.deep }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: fam.accent }}
              aria-hidden
            />
            {cat.name}
          </span>
          {prompt.subcategory && (
            <span className="chip bg-white/80 text-ink-soft ring-1 ring-ink/10">
              {prompt.subcategory}
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display">{prompt.title}</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{prompt.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-mute">
          <span className={`chip capitalize ${DIFFICULTY_STYLE[prompt.difficulty] ?? "bg-white text-ink-soft"}`}>
            {prompt.difficulty}
          </span>
          <span>★ {prompt.rating.toFixed(1)} ({compactNumber(prompt.ratingCount)} ratings)</span>
          <span>{compactNumber(prompt.usageCount)} uses</span>
          <span>by {prompt.author}</span>
          <span>updated {timeAgo(prompt.updatedAt)}</span>
        </div>
      </header>

      {/* ---------- Prompt body + one-click copy ---------- */}
      <PromptBody promptText={prompt.promptText} originPromptId={prompt.id} />

      {/* ---------- About ---------- */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        {[
          { label: "Purpose", value: prompt.purpose, accent: "border-t-pink" },
          { label: "Transformation", value: prompt.transformation, accent: "border-t-teal" },
          { label: "Tone", value: prompt.tone, accent: "border-t-orange" },
          {
            label: "Best for",
            value: prompt.bestFor.length ? prompt.bestFor.join(", ") : null,
            accent: "border-t-lavender",
          },
        ]
          .filter((d) => d.value)
          .map((d) => (
            <div key={d.label} className={`card border-t-2 p-4 ${d.accent}`}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-ink-mute">{d.label}</h3>
              <p className="mt-1.5 text-sm font-semibold text-ink">{d.value}</p>
            </div>
          ))}
      </section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="animate-fade-in">
          <h2 className="eyebrow mb-4">related prompts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <PromptCard key={r.prompt.id} prompt={r.prompt} score={r.score} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
