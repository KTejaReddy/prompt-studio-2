import { NextRequest, NextResponse } from "next/server";
import type { Difficulty, SearchFilters, SortOption } from "@/lib/types";
import { promptRepo } from "@/lib/db/repositories";
import { ensureSeeded } from "@/lib/db/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short-lived cache for non-personalised search results. */
const CACHE_HEADER = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
} as const;

function list(params: URLSearchParams, key: string): string[] | undefined {
  const raw = params.getAll(key).flatMap((v) => v.split(","));
  const clean = raw.map((s) => s.trim()).filter(Boolean);
  return clean.length ? clean : undefined;
}

export async function GET(req: NextRequest) {
  await ensureSeeded();
  const p = req.nextUrl.searchParams;
  const q = (p.get("q") ?? "").trim();

  const sort = (p.get("sort") as SortOption | null) ?? "relevance";
  const limit = Math.min(Number(p.get("limit")) || 48, 200);
  const offset = Math.max(Number(p.get("offset")) || 0, 0);

  // Fast path: no query → lightweight browse (avoids importing heavy search modules)
  if (!q) {
    const category = list(p, "category")?.[0];
    const difficulty = list(p, "difficulty") as Difficulty[] | undefined;
    const platform = list(p, "platform");

    const [prompts, total] = await Promise.all([
      promptRepo.browse({
        category,
        difficulty,
        platform,
        sort: sort === "relevance" ? "popular" : sort,
        limit,
        offset,
      }),
      promptRepo.countBrowse({ category, difficulty, platform }),
    ]);

    const results = prompts.map((prompt) => ({
      prompt,
      score: prompt.qualityScore,
      semantic: 0,
      keyword: 0,
      structured: 0,
      reasons: [] as { label: string; detail: string }[],
    }));

    return NextResponse.json(
      { results, total },
      { headers: CACHE_HEADER as unknown as Record<string, string> },
    );
  }

  // Full search path (only imported when there's an actual query)
  const { searchPrompts } = await import("@/lib/services/searchService");
  const { eventRepo } = await import("@/lib/db/repositories");

  const filters: SearchFilters = {
    categories: list(p, "category"),
    subcategories: list(p, "subcategory"),
    platforms: list(p, "platform"),
    difficulty: list(p, "difficulty") as Difficulty[] | undefined,
    featuredOnly: p.get("featured") === "1" || undefined,
    minRating: p.get("minRating") ? Number(p.get("minRating")) : undefined,
  };

  const { results } = await searchPrompts(q, { filters, sort, limit });

  try {
    await eventRepo.log({ type: "search", outcome: "explore", meta: { query: q } });
  } catch {
    /* analytics is best-effort */
  }

  return NextResponse.json(
    { results, total: results.length },
    { headers: CACHE_HEADER as unknown as Record<string, string> },
  );
}
