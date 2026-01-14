import { NextRequest, NextResponse } from "next/server";
import { getDraw, updateDraw } from "@/lib/store/drawStore";
import { canRevealCards } from "@/lib/engine/tarotengine";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const body = await request.json();
    const { cardId } = body;

    const draw = getDraw(drawId);
    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    if (!canRevealCards(draw)) {
      return NextResponse.json(
        { error: "Cannot reveal cards yet" },
        { status: 400 }
      );
    }

    // Validate card is selected
    if (!draw.selectedCardIds.includes(cardId)) {
      return NextResponse.json(
        { error: "Card not selected" },
        { status: 400 }
      );
    }

    // Add to revealed if not already revealed
    if (!draw.revealedCardIds.includes(cardId)) {
      const newRevealed = [...draw.revealedCardIds, cardId];
      updateDraw(drawId, { revealedCardIds: newRevealed });
      return NextResponse.json({ revealedCardIds: newRevealed });
    }

    return NextResponse.json({ revealedCardIds: draw.revealedCardIds });
  } catch (error) {
    console.error("Error revealing card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
