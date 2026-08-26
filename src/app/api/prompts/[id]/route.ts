import { NextRequest, NextResponse } from "next/server";
import { promptRepo } from "@/lib/db/repositories";
import { relatedTo } from "@/lib/services/matchService";
import { ensureSeeded } from "@/lib/db/connection";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  await ensureSeeded();
  const prompt = await promptRepo.byId(params.id);
  if (!prompt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const related = await relatedTo(params.id, 4);
  return NextResponse.json({ prompt, related });
}
