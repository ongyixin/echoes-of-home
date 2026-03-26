import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { analyzeImage } from "@/lib/media-analysis";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { mediaId } = await req.json();

    if (!mediaId) {
      return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
    }

    // Check cache
    if (store.hasMedia(mediaId)) {
      return NextResponse.json({ mediaId, cached: true, context: store.getMedia(mediaId) });
    }

    // Find the uploaded file
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const files = await import("fs").then((fs) =>
      fs.readdirSync(uploadDir).filter((f) => f.startsWith(mediaId)),
    );

    if (files.length === 0) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    const fileName = files[0];
    const filePath = path.join(uploadDir, fileName);
    const buffer = await readFile(filePath);
    const base64 = buffer.toString("base64");

    // Determine MIME type from extension
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const mimeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      mp4: "video/mp4",
      mov: "video/quicktime",
      webm: "video/webm",
    };
    const mimeType = mimeMap[ext] ?? "image/jpeg";

    // For video files we cannot directly send to GPT-4o vision — use first frame message
    if (mimeType.startsWith("video/")) {
      // For MVP, return a placeholder analysis for videos
      const context = {
        mediaId,
        fileName,
        fileType: "video" as const,
        scene: "A short video clip. Scene details require frame extraction.",
        people: "Video analysis requires frame extraction — people not yet identified.",
        actions: "Motion and activity visible in video.",
        mood: "Atmosphere detected from video context.",
        notableDetails: "Please note: full video analysis is a premium feature.",
        uncertainties: "All details uncertain without frame extraction.",
        rawAnalysis: "Video placeholder",
        uploadedAt: new Date().toISOString(),
      };
      store.setMedia(context);
      return NextResponse.json({ mediaId, context });
    }

    const context = await analyzeImage(base64, mimeType, mediaId, fileName);
    store.setMedia(context);

    return NextResponse.json({ mediaId, context });
  } catch (err) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
