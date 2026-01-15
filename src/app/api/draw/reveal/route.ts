// src/app/api/draw/reveal/route.ts
import { getDraw, updateDraw } from "@/lib/draw/store";
import type { DrawSession } from "@/lib/draw/types";

type RevealBody = {
  drawId: string;
  selectedIndex: number; // 0..spread-1 (index in selected array)
};

function badRequest(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 400 });
}

function conflict(message: string, details?: unknown) {
  return Response.json({ ok: false, error: message, details }, { status: 409 });
}

function nextUnrevealedIndex(s: DrawSession): number {
  return s.selected.findIndex((c) => !c.revealed);
}

export async function POST(req: Request) {
  let body: RevealBody;
  try {
    body = (await req.json()) as RevealBody;
  } catch {
    return badRequest("Invalid JSON body");
  }

  const drawId = (body.drawId ?? "").trim();
  const selectedIndex = body.selectedIndex;

  if (!drawId) return badRequest("drawId is required");
  if (!Number.isInteger(selectedIndex)) return badRequest("selectedIndex must be an integer");

  const current = getDraw(drawId);
  if (!current) return conflict("draw not found or expired");

  if (current.phase === "COMPLETE") {
    return conflict("cannot reveal after completion", { phase: current.phase });
  }

  // Must have chosen exactly N cards before reveal starts
  if (current.selected.length !== current.spread) {
    return conflict("must select exactly spread cards before revealing", {
      spread: current.spread,
      selected: current.selected.length,
      phase: current.phase,
    });
  }

  if (selectedIndex < 0 || selectedIndex >= current.spread) {
    return badRequest("selectedIndex out of range", { spread: current.spread });
  }

  // Strict sequential reveal: you may only reveal the next unrevealed card
  const expected = nextUnrevealedIndex(current);
  if (expected === -1) {
    // Already all revealed
    return conflict("all selected cards are already revealed", { phase: current.phase });
  }
  if (selectedIndex !== expected) {
    return conflict("must reveal cards in order", { expectedIndex: expected });
  }

  const updated = updateDraw(drawId, (s: DrawSession) => {
    if (s.phase === "COMPLETE") return s;
    if (s.selected.length !== s.spread) return s;

    const exp = nextUnrevealedIndex(s);
    if (exp === -1) return s;
    if (selectedIndex !== exp) return s;

    const nextSelected = s.selected.map((c, i) =>
      i === selectedIndex ? { ...c, revealed: true } : c
    );

    const allRevealed = nextSelected.every((c) => c.revealed);

    return {
      ...s,
      phase: allRevealed ? "REVEALED" : "REVEALING",
      selected: nextSelected,
    };
  });

  if (!updated) return conflict("draw not found or expired");

  // Detect if updater refused (e.g., wrong order) by checking reveal status didn't change
  if (updated.selected[selectedIndex]?.revealed !== true) {
    // Recompute current expected for better error info
    const cur = getDraw(drawId);
    const exp2 = cur ? nextUnrevealedIndex(cur) : expected;
    return conflict("reveal not applied (likely wrong order or invalid phase)", {
      expectedIndex: exp2,
      phase: cur?.phase ?? current.phase,
    });
  }

  return Response.json({
    ok: true,
    drawId: updated.drawId,
    phase: updated.phase,
    selected: updated.selected,
  });
}
