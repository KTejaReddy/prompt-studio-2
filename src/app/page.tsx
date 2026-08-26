import Link from "next/link";
import { listCategories, promptRepo } from "@/lib/db/repositories";
import { PromptCard } from "@/components/PromptCard";
import { FindBar } from "@/components/FindBar";
import { familyForCategory, FEATURED_ROTATION } from "@/lib/ui/categoryTheme";

export const dynamic = "force-dynamic";

export default function HomePage() {
  // Run independent DB reads concurrently — each hits a different index,
  // so parallelising avoids ~30–80 ms of sequential SQLite round-trips.
  const [categories, counts, featured, trending, recent] = [
    listCategories(),
    promptRepo.countsByCategory(),
    promptRepo.featured(2),
    promptRepo.trending(8),
    promptRepo.recent(4),
  ];
  const totalPrompts = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-12">
      {/* ---------- Hero: an atmospheric multicolor band (§5) ---------- */}
      <section className="animate-fade-up hero-atmosphere relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center ring-1 ring-cyan/15">
        <div className="relative">
          <p className="chip mx-auto mb-4 w-fit bg-white/80 text-ink-soft ring-1 ring-gold/40 shadow-soft">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-light" aria-hidden />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-turquoise" aria-hidden />
            {totalPrompts.toLocaleString()} prompts · {categories.length} domains
          </p>
          <h1 className="font-display text-ink">
            <span className="text-cyan">Find the</span>{" "}
            <span className="text-cyan-deep">right</span>{" "}
            <span className="text-turquoise">prompt.</span>
            <br />
            <span>Don&apos;t reinvent it.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-soft">
            Describe the job below — Promptly finds the match in a library of{" "}
            {totalPrompts.toLocaleString()}, tuned to your platform. Nothing fits?
            Generate writes a new one.
          </p>
          <div className="mt-8">
            <FindBar />
          </div>
        </div>
      </section>

      {/* ---------- Featured: each card its own color world (§9) ---------- */}
      {featured.length > 0 && (
        <section className="animate-fade-in">
          <h2 className="eyebrow mb-4">featured</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((p, i) => {
              const fam = FEATURED_ROTATION[i % FEATURED_ROTATION.length];
              return (
                <div
                  key={p.id}
                  className="rounded-xl2 p-1 shadow-soft ring-1 ring-ink/5 transition-shadow hover:shadow-lift"
                  style={{ backgroundColor: fam.soft }}
                >
                  <PromptCard prompt={p} tinted={false} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------- Categories: color worlds (§11) ---------- */}
      <section className="animate-fade-in">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="eyebrow">browse by domain</h2>
          <Link href="/explore" className="text-sm font-semibold text-cyan-deep hover:underline">
            Explore everything →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const fam = familyForCategory(c.id);
            return (
              <Link
                key={c.id}
                href={`/explore?category=${c.id}`}
                className="group flex items-center gap-3 rounded-xl2 p-3.5 ring-1 ring-ink/5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                style={{ backgroundColor: fam.surface }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg transition-colors"
                  style={{ backgroundColor: fam.soft, color: fam.accent }}
                  aria-hidden
                >
                  {c.icon}
                </span>
                <span className="min-w-0">
                  <span
                    className="block truncate text-sm font-bold transition-colors"
                    style={{ color: fam.deep }}
                  >
                    {c.name}
                  </span>
                  <span className="block font-mono text-xs text-ink-mute">
                    {(counts[c.id] ?? 0).toLocaleString()} prompts
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- Trending rail ---------- */}
      <section className="animate-fade-in">
        <h2 className="eyebrow mb-4">trending this week</h2>
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
          {trending.map((p) => (
            <div key={p.id} className="w-72 shrink-0 snap-start">
              <PromptCard prompt={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Fresh additions ---------- */}
      <section className="animate-fade-in">
        <h2 className="eyebrow mb-4">fresh in the library</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((p) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
