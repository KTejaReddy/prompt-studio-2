import { NextRequest, NextResponse } from "next/server";
import {
  generatePromptWithGroq,
  groqConfigured,
  LEVEL_META,
  listChatModels,
  parseLevel,
} from "@/lib/services/generationService";
import { eventRepo } from "@/lib/db/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/generate → chat-capable Groq models, levels, config status. */
export async function GET() {
  if (!groqConfigured()) {
    return NextResponse.json({ configured: false, models: [], levels: LEVEL_META });
  }
  try {
    const models = await listChatModels();
    return NextResponse.json({ configured: true, models, levels: LEVEL_META }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } as Record<string, string>,
    });
  } catch (e) {
    return NextResponse.json(
      {
        configured: true,
        models: [],
        levels: LEVEL_META,
        error: e instanceof Error ? e.message : "catalog error",
      },
      { status: 502 },
    );
  }
}

/** POST /api/generate { ask, model?, platform? } → one generated prompt. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ask = typeof body?.ask === "string" ? body.ask.trim() : "";
  if (ask.length < 8) {
    return NextResponse.json(
      { error: "Describe what you want the prompt to do (at least a few words)." },
      { status: 400 },
    );
  }

  try {
    const result = await generatePromptWithGroq({
      ask,
      model: typeof body?.model === "string" ? body.model : null,
      platform: typeof body?.platform === "string" ? body.platform : null,
      level: parseLevel(body?.level),
    });
    try {
      eventRepo.log({ type: "generate", meta: { model: result.model } });
    } catch {
      /* analytics is best-effort */
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed." },
      { status: 502 },
    );
  }
}
