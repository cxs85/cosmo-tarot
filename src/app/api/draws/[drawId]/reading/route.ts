import { NextRequest, NextResponse } from "next/server";
import { getReading, getDraw } from "@/lib/store/drawStore";

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

    const reading = getReading(drawId);
    if (!reading) {
      return NextResponse.json(
        { error: "Reading not ready", ready: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ reading, ready: true });
  } catch (error) {
    console.error("Error fetching reading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
