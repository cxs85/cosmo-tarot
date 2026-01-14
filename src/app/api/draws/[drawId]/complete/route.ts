import { NextRequest, NextResponse } from "next/server";
import { getDraw, updateDraw, saveReading, getReading } from "@/lib/store/drawStore";
import { canRevealMeaning } from "@/lib/engine/tarotengine";
import { generateReading } from "@/lib/ai/readingGenerator";

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

    // Check if reading already generated
    const existingReading = getReading(drawId);
    if (existingReading) {
      return NextResponse.json({ reading: existingReading });
    }

    if (!canRevealMeaning(draw)) {
      return NextResponse.json(
        { error: "Cannot generate meaning yet" },
        { status: 400 }
      );
    }

    // Generate reading (exactly one LLM call)
    const reading = await generateReading(draw);

    // Save reading and mark as generated
    saveReading(drawId, reading);
    updateDraw(drawId, { meaningGenerated: true });

    return NextResponse.json({ reading });
  } catch (error) {
    console.error("Error completing draw:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
