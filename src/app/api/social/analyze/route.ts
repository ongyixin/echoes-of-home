import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/media-analysis";
import { store } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";
import { SocialPlatform } from "@/lib/social-types";

export async function POST(req: NextRequest) {
  try {
    const { mediaUrl, platform, caption } = await req.json();

    if (!mediaUrl) {
      return NextResponse.json(
        { error: "mediaUrl is required" },
        { status: 400 },
      );
    }

    // Fetch the image from the social media URL
    const imageRes = await fetch(mediaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EchoesOfHome/1.0)",
      },
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch media: ${imageRes.status} ${imageRes.statusText}` },
        { status: 502 },
      );
    }

    const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";

    // Only support images (TikTok cover images, Instagram photos)
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image media can be analyzed. For videos, use the thumbnail/cover image." },
        { status: 400 },
      );
    }

    const buffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const mediaId = uuidv4();
    const fileName = `${platform ?? "social"}-${mediaId}.jpg`;

    const context = await analyzeImage(base64, contentType, mediaId, fileName);

    // Optionally enrich context with caption
    if (caption) {
      context.notableDetails = `${context.notableDetails} Caption: "${caption}"`;
    }

    store.setMedia(context);

    return NextResponse.json({ mediaId, context });
  } catch (err) {
    console.error("Social analyze error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
