import { NextRequest, NextResponse } from "next/server";
import { getDraw, updateDraw } from "@/lib/store/drawStore";
import { getCardById } from "@/lib/decks/lenormand";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json(
        { error: "Missing cardId" },
        { status: 400 }
      );
    }

    const draw = getDraw(drawId);
    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    // Validate card exists
    const card = getCardById(cardId);
    if (!card) {
      return NextResponse.json({ error: "Invalid card" }, { status: 400 });
    }

    // Toggle selection
    const currentSelection = draw.selectedCardIds;
    const maxSelection = draw.input.spread;

    if (currentSelection.includes(cardId)) {
      // Deselect
      const newSelection = currentSelection.filter((id) => id !== cardId);
      updateDraw(drawId, { selectedCardIds: newSelection });
      return NextResponse.json({ selectedCardIds: newSelection });
    } else {
      // Select (enforce max)
      if (currentSelection.length >= maxSelection) {
        return NextResponse.json(
          { error: `Maximum ${maxSelection} cards allowed` },
          { status: 400 }
        );
      }
      const newSelection = [...currentSelection, cardId];
      updateDraw(drawId, { selectedCardIds: newSelection });
      return NextResponse.json({ selectedCardIds: newSelection });
    }
  } catch (error) {
    console.error("Error selecting card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
