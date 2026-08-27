"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type {
  CategoryRecord,
  Difficulty,
  PlatformRecord,
  ScoredPrompt,
} from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];
const PAGE_SIZE = 48;

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
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [categories] = useState<CategoryRecord[]>(initialCategories);
  const [platformList] = useState<PlatformRecord[]>(initialPlatforms);
  const offsetRef = useRef(initialResults.length);
  const abortRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasMore = results.length < total;

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const p = new URLSearchParams();
        if (debounced.trim()) p.set("q", debounced.trim());
        if (category) p.set("category", category);
        if (difficulties.length) p.set("difficulty", difficulties.join(","));
        if (platforms.length) p.set("platform", platforms.join(","));
        p.set("sort", sort);
        p.set("limit", String(PAGE_SIZE));
        if (offset > 0) p.set("offset", String(offset));
        const res = await fetch(`/api/search?${p.toString()}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        const newResults: ScoredPrompt[] = data.results ?? [];
        if (append) {
          setResults((prev) => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        setTotal(data.total ?? newResults.length);
        offsetRef.current = append ? offset + newResults.length : newResults.length;
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [debounced, category, difficulties, platforms, sort],
  );

  // Reset & fetch first page when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!initialQuery.trim() && !initialCategory) return;
    }
    offsetRef.current = 0;
    fetchPage(0, false);
    return () => abortRef.current?.abort();
  }, [fetchPage, initialQuery, initialCategory]);

  function toggle<T>(list: T[], v: T, set: (l: T[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  // --- Virtualization ---
  const COLS = 3; // xl:grid-cols-3

  const rowVirtualizer = useVirtualizer({
    count: total,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220, // approximate card height in px
    overscan: 10, // render 10 extra rows above/below viewport for smoother scrolling
  });

  // Map virtual row index → prompt data (filled as pages load)
  const promptByIndex = useMemo(() => {
    const map = new Map<number, ScoredPrompt>();
    results.forEach((r, i) => map.set(i, r));
    return map;
  }, [results]);

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Pre-fetch next page when user scrolls near the end
  useEffect(() => {
    const lastVirtual = virtualRows[virtualRows.length - 1];
    if (!lastVirtual) return;
    // When user scrolls within 3 rows of the end, fetch more
    if (lastVirtual.index >= results.length - COLS * 5 && hasMore && !loadingMore && !loading) {
      fetchPage(offsetRef.current, true);
    }
  }, [virtualRows, results.length, hasMore, loadingMore, loading, fetchPage]);

  const totalRows = Math.ceil(total / COLS);

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {activeCategory && (
              <>
                <strong>{activeCategory.name}</strong> ·{" "}
              </>
            )}
            {loading
              ? "Loading…"
              : `${total.toLocaleString()} prompts`}
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

        {loading && results.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-ink-soft">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
              <span className="text-sm">Loading prompts…</span>
            </div>
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
          <>
            {/* Virtualized grid — only renders visible rows */}
            <div
              ref={parentRef}
              className="overflow-auto"
              style={{ height: "calc(100vh - 200px)" }}
            >
              <div
                className="relative w-full"
                style={{ height: `${totalRows * 240}px` }}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {virtualRows.map((vr) => {
                    const rowIndex = vr.index;
                    const prompt = promptByIndex.get(rowIndex);
                    if (!prompt) {
                      // Not loaded yet — show a subtle placeholder
                      return (
                        <div
                          key={`placeholder-${rowIndex}`}
                          className="h-[210px] animate-pulse rounded-xl2 bg-cyan-soft/30"
                        />
                      );
                    }
                    return (
                      <div key={prompt.prompt.id}>
                        <PromptCard prompt={prompt.prompt} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-ink-soft">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
                Loading more…
              </div>
            )}
            {!loadingMore && !hasMore && results.length > 0 && (
              <p className="py-4 text-center text-xs text-ink-mute">
                All {total.toLocaleString()} prompts loaded
              </p>
            )}
          </>
        )}
      </section>

      {/* ---------- Back to top ---------- */}
      {showTop && (
        <button
          onClick={() => {
            parentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 z-50 grid h-10 w-10 place-items-center rounded-full bg-cyan text-white shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
          aria-label="Back to top"
          style={{ animation: "fade-in 0.2s ease both" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
