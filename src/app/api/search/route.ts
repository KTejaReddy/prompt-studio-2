import { NextRequest, NextResponse } from "next/server";
import type { Difficulty, SearchFilters, SortOption } from "@/lib/types";
import { searchPrompts } from "@/lib/services/searchService";
import { eventRepo } from "@/lib/db/repositories";
import { ensureSeeded } from "@/lib/db/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Short-lived cache for non-personalised search results. */
const CACHE_HEADER = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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

  const filters: SearchFilters = {
    categories: list(p, "category"),
    subcategories: list(p, "subcategory"),
    platforms: list(p, "platform"),
    difficulty: list(p, "difficulty") as Difficulty[] | undefined,
    featuredOnly: p.get("featured") === "1" || undefined,
    minRating: p.get("minRating") ? Number(p.get("minRating")) : undefined,
  };

  const sort = (p.get("sort") as SortOption | null) ?? "relevance";
  const limit = Math.min(Number(p.get("limit")) || 24, 60);

  const { results } = await searchPrompts(q, { filters, sort, limit });

  if (q) {
    try {
      await eventRepo.log({ type: "search", outcome: "explore", meta: { query: q } });
    } catch {
      /* analytics is best-effort */
    }
  }

  return NextResponse.json({ results, total: results.length }, { headers: CACHE_HEADER as unknown as Record<string, string> });
}
