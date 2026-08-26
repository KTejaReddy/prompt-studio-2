import { NextRequest, NextResponse } from "next/server";
import { promptRepo } from "@/lib/db/repositories";
import { relatedTo } from "@/lib/services/matchService";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const prompt = promptRepo.byId(params.id);
  if (!prompt) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const related = relatedTo(params.id, 4);
  return NextResponse.json({ prompt, related });
}
