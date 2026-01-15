// src/app/api/draw/select/route.ts
import { getDraw, updateDraw } from "@/lib/draw/store";
import type { DrawSession } from "@/lib/draw/types";

type SelectBody = {
  drawId: string;
  deckIndex: number; // 0..deck.length-1
};

function badRequest(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 400 });
}

function conflict(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 409 });
}

export async function POST(req: Request) {
  let body: SelectBody;
  try {
    body = (await req.json()) as SelectBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const drawId = (body.drawId ?? "").trim();
  const deckIndex = body.deckIndex;

  if (!drawId) return badRequest("drawId is required");
  if (!Number.isInteger(deckIndex)) return badRequest("deckIndex must be an integer");

  const current = getDraw(drawId);
  if (!current) return conflict("draw not found or expired");

  if (current.phase === "REVEALING" || current.phase === "COMPLETE") {
    return conflict("cannot select cards after reveal has started", { phase: current.phase });
  }

  if (deckIndex < 0 || deckIndex >= current.deck.length) {
    return badRequest("deckIndex out of range", { deckLen: current.deck.length });
  }

  const updated = updateDraw(drawId, (s: DrawSession) => {
    // If complete/revealing, refuse in updater too (defense in depth)
    if (s.phase === "REVEALING" || s.phase === "COMPLETE") return s;

    const existingIdx = s.selected.findIndex((x) => x.card.id === s.deck[deckIndex].id);

    // Toggle OFF
    if (existingIdx !== -1) {
      const nextSelected = s.selected
        .filter((_, i) => i !== existingIdx)
        .map((x, i) => ({ ...x, index: i })); // re-index positions

      return {
        ...s,
        phase: nextSelected.length > 0 ? "PICKING" : "SHUFFLED",
        selected: nextSelected,
      };
    }

    // Toggle ON (guard max spread)
    if (s.selected.length >= s.spread) return s; // keep state unchanged; handler returns conflict below

    const nextSelected = [
      ...s.selected,
      {
        index: s.selected.length,
        card: s.deck[deckIndex],
        revealed: false,
      },
    ];

    return {
      ...s,
      phase: "PICKING",
      selected: nextSelected,
    };
  });

  if (!updated) return conflict("draw not found or expired");

  // Detect "max spread" refusal (we kept state unchanged)
  if (
    current.selected.length >= current.spread &&
    updated.selected.length === current.selected.length
  ) {
    return conflict("cannot select more than spread size", {
      spread: current.spread,
      selected: current.selected.length,
    });
  }

  return Response.json({
    ok: true,
    drawId: updated.drawId,
    phase: updated.phase,
    spread: updated.spread,
    selected: updated.selected,
  });
}
