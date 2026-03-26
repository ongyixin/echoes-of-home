import { NextRequest, NextResponse } from "next/server";
import { analyzeFrame } from "@/lib/frame-analysis";
import { liveStore } from "@/lib/live-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      frameBase64,
      mimeType = "image/jpeg",
      previousDescription,
      sessionId,
    } = body;

    if (!frameBase64) {
      return NextResponse.json(
        { error: "frameBase64 is required" },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const result = await analyzeFrame(frameBase64, mimeType, previousDescription);

    // Cache the latest description for Vapi tool lookup
    if (sessionId && result.description) {
      liveStore.setFrame(sessionId, {
        description: result.description,
        capturedAt: result.timestamp,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Frame analysis error:", err);
    const message = err instanceof Error ? err.message : "Frame analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
