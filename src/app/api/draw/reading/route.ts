// src/app/api/draw/reading/route.ts
import { getDraw } from "@/lib/draw/store";

function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

function notFound(message: string) {
  return Response.json({ ok: false, error: message }, { status: 404 });
}

function conflict(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 409 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const drawId = (url.searchParams.get("drawId") ?? "").trim();

  if (!drawId) return badRequest("drawId is required");

  const session = getDraw(drawId);
  if (!session) return notFound("draw not found or expired");

  // Reading is only available after completion and must already exist
  if (session.phase !== "COMPLETE" || !session.reading) {
    return conflict("reading not available; draw not completed", {
      phase: session.phase,
    });
  }

  return Response.json({ ok: true, reading: session.reading });
}
