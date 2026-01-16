import { getDraw, updateDraw } from "@/lib/draw/store";
import type { DrawSession } from "@/lib/draw/types";
import { generateReadingLLM } from "@/lib/reading/llm";



function json(status: number, payload: unknown) {
  return Response.json(payload, { status });
}


export async function POST(req: Request) {

    console.log(
        "OPENAI_API_KEY loaded:",
        Boolean(process.env.OPENAI_API_KEY)
      );
      
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "invalid JSON body" });
  }

  const drawId = typeof body?.drawId === "string" ? body.drawId.trim() : "";
  if (!drawId) return json(400, { ok: false, error: "drawId is required" });

  const session = getDraw(drawId);
  if (!session) return json(404, { ok: false, error: "draw not found or expired" });

  // Idempotent: already completed → return stored artifact
  if (session.phase === "COMPLETE" && session.reading) {
    return json(200, { ok: true, reading: session.reading });
  }

  // Gate: must be fully revealed
  if (session.phase !== "REVEALED") {
    return json(409, {
      ok: false,
      error: "cannot complete unless phase is REVEALED",
      details: { phase: session.phase },
    });
  }

  // Safety: must have full spread selected and all revealed
  if (session.selected.length !== session.spread) {
    return json(409, {
      ok: false,
      error: "cannot complete unless selected length equals spread",
      details: { spread: session.spread, selected: session.selected.length },
    });
  }
  if (!session.selected.every((c) => c.revealed)) {
    return json(409, { ok: false, error: "cannot complete unless all selected cards are revealed" });
  }

  // Generate stub artifact (Slice D uses stub; Slice E swaps generator to LLM)
  let reading;
  try {
    reading = await generateReadingLLM(session);
  } catch (e) {
    return json(500, {
      ok: false,
      error: "LLM reading generation failed",
      details: e instanceof Error ? e.message : String(e),
    });
  }
  


  const updated = updateDraw(drawId, (s: DrawSession) => {
    // Re-check inside update for basic race safety
    if (s.phase === "COMPLETE" && s.reading) return s;
    if (s.phase !== "REVEALED") return s;

    return {
      ...s,
      phase: "COMPLETE",
      completedAt: Date.now(),
      reading,
    };
  });

  if (!updated) return json(404, { ok: false, error: "draw not found or expired (post-update)" });

  if (updated.phase === "COMPLETE" && updated.reading) {
    return json(200, { ok: true, reading: updated.reading });
  }

  // If we got here, phase changed between reads; treat as conflict
  return json(409, { ok: false, error: "complete refused due to phase change", details: { phase: updated.phase } });
}
