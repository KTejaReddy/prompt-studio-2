import { ExploreClient } from "@/components/ExploreClient";
import { promptRepo } from "@/lib/db/repositories";
import { listCategories, listPlatforms } from "@/lib/db/repositories";
import { ensureSeeded } from "@/lib/db/connection";
import type { ScoredPrompt } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  await ensureSeeded();

  const category = searchParams.category ?? "";

  // Server-side: fetch initial results using the lightweight browse query
  const [initialPrompts, categories, platforms] = await Promise.all([
    promptRepo.browse({
      category: category || undefined,
      sort: "popular",
      limit: 36,
    }),
    listCategories(),
    listPlatforms(),
  ]);

  const initialResults: ScoredPrompt[] = initialPrompts.map((p) => ({
    prompt: p,
    score: p.qualityScore,
    semantic: 0,
    keyword: 0,
    structured: 0,
    reasons: [],
  }));

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <span className="chip bg-cyan-soft text-cyan-deep">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden />
          Discovery
        </span>
        <h1 className="mt-3 font-display">
          Explore the <span className="text-cyan">library</span>
        </h1>
        <p className="mt-1 text-ink-soft">
          Filter by domain, difficulty and platform — or search to rank every
          prompt by relevance to your need.
        </p>
      </header>
      <ExploreClient
        initialQuery={searchParams.q ?? ""}
        initialCategory={category}
        initialResults={initialResults}
        initialCategories={categories}
        initialPlatforms={platforms}
      />
    </div>
  );
}
