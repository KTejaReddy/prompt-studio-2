import { NextResponse } from "next/server";
import {
  listCategories,
  listCommands,
  listPlatforms,
  workflowRepo,
} from "@/lib/db/repositories";
import { ensureSeeded } from "@/lib/db/connection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Taxonomy is seed-static — cache aggressively. */
const TAX_CACHE = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

export async function GET() {
  await ensureSeeded();
  return NextResponse.json(
    {
      categories: await listCategories(),
      platforms: await listPlatforms(),
      commands: await listCommands(),
      workflows: await workflowRepo.list(),
    },
    { headers: TAX_CACHE as unknown as Record<string, string> },
  );
}
