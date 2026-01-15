// src/app/api/draw/reading/route.ts
import { getDraw } from "@/lib/draw/store";
import { makeStubReading } from "@/lib/reading/stub";

function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 });
}

function conflict(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 409 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const drawId = (url.searchParams.get("drawId") ?? "").trim();

  if (!drawId) return badRequest("drawId is required");

  const session = getDraw(drawId);
  if (!session) return conflict("draw not found or expired");

  // Reading is only available after all cards are revealed (or after complete later)
  if (session.phase !== "REVEALED" && session.phase !== "COMPLETE") {
    return conflict("reading not available until all cards are revealed", {
      phase: session.phase,
    });
  }

  const reading = makeStubReading(session);
  return Response.json({ ok: true, reading });
}
