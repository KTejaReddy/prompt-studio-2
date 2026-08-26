import { NextResponse } from "next/server";
import {
  listCategories,
  listCommands,
  listPlatforms,
  workflowRepo,
} from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Taxonomy is seed-static — cache aggressively. */
const TAX_CACHE = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export async function GET() {
  return NextResponse.json(
    {
      categories: listCategories(),
      platforms: listPlatforms(),
      commands: listCommands(),
      workflows: workflowRepo.list(),
    },
    { headers: TAX_CACHE as unknown as Record<string, string> },
  );
}
