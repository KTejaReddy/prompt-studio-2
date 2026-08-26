import { NextRequest, NextResponse } from "next/server";
import { eventRepo, promptRepo } from "@/lib/db/repositories";
import { ensureSeeded } from "@/lib/db/connection";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await ensureSeeded();
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    promptId?: string | null;
    outcome?: string | null;
    meta?: Record<string, unknown>;
  };
  if (!body.type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  try {
    await eventRepo.log({
      type: body.type,
      promptId: body.promptId ?? null,
      outcome: body.outcome ?? null,
      meta: body.meta,
    });
    // Copying or using a prompt counts as real usage.
    if (
      (body.type === "copy" || body.type === "use") &&
      body.promptId &&
      (await promptRepo.byId(body.promptId))
    ) {
      await promptRepo.incrementUsage(body.promptId);
    }
  } catch {
    /* analytics is best-effort; never fail the client */
  }

  return NextResponse.json({ ok: true });
}
