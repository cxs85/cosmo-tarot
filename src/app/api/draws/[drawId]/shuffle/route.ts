import { NextRequest, NextResponse } from "next/server";
import { getDraw, updateDraw } from "@/lib/store/drawStore";
import { createShuffledDeck, canShuffle } from "@/lib/engine/tarotengine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const draw = getDraw(drawId);

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (!canShuffle(draw)) {
      return NextResponse.json(
        { error: "Cannot shuffle after picking has begun" },
        { status: 400 }
      );
    }

    // Reset selection when shuffling (should be empty already, but ensure it)
    updateDraw(drawId, {
      deckOrder: createShuffledDeck(),
      selectedCardIds: [],
      revealedCardIds: [],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error shuffling deck:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
