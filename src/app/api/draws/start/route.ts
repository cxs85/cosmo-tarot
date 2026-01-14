import { NextRequest, NextResponse } from "next/server";
import { createDraw } from "@/lib/store/drawStore";
import { createShuffledDeck } from "@/lib/engine/tarotengine";
import { getCosmicContext } from "@/lib/cosmic/context";
import { DrawInput, DrawState } from "@/lib/types";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body: DrawInput = await request.json();

    // Validate input
    if (!body.name || !body.question || !body.spread) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (body.spread !== 3 && body.spread !== 5) {
      return NextResponse.json(
        { error: "Spread must be 3 or 5" },
        { status: 400 }
      );
    }

    // Create draw state
    const drawId = nanoid();
    const date = body.birthdate ? new Date(body.birthdate) : new Date();
    const cosmicContext = getCosmicContext(date, body.zodiac);

    const drawState: DrawState = {
      drawId,
      input: body,
      deckOrder: createShuffledDeck(),
      selectedCardIds: [],
      revealedCardIds: [],
      meaningGenerated: false,
      createdAt: Date.now(),
      cosmicContext,
    };

    createDraw(drawState);

    return NextResponse.json({
      drawId,
      spread: body.spread,
      cosmicContext: {
        descriptor: cosmicContext.descriptor,
        metaphor: cosmicContext.metaphor,
      },
    });
  } catch (error) {
    console.error("Error starting draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
