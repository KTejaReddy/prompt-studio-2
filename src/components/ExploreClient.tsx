"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CategoryRecord,
  Difficulty,
  PlatformRecord,
  ScoredPrompt,
} from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
const PER_PAGE = 40;

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
  initialResults,
  initialCategories,
  initialPlatforms,
  initialTotal,
}: {
  initialQuery: string;
  initialCategory: string;
  initialResults: ScoredPrompt[];
  initialCategories: CategoryRecord[];
  initialPlatforms: PlatformRecord[];
  initialTotal: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("relevance");
  const [results, setResults] = useState<ScoredPrompt[]>(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories] = useState<CategoryRecord[]>(initialCategories);
  const [platformList] = useState<PlatformRecord[]>(initialPlatforms);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch a page from the API
  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const offset = (pageNum - 1) * PER_PAGE;
        const p = new URLSearchParams();
        if (debounced.trim()) p.set("q", debounced.trim());
        if (category) p.set("category", category);
        if (difficulties.length) p.set("difficulty", difficulties.join(","));
        if (platforms.length) p.set("platform", platforms.join(","));
        p.set("sort", sort);
        p.set("limit", String(PER_PAGE));
        if (offset > 0) p.set("offset", String(offset));
        const res = await fetch(`/api/search?${p.toString()}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [debounced, category, difficulties, platforms, sort],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    fetchPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggle<T>(list: T[], v: T, set: (l: T[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  // Build page number array: show first, last, and nearby pages with ellipsis
  function pageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const startItem = (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, total);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* ---------- Filters ---------- */}
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
        {/* Header bar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {activeCategory && (
              <>
                <strong>{activeCategory.name}</strong> ·{" "}
              </>
            )}
            {loading
              ? "Loading…"
              : `${total.toLocaleString()} prompts · showing ${startItem.toLocaleString()}–${endItem.toLocaleString()}`}
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink-mute">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="w-auto rounded-xl border-0 bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-cyan"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Prompt grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl2 bg-cyan-soft/50" />
            ))}
          </div>
        ) : results.length === 0 ? (
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
              <PromptCard key={r.prompt.id} prompt={r.prompt} />
            ))}
          </div>
        )}

        {/* ---------- Pagination ---------- */}
        {totalPages > 1 && (
          <nav className="mt-8 flex flex-col items-center gap-3" aria-label="Pagination">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || loading}
                className="btn-secondary disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="px-3 font-mono text-sm text-ink-soft">
                Page {page} of {totalPages.toLocaleString()}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages || loading}
                className="btn-secondary disabled:opacity-30"
              >
                Next →
              </button>
            </div>

            {/* Page number buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {pageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-ink-mute">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    disabled={loading}
                    className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-cyan text-white shadow-glow"
                        : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-cyan-soft/60"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
