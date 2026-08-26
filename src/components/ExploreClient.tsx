"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CategoryRecord,
  Difficulty,
  PlatformRecord,
  ScoredPrompt,
} from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

const SORTS = [
  { id: "relevance", label: "Relevance" },
  { id: "popular", label: "Most used" },
  { id: "rating", label: "Top rated" },
  { id: "recent", label: "Newest" },
  { id: "quality", label: "Quality" },
] as const;

export function ExploreClient({
  initialQuery,
  initialCategory,
}: {
  initialQuery: string;
  initialCategory: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("relevance");
  const [results, setResults] = useState<ScoredPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [platformList, setPlatformList] = useState<PlatformRecord[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Taxonomy for filters (fetched once).
  useEffect(() => {
    fetch("/api/taxonomy")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        setPlatformList(d.platforms ?? []);
      })
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debounced.trim()) p.set("q", debounced.trim());
      if (category) p.set("category", category);
      if (difficulties.length) p.set("difficulty", difficulties.join(","));
      if (platforms.length) p.set("platform", platforms.join(","));
      p.set("sort", sort);
      p.set("limit", "36");
      const res = await fetch(`/api/search?${p.toString()}`, { signal: ctrl.signal });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      /* aborted */
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [debounced, category, difficulties, platforms, sort]);

  useEffect(() => {
    void fetchResults();
    return () => abortRef.current?.abort();
  }, [fetchResults]);

  function toggle<T>(list: T[], v: T, set: (l: T[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* ---------- Filters: tinted discovery panel (§15) ---------- */}
      <aside className="space-y-5 self-start rounded-xl2 bg-cyan-surface p-4 ring-1 ring-cyan/25 shadow-soft lg:sticky lg:top-20">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts…"
          className="field"
          aria-label="Search prompts"
        />

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">Domain</h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategory("")}
              className={`chip ${
                !category
                  ? "bg-cyan text-white shadow-glow"
                  : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-cyan-soft/60"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? "" : c.id)}
                title={c.subcategories.join(", ")}
                className={`chip transition-transform ${
                  category === c.id
                    ? "text-white shadow-soft"
                    : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-cyan-soft/60"
                }`}
                style={category === c.id ? { backgroundColor: c.color } : undefined}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">Difficulty</h3>
          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => toggle(difficulties, d, setDifficulties)}
                className={`chip capitalize ${
                  difficulties.includes(d)
                    ? "bg-gold text-gold-deep shadow-soft"
                    : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-gold-soft/60"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-mute">Platform</h3>
          <div className="flex flex-wrap gap-1.5">
            {platformList.slice(0, 8).map((pl) => (
              <button
                key={pl.id}
                onClick={() => toggle(platforms, pl.id, setPlatforms)}
                className={`chip transition-colors ${
                  platforms.includes(pl.id)
                    ? "bg-sky text-white shadow-soft"
                    : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-sky-soft/60"
                }`}
                style={
                  platforms.includes(pl.id) ? { backgroundColor: pl.color } : undefined
                }
              >
                {pl.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ---------- Results ---------- */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {activeCategory && (
              <>
                <strong>{activeCategory.name}</strong> ·{" "}
              </>
            )}
            {loading ? "Searching…" : `${results.length} prompts`}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-mute">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="w-auto rounded-xl border-0 bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-ink/10 outline-none              focus:ring-2 focus:ring-cyan"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl2 bg-cyan-soft/50" />
            ))}
          </div>
        ) : results.length === 0 ? (
          /* Compact, colorful empty state (§18) — abstract, no robot illustrations */
          <div className="card flex flex-col items-center p-10 text-center">
            <div className="relative mb-4 h-14 w-20" aria-hidden>
              <span className="absolute left-0 top-1 h-10 w-10 rounded-full bg-coral/30" />
              <span className="absolute left-5 top-0 h-12 w-12 rounded-full bg-gold/35" />
              <span className="absolute left-10 top-2 h-10 w-10 rounded-full bg-turquoise/30" />
            </div>
            <p className="font-headline text-lg">No prompts match those filters.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Try removing a filter or broadening your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <PromptCard
                key={r.prompt.id}
                prompt={r.prompt}
                score={debounced.trim() ? r.score : undefined}
                reasons={debounced.trim() ? r.reasons : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
