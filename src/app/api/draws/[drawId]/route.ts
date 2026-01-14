import { NextRequest, NextResponse } from "next/server";
import { getDraw } from "@/lib/store/drawStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drawId: string }> }
) {
  try {
    const { drawId } = await params;
    const draw = getDraw(drawId);

    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    // Return safe state (don't expose full deck order)
    return NextResponse.json({
      drawId: draw.drawId,
      input: draw.input,
      selectedCardIds: draw.selectedCardIds,
      revealedCardIds: draw.revealedCardIds,
      meaningGenerated: draw.meaningGenerated,
      cosmicContext: {
        descriptor: draw.cosmicContext.descriptor,
        metaphor: draw.cosmicContext.metaphor,
      },
    });
  } catch (error) {
    console.error("Error fetching draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
