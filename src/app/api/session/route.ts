import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { buildAssistantConfig } from "@/lib/vapi-config";
import { AudioStyle } from "@/lib/types";

const VALID_STYLES = new Set<AudioStyle>(["factual", "warm", "podcast"]);

export async function POST(req: NextRequest) {
  try {
    const { mediaId, style } = await req.json();

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
    }

    const audioStyle: AudioStyle = VALID_STYLES.has(style) ? style : "warm";

    // For demo sessions, no stored context needed
    const isDemo = mediaId === "demo";
    const context = isDemo ? null : store.getMedia(mediaId);

    if (!isDemo && !context) {
      return NextResponse.json(
        { error: "Media not found. Please upload and analyze the media first." },
        { status: 404 },
      );
    }

    const assistantConfig = buildAssistantConfig(mediaId, audioStyle, context ?? null);

    return NextResponse.json({ assistantConfig, mediaId, style: audioStyle });
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
  }
}
